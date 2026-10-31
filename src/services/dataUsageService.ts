import { AppUsageItem, UsageSummary } from '../types/dataUsage';
import { NetworkStats, NativeAppStats } from '../native/NetworkStats';
import { storageService } from './storageService';
import { getAppColor } from '../utils/formatters';

export interface DataUsageResponse {
  apps: AppUsageItem[];
  summary: UsageSummary;
  isNative: boolean;
  permissionGranted: boolean;
}

class DataUsageService {
  async init(): Promise<void> {
    await storageService.initialize();
  }

  async getDataUsage(startDate: Date, endDate: Date): Promise<DataUsageResponse> {
    const isNative = NetworkStats.isAvailable();
    let permissionGranted = false;

    if (isNative) {
      permissionGranted = await NetworkStats.checkPermission();
    }

    // If native Android module is present and permission is granted, query live device stats
    if (isNative && permissionGranted) {
      try {
        const nativeStats = await NetworkStats.queryUsage(startDate.getTime(), endDate.getTime());
        if (nativeStats && nativeStats.length > 0) {
          return this.processNativeStats(nativeStats, startDate, endDate);
        }
      } catch (err) {
        console.warn('Failed to query native stats, falling back to local history store:', err);
      }
    }

    // Fallback: Query local 1-year persistent store
    const { apps, summary } = await storageService.getUsageForRange(startDate, endDate);
    return {
      apps,
      summary,
      isNative,
      permissionGranted: isNative ? permissionGranted : true,
    };
  }

  private processNativeStats(
    stats: NativeAppStats[],
    startDate: Date,
    endDate: Date
  ): DataUsageResponse {
    let totalWifiRx = 0;
    let totalWifiTx = 0;
    let totalMobileRx = 0;
    let totalMobileTx = 0;

    const apps: AppUsageItem[] = stats.map((item) => {
      const wifiTotal = item.wifiRxBytes + item.wifiTxBytes;
      const mobileTotal = item.mobileRxBytes + item.mobileTxBytes;
      const total = wifiTotal + mobileTotal;

      totalWifiRx += item.wifiRxBytes;
      totalWifiTx += item.wifiTxBytes;
      totalMobileRx += item.mobileRxBytes;
      totalMobileTx += item.mobileTxBytes;

      const appType = item.appType || (item.packageName === 'app.removed.historical' ? 'removed' : (item.packageName.startsWith('android') ? 'system' : 'installed'));

      return {
        id: item.packageName,
        packageName: item.packageName,
        appName: item.appName || item.packageName,
        appType,
        wifiRxBytes: item.wifiRxBytes,
        wifiTxBytes: item.wifiTxBytes,
        wifiTotalBytes: wifiTotal,
        mobileRxBytes: item.mobileRxBytes,
        mobileTxBytes: item.mobileTxBytes,
        mobileTotalBytes: mobileTotal,
        totalBytes: total,
        iconColor: appType === 'removed' ? '#EF4444' : (appType === 'system' ? '#64748B' : getAppColor(item.appName || item.packageName)),
        category: appType === 'system' ? 'system' : 'other',
        isSystemApp: appType === 'system',
      };
    });

    const diffDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
    const totalWifi = totalWifiRx + totalWifiTx;
    const totalMobile = totalMobileRx + totalMobileTx;
    const grandTotal = totalWifi + totalMobile;

    const summary: UsageSummary = {
      totalWifiBytes: totalWifi,
      totalWifiRxBytes: totalWifiRx,
      totalWifiTxBytes: totalWifiTx,
      totalMobileBytes: totalMobile,
      totalMobileRxBytes: totalMobileRx,
      totalMobileTxBytes: totalMobileTx,
      grandTotalBytes: grandTotal,
      daysInRange: diffDays,
      dailyAvgWifiBytes: Math.round(totalWifi / diffDays),
      dailyAvgMobileBytes: Math.round(totalMobile / diffDays),
      appsCount: apps.length,
    };

    return {
      apps,
      summary,
      isNative: true,
      permissionGranted: true,
    };
  }
}

export const dataUsageService = new DataUsageService();
