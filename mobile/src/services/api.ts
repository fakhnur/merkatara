import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { getToken } from './storage';

// Smart zero-config URL resolution for physical devices, emulator, and web
export const getDefaultApiUrl = (): string => {
  // 1. Explicit environment variable has the highest priority
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Auto-detect host machine IP from active Expo Metro connection
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    // If it's a valid local IP or hostname (not ngrok/tunnel domain)
    if (host && !host.includes('ngrok') && !host.includes('exp.direct')) {
      return `http://${host}:5000/api`;
    }
  }

  // 3. Web or iOS simulator running locally
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }

  // 4. Default verified workstation Wi-Fi LAN IP (reachable by physical devices on local network)
  return 'http://192.168.1.10:5000/api';
};

export const apiClient = axios.create({
  baseURL: getDefaultApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
