import { UsageSummary } from '../types/dataUsage';
import { NetworkStats, NativeAppStats } from '../native/NetworkStats';
import { storageService } from './storageService';

export interface DataUsageResponse {
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

    const resetTs = await storageService.getResetTimestamp();

    // If query window is before the reset timestamp, return 0
    if (resetTs > 0 && endDate.getTime() < resetTs) {
      const diffDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
      return {
        summary: {
          totalWifiBytes: 0,
          totalWifiRxBytes: 0,
          totalWifiTxBytes: 0,
          totalMobileBytes: 0,
          totalMobileRxBytes: 0,
          totalMobileTxBytes: 0,
          grandTotalBytes: 0,
          daysInRange: diffDays,
          dailyAvgWifiBytes: 0,
          dailyAvgMobileBytes: 0,
        },
        isNative,
        permissionGranted,
      };
    }

    const effectiveStartMs = resetTs > 0 ? Math.max(startDate.getTime(), resetTs) : startDate.getTime();

    // If native Android module is present and permission is granted, query live device stats
    if (isNative && permissionGranted) {
      try {
        const nativeStats = await NetworkStats.queryUsage(effectiveStartMs, endDate.getTime());
        if (nativeStats) {
          return this.processNativeStats(nativeStats, new Date(effectiveStartMs), endDate);
        }
      } catch (err) {
        console.warn('Failed to query native stats, falling back to local history store:', err);
      }
    }

    // Fallback: Query local persistent store
    const summary = await storageService.getUsageForRange(startDate, endDate);
    return {
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

    for (const item of stats) {
      totalWifiRx += item.wifiRxBytes || 0;
      totalWifiTx += item.wifiTxBytes || 0;
      totalMobileRx += item.mobileRxBytes || 0;
      totalMobileTx += item.mobileTxBytes || 0;
    }

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
    };

    return {
      summary,
      isNative: true,
      permissionGranted: true,
    };
  }
}

export const dataUsageService = new DataUsageService();
