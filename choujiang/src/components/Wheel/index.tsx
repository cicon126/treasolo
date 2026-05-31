import React, { useState, useCallback, useRef } from 'react';
import { View, Image, Text } from '@tarojs/components';
import classNames from 'classnames';
import { Prize } from '@/types/prize';
import styles from './index.module.scss';

interface WheelProps {
  prizes: Prize[];
  onSpinEnd?: (prize: Prize) => void;
}

const WHEEL_COLORS = [
  '#ff6b6b',
  '#ffd93d',
  '#4ecdc4',
  '#ff9f43',
  '#a55eea',
  '#26de81',
  '#fd79a8',
  '#00cec9'
];

const WheelComponent: React.FC<WheelProps> = ({ prizes, onSpinEnd }) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const rotationRef = useRef(0);

  const selectPrizeByProbability = useCallback((): Prize | null => {
    if (prizes.length === 0) return null;

    const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0);
    if (totalProbability <= 0) return prizes[0];

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
    if (isSpinning || prizes.length === 0) return;

    setIsSpinning(true);
    const selectedPrize = selectPrizeByProbability();

    if (!selectedPrize) {
      setIsSpinning(false);
      return;
    }

    const prizeIndex = prizes.findIndex((p) => p.id === selectedPrize.id);
    const sectionAngle = 360 / prizes.length;
    const targetAngle = prizeIndex * sectionAngle + sectionAngle / 2;
    const spins = 5 + Math.floor(Math.random() * 3);
    const currentMod = rotationRef.current % 360;
    const finalRotation = rotationRef.current + (360 - targetAngle - currentMod + 360) % 360 + spins * 360;

    setRotation(finalRotation);
    rotationRef.current = finalRotation;

    setTimeout(() => {
      setIsSpinning(false);
      onSpinEnd?.(selectedPrize);
    }, 4000);
  }, [isSpinning, prizes, selectPrizeByProbability, onSpinEnd]);

  const renderSections = () => {
    if (prizes.length === 0) return null;

    const sectionAngle = 360 / prizes.length;

    return prizes.map((prize, index) => {
      const color = WHEEL_COLORS[index % WHEEL_COLORS.length];
      const skewAngle = 90 - sectionAngle;
      const rotation = index * sectionAngle - 90;

      return (
        <View
          key={prize.id}
          className={styles.wheelSection}
          style={{
            background: color,
            transform: `rotate(${rotation}deg) skewY(${skewAngle}deg)`
          }}
        >
          <View
            className={styles.sectionContent}
            style={{
              transform: `translateX(-50%) skewY(${-skewAngle}deg) rotate(${sectionAngle / 2}deg)`
            }}
          >
            <Image
              className={styles.prizeImage}
              src={prize.image}
              mode='aspectFill'
            />
            <Text className={styles.prizeName}>{prize.name}</Text>
          </View>
        </View>
      );
    });
  };

  return (
    <View className={styles.wheelContainer}>
      <View
        className={classNames(styles.wheel, isSpinning && styles.wheelSpinning)}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {renderSections()}
      </View>
      <View className={styles.pointer} onClick={handleSpin}>
        <View
          className={classNames(styles.pointerButton, isSpinning && styles.pointerDisabled)}
        >
          <Text className={styles.startText}>{isSpinning ? '抽奖中' : '开始'}</Text>
        </View>
      </View>
    </View>
  );
};

export default WheelComponent;
