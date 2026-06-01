export interface LocationData {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  timestamp: number;
  type: 'latlng-to-address' | 'address-to-latlng';
}

export interface ConvertResult {
  success: boolean;
  data?: LocationData;
  message?: string;
}
