import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Map, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { LocationData } from '../../types/location';
import { getCurrentLocation, getHistory } from '../../store/locationStore';
import { formatLatLng } from '../../utils/geocode';

const MapPage: React.FC = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    loadLocation();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const currentLoc = getCurrentLocation();
      if (currentLoc && (!location || currentLoc.id !== location.id)) {
        setLocation(currentLoc);
        updateMarkers(currentLoc);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [location]);

  const loadLocation = () => {
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
      }
    }
  };

  const updateMarkers = (loc: LocationData) => {
    const newMarkers = [
      {
        id: 1,
        latitude: loc.latitude,
        longitude: loc.longitude,
        title: loc.address,
        width: 30,
        height: 30,
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

  const defaultLatitude = location?.latitude || 39.9042;
  const defaultLongitude = location?.longitude || 116.4074;

  return (
    <View className={styles.page}>
      {location ? (
        <View className={styles.mapContainer}>
          <Map
            ref={mapRef}
            className={styles.map}
            latitude={defaultLatitude}
            longitude={defaultLongitude}
            scale={16}
            markers={markers}
            showLocation={false}
            enableZoom={true}
            enableScroll={true}
            enableRotate={false}
            showCompass={false}
          />

          <View className={styles.mapControls}>
            <View className={styles.controlBtn} onClick={handleLocate}>
              📍
            </View>
          </View>

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
        </View>
      ) : (
        <View className={styles.emptyState}>
          <View className={styles.emptyIcon}>🗺️</View>
          <View className={styles.emptyText}>
            暂无位置数据
            <Text>\n请先在坐标转换页面进行转换</Text>
          </View>
          <Button className={styles.emptyBtn} onClick={handleGoToConvert}>
            去转换坐标
          </Button>
        </View>
      )}
    </View>
  );
};

export default MapPage;
