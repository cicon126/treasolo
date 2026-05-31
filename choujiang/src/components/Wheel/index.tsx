import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, Canvas } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { Prize } from '@/types/prize';
import styles from './index.module.scss';

interface WheelProps {
  prizes: Prize[];
  onSpinEnd: (prize: Prize) => void;
  disabled?: boolean;
}

const WHEEL_SIZE_PX = 300;

const Wheel: React.FC<WheelProps> = ({ prizes, onSpinEnd, disabled = false }) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const canvasId = 'wheelCanvas';
  const imageMapRef = useRef<Record<string, any>>({});
  const drawPendingRef = useRef(false);

  const drawWheel = useCallback(() => {
    if (prizes.length === 0) return;

    const query = Taro.createSelectorQuery();
    query.select(`#${canvasId}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0]) {
          console.error('[Wheel] Canvas node not found');
          return;
        }

        const canvas = res[0].node;
        if (!canvas) {
          console.error('[Wheel] Canvas node is null');
          return;
        }

        const ctx = canvas.getContext('2d');
        const dpr = Taro.getSystemInfoSync().pixelRatio || 2;
        canvas.width = WHEEL_SIZE_PX * dpr;
        canvas.height = WHEEL_SIZE_PX * dpr;
        ctx.scale(dpr, dpr);

        const centerX = WHEEL_SIZE_PX / 2;
        const centerY = WHEEL_SIZE_PX / 2;
        const radius = WHEEL_SIZE_PX / 2 - 4;

        const sectorAngle = (2 * Math.PI) / prizes.length;

        prizes.forEach((prize, index) => {
          const startAngle = index * sectorAngle - Math.PI / 2;
          const endAngle = startAngle + sectorAngle;

          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, startAngle, endAngle);
          ctx.closePath();
          ctx.fillStyle = prize.color;
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, startAngle, endAngle);
          ctx.closePath();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();

          const midAngle = startAngle + sectorAngle / 2;
          const textRadius = radius * 0.65;
          const imgRadius = radius * 0.42;

          const imgX = centerX + imgRadius * Math.cos(midAngle);
          const imgY = centerY + imgRadius * Math.sin(midAngle);

          const imgEl = imageMapRef.current[prize.id];
          if (imgEl) {
            const imgSize = 28;
            const cornerRadius = 4;

            ctx.save();
            ctx.translate(imgX, imgY);
            ctx.rotate(midAngle + Math.PI / 2);

            ctx.beginPath();
            ctx.moveTo(-imgSize / 2 + cornerRadius, -imgSize / 2);
            ctx.lineTo(imgSize / 2 - cornerRadius, -imgSize / 2);
            ctx.arcTo(imgSize / 2, -imgSize / 2, imgSize / 2, -imgSize / 2 + cornerRadius, cornerRadius);
            ctx.lineTo(imgSize / 2, imgSize / 2 - cornerRadius);
            ctx.arcTo(imgSize / 2, imgSize / 2, imgSize / 2 - cornerRadius, imgSize / 2, cornerRadius);
            ctx.lineTo(-imgSize / 2 + cornerRadius, imgSize / 2);
            ctx.arcTo(-imgSize / 2, imgSize / 2, -imgSize / 2, imgSize / 2 - cornerRadius, cornerRadius);
            ctx.lineTo(-imgSize / 2, -imgSize / 2 + cornerRadius);
            ctx.arcTo(-imgSize / 2, -imgSize / 2, -imgSize / 2 + cornerRadius, -imgSize / 2, cornerRadius);
            ctx.closePath();
            ctx.clip();

            ctx.drawImage(imgEl, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
            ctx.restore();
          }

          const textX = centerX + textRadius * Math.cos(midAngle);
          const textY = centerY + textRadius * Math.sin(midAngle);

          ctx.save();
          ctx.translate(textX, textY);
          ctx.rotate(midAngle + Math.PI / 2);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = 2;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 1;

          const maxTextWidth = radius * 0.35;
          let displayName = prize.name;
          while (ctx.measureText(displayName).width > maxTextWidth && displayName.length > 1) {
            displayName = displayName.slice(0, -1);
          }
          if (displayName !== prize.name) {
            displayName = displayName + '…';
          }
          ctx.fillText(displayName, 0, 0);

          ctx.restore();
        });

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, 36, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
  }, [prizes]);

  const loadImages = useCallback(() => {
    if (prizes.length === 0) return;

    const query = Taro.createSelectorQuery();
    query.select(`#${canvasId}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0] || !res[0].node) return;

        const canvas = res[0].node;
        let loadedCount = 0;
        const totalToLoad = prizes.filter(p => p.image).length;

        if (totalToLoad === 0) {
          drawWheel();
          return;
        }

        prizes.forEach((prize) => {
          if (!prize.image) return;

          const img = canvas.createImage();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            imageMapRef.current[prize.id] = img;
            loadedCount++;
            if (loadedCount >= totalToLoad) {
              drawWheel();
            }
          };
          img.onerror = () => {
            console.error('[Wheel] 图片加载失败', prize.image);
            loadedCount++;
            if (loadedCount >= totalToLoad) {
              drawWheel();
            }
          };
          img.src = prize.image;
        });
      });
  }, [prizes, drawWheel]);

  useEffect(() => {
    if (prizes.length === 0) return;
    if (drawPendingRef.current) return;
    drawPendingRef.current = true;

    const timer = setTimeout(() => {
      drawPendingRef.current = false;
      loadImages();
    }, 300);

    return () => {
      clearTimeout(timer);
      drawPendingRef.current = false;
    };
  }, [prizes, loadImages]);

  const selectPrizeByProbability = useCallback((): Prize => {
    const totalProbability = prizes.reduce((sum, p) => sum + p.probability, 0);
    let random = Math.random() * totalProbability;

    for (const prize of prizes) {
      random -= prize.probability;
      if (random <= 0) {
        return prize;
      }
    }
    return prizes[prizes.length - 1];
  }, [prizes]);

  const handleSpin = useCallback(() => {
    if (isSpinning || disabled || prizes.length === 0) return;

    if (prizes.length < 2) {
      Taro.showToast({ title: '至少需要2个奖品', icon: 'none' });
      return;
    }

    setIsSpinning(true);

    const selectedPrize = selectPrizeByProbability();
    const prizeIndex = prizes.findIndex(p => p.id === selectedPrize.id);

    const sectorAngle = 360 / prizes.length;
    const targetAngle = prizeIndex * sectorAngle + sectorAngle / 2;
    const spins = 5 + Math.floor(Math.random() * 3);
    const totalRotation = rotation + spins * 360 + (360 - targetAngle + 270) % 360;

    setRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      onSpinEnd(selectedPrize);
      console.log('[Wheel] 抽奖结束', selectedPrize);
    }, 4000);
  }, [isSpinning, disabled, prizes, rotation, selectPrizeByProbability, onSpinEnd]);

  return (
    <View className={styles.wheelContainer}>
      <View
        className={classnames(styles.wheel, {
          [styles.wheelSpinning]: isSpinning
        })}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <Canvas
          id={canvasId}
          type="2d"
          className={styles.canvas}
          style={{ width: WHEEL_SIZE_PX + 'px', height: WHEEL_SIZE_PX + 'px' }}
        />
      </View>

      <View className={classnames(styles.pointer, { [styles.disabled]: disabled || isSpinning })}>
        <View className={styles.pointerArrow} />
        <View className={styles.pointerButton} onClick={handleSpin}>
          <Text className={styles.pointerText}>{isSpinning ? '...' : 'GO'}</Text>
        </View>
      </View>
    </View>
  );
};

export default Wheel;
