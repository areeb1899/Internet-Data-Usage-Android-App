import { NativeModules, Platform, Linking } from 'react-native';

const { NetworkStatsModule } = NativeModules;

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
    return Platform.OS === 'android' && Boolean(NetworkStatsModule);
  },

  /**
   * Check if PACKAGE_USAGE_STATS permission has been granted by the user
   */
  async checkPermission(): Promise<boolean> {
    if (!this.isAvailable()) {
      return true; // Virtual / simulation mode assumes granted
    }
    try {
      return await NetworkStatsModule.checkPermission();
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
        await NetworkStatsModule.requestPermission();
        return;
      } catch (err) {
        console.warn('Error opening usage access with module, opening fallback settings', err);
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
      return await NetworkStatsModule.queryUsage(startTimeMs, endTimeMs);
    } catch (err) {
      console.warn('NetworkStatsModule.queryUsage failed:', err);
      return null;
    }
  },
};

