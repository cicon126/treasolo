import { LocationData, ConvertResult } from '../types/location';

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const mockAddresses = [
  '北京市朝阳区建国门外大街1号国贸大厦',
  '上海市浦东新区陆家嘴环路1000号恒生银行大厦',
  '广州市天河区珠江新城华夏路8号合景国际金融广场',
  '深圳市南山区科技园南区科苑路15号科兴科学园',
  '杭州市西湖区文三路478号华星时代广场',
  '成都市高新区天府大道北段1480号天府万科中心',
  '武汉市江汉区建设大道568号新世界国贸大厦',
  '西安市高新区锦业一路1号都市之门',
  '南京市建邺区江东中路359号国睿大厦',
  '重庆市渝中区民权路28号英利国际金融中心'
];

export const latLngToAddress = async (
  latitude: number,
  longitude: number
): Promise<ConvertResult> => {
  console.log('[Geocode] 经纬度转地址', { latitude, longitude });

  return new Promise((resolve) => {
    setTimeout(() => {
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        resolve({
          success: false,
          message: '经纬度格式不正确，请检查输入'
        });
        return;
      }

      const index = Math.floor(Math.abs(latitude + longitude) * 100) % mockAddresses.length;
      const address = mockAddresses[index];

      const result: LocationData = {
        id: generateId(),
        latitude,
        longitude,
        address,
        timestamp: Date.now(),
        type: 'latlng-to-address'
      };

      resolve({
        success: true,
        data: result
      });
    }, 800);
  });
};

export const addressToLatLng = async (address: string): Promise<ConvertResult> => {
  console.log('[Geocode] 地址转经纬度', { address });

  return new Promise((resolve) => {
    setTimeout(() => {
      if (!address || address.trim().length === 0) {
        resolve({
          success: false,
          message: '请输入有效的地址'
        });
        return;
      }

      const baseLat = 30 + Math.random() * 10;
      const baseLng = 110 + Math.random() * 10;
      const latitude = Number(baseLat.toFixed(6));
      const longitude = Number(baseLng.toFixed(6));

      const result: LocationData = {
        id: generateId(),
        latitude,
        longitude,
        address: address.trim(),
        timestamp: Date.now(),
        type: 'address-to-latlng'
      };

      resolve({
        success: true,
        data: result
      });
    }, 800);
  });
};

export const formatLatLng = (lat: number, lng: number): string => {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${latDir}${Math.abs(lat).toFixed(6)}, ${lngDir}${Math.abs(lng).toFixed(6)}`;
};
