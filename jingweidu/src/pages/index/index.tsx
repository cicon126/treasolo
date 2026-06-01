import React, { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { LocationData, ConvertResult } from '../../types/location';
import { latLngToAddress, addressToLatLng } from '../../utils/geocode';
import { saveToHistory, setCurrentLocation } from '../../store/locationStore';

type ConvertMode = 'latlng-to-address' | 'address-to-latlng';

const IndexPage: React.FC = () => {
  const [mode, setMode] = useState<ConvertMode>('latlng-to-address');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [addressInput, setAddressInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ConvertResult | null>(null);

  const handleConvert = async () => {
    console.log('[IndexPage] 开始转换', { mode, latitude, longitude, addressInput });
    setLoading(true);
    setResult(null);

    try {
      let convertResult: ConvertResult;

      if (mode === 'latlng-to-address') {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) {
          convertResult = {
            success: false,
            message: '请输入有效的经纬度数值'
          };
        } else {
          convertResult = await latLngToAddress(lat, lng);
        }
      } else {
        convertResult = await addressToLatLng(addressInput);
      }

      setResult(convertResult);

      if (convertResult.success && convertResult.data) {
        saveToHistory(convertResult.data);
        setCurrentLocation(convertResult.data);
        console.log('[IndexPage] 转换成功', convertResult.data);
      }
    } catch (error) {
      console.error('[IndexPage] 转换失败', error);
      setResult({
        success: false,
        message: '转换失败，请稍后重试'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewMap = () => {
    if (result?.success && result?.data) {
      console.log('[IndexPage] 保存位置并跳转到地图页', result.data);
      setCurrentLocation(result.data);
      Taro.showToast({
        title: '正在打开地图...',
        icon: 'loading',
        duration: 500
      });
      setTimeout(() => {
        Taro.switchTab({
          url: '/pages/map/index',
          success: () => {
            console.log('[IndexPage] 跳转到地图页成功');
          },
          fail: (err) => {
            console.error('[IndexPage] 跳转到地图页失败', err);
            Taro.showToast({
              title: '打开地图失败',
              icon: 'none',
              duration: 2000
            });
          }
        });
      }, 300);
    }
  };

  const handleReset = () => {
    setLatitude('');
    setLongitude('');
    setAddressInput('');
    setResult(null);
  };

  const handleLatitudeInput = (e: any) => {
    const value = e?.detail?.value ?? '';
    console.log('[IndexPage] 纬度输入', value);
    setLatitude(value);
  };

  const handleLongitudeInput = (e: any) => {
    const value = e?.detail?.value ?? '';
    console.log('[IndexPage] 经度输入', value);
    setLongitude(value);
  };

  const handleAddressInput = (e: any) => {
    const value = e?.detail?.value ?? '';
    console.log('[IndexPage] 地址输入', value);
    setAddressInput(value);
  };

  const handleModeChange = (newMode: ConvertMode) => {
    setMode(newMode);
    setResult(null);
  };

  return (
    <View className={styles.page}>
      <View className={styles.modeTabs}>
        <View
          className={classnames(styles.tabItem, mode === 'latlng-to-address' && styles.active)}
          onClick={() => handleModeChange('latlng-to-address')}
        >
          经纬度转地址
        </View>
        <View
          className={classnames(styles.tabItem, mode === 'address-to-latlng' && styles.active)}
          onClick={() => handleModeChange('address-to-latlng')}
        >
          地址转经纬度
        </View>
      </View>

      <View className={styles.formCard}>
        {mode === 'latlng-to-address' ? (
          <>
            <View className={styles.inputGroup}>
              <View className={styles.label}>纬度 (-90 ~ 90)</View>
              <Input
                className={styles.input}
                type='text'
                placeholder='请输入纬度，如：39.9042'
                value={latitude}
                onInput={handleLatitudeInput}
              />
            </View>
            <View className={styles.inputGroup}>
              <View className={styles.label}>经度 (-180 ~ 180)</View>
              <Input
                className={styles.input}
                type='text'
                placeholder='请输入经度，如：116.4074'
                value={longitude}
                onInput={handleLongitudeInput}
              />
            </View>
          </>
        ) : (
          <View className={styles.inputGroup}>
            <View className={styles.label}>详细地址</View>
            <Input
              className={styles.input}
              type='text'
              placeholder='请输入详细地址，如：北京市朝阳区国贸大厦'
              value={addressInput}
              onInput={handleAddressInput}
            />
          </View>
        )}
      </View>

      <Button
        className={classnames(styles.convertBtn, loading && styles.loading)}
        onClick={handleConvert}
        disabled={loading}
      >
        {loading ? (
          <Text className={styles.loadingText}>转换中</Text>
        ) : (
          '开始转换'
        )}
      </Button>

      {result && (
        <View
          className={classnames(
            styles.resultCard,
            result.success ? styles.success : styles.error
          )}
        >
          <View
            className={classnames(
              styles.resultTitle,
              result.success ? styles.success : styles.error
            )}
          >
            <Text className={styles.resultIcon}>
              {result.success ? '✓' : '✗'}
            </Text>
            {result.success ? '转换成功' : '转换失败'}
          </View>

          {result.success && result.data ? (
            <>
              <View className={styles.resultContent}>
                <View className={styles.resultItem}>
                  <View className={styles.resultLabel}>经纬度</View>
                  <View className={styles.resultValue}>
                    <Text className={styles.coordText}>
                      {result.data.latitude.toFixed(6)}, {result.data.longitude.toFixed(6)}
                    </Text>
                  </View>
                </View>
                <View className={styles.resultItem}>
                  <View className={styles.resultLabel}>详细地址</View>
                  <View className={styles.resultValue}>
                    {result.data.address}
                  </View>
                </View>
              </View>
              <View className={styles.actionRow}>
                <Button className={classnames(styles.actionBtn, styles.secondary)} onClick={handleReset}>
                  重新输入
                </Button>
                <Button className={classnames(styles.actionBtn, styles.primary)} onClick={handleViewMap}>
                  查看地图
                </Button>
              </View>
            </>
          ) : (
            <View className={styles.resultContent}>
              <View className={styles.resultValue}>{result.message}</View>
            </View>
          )}
        </View>
      )}

      {!result && !loading && (
        <View className={styles.emptyTip}>
          输入信息后点击转换，即可获取结果
        </View>
      )}
    </View>
  );
};

export default IndexPage;
