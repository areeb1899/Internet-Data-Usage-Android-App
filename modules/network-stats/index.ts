import { requireNativeModule } from 'expo-modules-core';

let NativeNetworkStats: any = null;
try {
  NativeNetworkStats = requireNativeModule('NetworkStatsModule');
} catch (e) {
  // Graceful fallback when running in Expo Go or web
  NativeNetworkStats = null;
}

export default NativeNetworkStats;

