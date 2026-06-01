import React, { useState, useRef } from 'react';
import { View, Text, Map, WebView, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { LocationData } from '../../types/location';
import { getCurrentLocation, getHistory } from '../../store/locationStore';
import { formatLatLng } from '../../utils/geocode';

const IS_H5 = process.env.TARO_ENV === 'h5';

const MapPage: React.FC = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const mapRef = useRef<any>(null);

  const defaultLatitude = 39.9042;
  const defaultLongitude = 116.4074;

  useDidShow(() => {
    console.log('[MapPage] useDidShow 触发，重新加载位置数据');
    loadLocation();
  });

  const loadLocation = () => {
    console.log('[MapPage] 开始加载位置数据');

    try {
      const currentLoc = getCurrentLocation();
      if (currentLoc) {
        setLocation(currentLoc);
        updateMarkers(currentLoc);
        console.log('[MapPage] 加载当前位置', currentLoc);
      } else {
        const history = getHistory();
        if (history.length > 0) {
          const latest = history[0];
          setLocation(latest);
          updateMarkers(latest);
          console.log('[MapPage] 加载历史位置', latest);
        } else {
          console.log('[MapPage] 无位置数据，使用默认位置');
          const defaultLocation: LocationData = {
            id: 'default',
            latitude: defaultLatitude,
            longitude: defaultLongitude,
            address: '北京市天安门广场',
            timestamp: Date.now(),
            type: 'address-to-latlng'
          };
          setLocation(defaultLocation);
          updateMarkers(defaultLocation);
        }
      }
    } catch (error) {
      console.error('[MapPage] 加载位置数据失败', error);
      const defaultLocation: LocationData = {
        id: 'default',
        latitude: defaultLatitude,
        longitude: defaultLongitude,
        address: '北京市天安门广场',
        timestamp: Date.now(),
        type: 'address-to-latlng'
      };
      setLocation(defaultLocation);
      updateMarkers(defaultLocation);
    }
  };

  const updateMarkers = (loc: LocationData) => {
    const newMarkers = [
      {
        id: 1,
        latitude: loc.latitude,
        longitude: loc.longitude,
        title: loc.address,
        width: 40,
        height: 40,
        callout: {
          content: loc.address,
          color: '#1d2129',
          fontSize: 12,
          borderRadius: 8,
          bgColor: '#ffffff',
          padding: 8,
          display: 'ALWAYS',
          textAlign: 'center'
        }
      }
    ];
    setMarkers(newMarkers);
    console.log('[MapPage] 更新标记点', newMarkers);
  };

  const handleGoToConvert = () => {
    Taro.switchTab({
      url: '/pages/index/index'
    });
  };

  const handleLocate = () => {
    if (location) {
      console.log('[MapPage] 定位到位置', location);
      Taro.showToast({
        title: '已定位到标记点',
        icon: 'success',
        duration: 1500
      });
    }
  };

  const getTypeText = (type: string) => {
    return type === 'latlng-to-address' ? '经纬度转地址' : '地址转经纬度';
  };

  const displayLatitude = location?.latitude ?? defaultLatitude;
  const displayLongitude = location?.longitude ?? defaultLongitude;

  const renderMap = () => {
    if (IS_H5) {
      const mapUrl = `https://apis.map.qq.com/tools/locpicker?search=1&type=1&key=OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77&referer=myapp&lng=${displayLongitude}&lat=${displayLatitude}`;
      return (
        <WebView src={mapUrl} className={styles.map} />
      );
    }

    return (
      <Map
        ref={mapRef}
        className={styles.map}
        latitude={displayLatitude}
        longitude={displayLongitude}
        scale={15}
        markers={markers}
        showLocation={false}
        enableZoom={true}
        enableScroll={true}
        enableRotate={false}
        showCompass={true}
      />
    );
  };

  return (
    <View className={styles.page}>
      <View className={styles.mapContainer}>
        {renderMap()}

        <View className={styles.mapControls}>
          <View className={styles.controlBtn} onClick={handleLocate}>
            📍
          </View>
        </View>

        {location && (
          <View className={styles.infoCard}>
            <View className={styles.infoHeader}>
              <View className={styles.infoTitle}>
                <Text className={styles.infoIcon}>📍</Text>
                位置详情
              </View>
              <View className={styles.infoType}>{getTypeText(location.type)}</View>
            </View>

            <View className={styles.infoContent}>
              <View className={styles.infoItem}>
                <View className={styles.infoLabel}>经纬度</View>
                <View className={styles.infoValue}>
                  <Text className={styles.coordValue}>
                    {formatLatLng(location.latitude, location.longitude)}
                  </Text>
                </View>
              </View>
              <View className={styles.infoItem}>
                <View className={styles.infoLabel}>详细地址</View>
                <View className={styles.infoValue}>{location.address}</View>
              </View>
            </View>

            <Button className={styles.actionBtn} onClick={handleGoToConvert}>
              去转换坐标
            </Button>
          </View>
        )}
      </View>
    </View>
  );
};

export default MapPage;
