import { Platform, Linking, NativeModules } from 'react-native';
import LocalNetworkStats from '../../modules/network-stats';

export interface NativeAppStats {
  packageName: string;
  appName: string;
  uid: number;
  wifiRxBytes: number;
  wifiTxBytes: number;
  mobileRxBytes: number;
  mobileTxBytes: number;
}

export const NetworkStats = {
  /**
   * Check if the native Android NetworkStats module is available in this runtime
   */
  isAvailable(): boolean {
    return Platform.OS === 'android' && Boolean(LocalNetworkStats || NativeModules.NetworkStatsModule);
  },

  /**
   * Check if PACKAGE_USAGE_STATS permission has been granted by the user
   */
  async checkPermission(): Promise<boolean> {
    if (!this.isAvailable()) {
      return true; // Virtual / simulation mode assumes granted
    }
    try {
      if (LocalNetworkStats && LocalNetworkStats.checkPermission) {
        return await LocalNetworkStats.checkPermission();
      }
      if (NativeModules.NetworkStatsModule && NativeModules.NetworkStatsModule.checkPermission) {
        return await NativeModules.NetworkStatsModule.checkPermission();
      }
      return true;
    } catch (err) {
      console.warn('NetworkStats.checkPermission error:', err);
      return false;
    }
  },

  /**
   * Open the Android system "Usage Access" settings screen
   */
  async requestPermission(): Promise<void> {
    if (this.isAvailable()) {
      try {
        if (LocalNetworkStats && LocalNetworkStats.requestPermission) {
          await LocalNetworkStats.requestPermission();
          return;
        }
        if (NativeModules.NetworkStatsModule && NativeModules.NetworkStatsModule.requestPermission) {
          await NativeModules.NetworkStatsModule.requestPermission();
          return;
        }
      } catch (err) {
        console.warn('Error opening usage access with module:', err);
      }
    }
    // Fallback if native module not directly linked: open system app settings
    Linking.openSettings();
  },

  /**
   * Query network statistics for a time range directly from Android's NetworkStatsManager
   */
  async queryUsage(startTimeMs: number, endTimeMs: number): Promise<NativeAppStats[] | null> {
    if (!this.isAvailable()) {
      return null;
    }
    try {
      if (LocalNetworkStats && LocalNetworkStats.queryUsage) {
        return await LocalNetworkStats.queryUsage(startTimeMs, endTimeMs);
      }
      if (NativeModules.NetworkStatsModule && NativeModules.NetworkStatsModule.queryUsage) {
        return await NativeModules.NetworkStatsModule.queryUsage(startTimeMs, endTimeMs);
      }
      return null;
    } catch (err) {
      console.warn('NetworkStats.queryUsage failed:', err);
      return null;
    }
  },
};
