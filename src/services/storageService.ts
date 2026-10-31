import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppUsageItem, DailySnapshot, UsageSummary } from '../types/dataUsage';
import { getAppColor, toDateKey } from '../utils/formatters';

const STORAGE_KEY_DAILY_RECORDS = '@net_usage_daily_v1';
const STORAGE_KEY_INITIALIZED = '@net_usage_initialized_v1';

// Seed apps catalog with realistic metadata & usage weights
const CATALOG_APPS = [
  { name: 'YouTube', package: 'com.google.android.youtube', category: 'media', wifiWeight: 45, mobileWeight: 20 },
  { name: 'Instagram', package: 'com.instagram.android', category: 'social', wifiWeight: 25, mobileWeight: 25 },
  { name: 'Google Chrome', package: 'com.android.chrome', category: 'browser', wifiWeight: 15, mobileWeight: 12 },
  { name: 'WhatsApp', package: 'com.whatsapp', category: 'social', wifiWeight: 10, mobileWeight: 14 },
  { name: 'Netflix', package: 'com.netflix.mediaclient', category: 'media', wifiWeight: 35, mobileWeight: 8 },
  { name: 'Spotify', package: 'com.spotify.music', category: 'media', wifiWeight: 12, mobileWeight: 9 },
  { name: 'TikTok', package: 'com.zhiliaoapp.musically', category: 'social', wifiWeight: 30, mobileWeight: 22 },
  { name: 'Reddit', package: 'com.reddit.frontpage', category: 'social', wifiWeight: 8, mobileWeight: 7 },
  { name: 'Google Play Store', package: 'com.android.vending', category: 'system', wifiWeight: 18, mobileWeight: 4 },
  { name: 'Android OS System', package: 'android.system.core', category: 'system', wifiWeight: 6, mobileWeight: 5 },
  { name: 'Zoom Meetings', package: 'us.zoom.videomeetings', category: 'productivity', wifiWeight: 20, mobileWeight: 3 },
  { name: 'Telegram', package: 'org.telegram.messenger', category: 'social', wifiWeight: 9, mobileWeight: 8 },
  { name: 'Google Maps', package: 'com.google.android.apps.maps', category: 'other', wifiWeight: 4, mobileWeight: 10 },
  { name: 'PUBG Mobile', package: 'com.tencent.ig', category: 'games', wifiWeight: 22, mobileWeight: 12 },
  { name: 'Gmail', package: 'com.google.android.gm', category: 'productivity', wifiWeight: 3, mobileWeight: 2 },
  { name: 'Google Photos', package: 'com.google.android.apps.photos', category: 'media', wifiWeight: 16, mobileWeight: 3 },
  { name: 'Twitter / X', package: 'com.twitter.android', category: 'social', wifiWeight: 12, mobileWeight: 11 },
];

class StorageService {
  private memoryCache: Record<string, DailySnapshot> | null = null;

  /**
   * Initialize and seed 365 days of data if first launch
   */
  async initialize(): Promise<void> {
    try {
      const initialized = await AsyncStorage.getItem(STORAGE_KEY_INITIALIZED);
      if (!initialized) {
        await this.seed365DaysHistory();
        await AsyncStorage.setItem(STORAGE_KEY_INITIALIZED, 'true');
      } else {
        await this.loadAllRecords();
        await this.pruneOlderThanOneYear();
      }
    } catch (error) {
      console.warn('StorageService initialize error:', error);
    }
  }

  /**
   * Load all records into memory cache for fast range slicing
   */
  private async loadAllRecords(): Promise<Record<string, DailySnapshot>> {
    if (this.memoryCache) return this.memoryCache;
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY_DAILY_RECORDS);
      this.memoryCache = json ? JSON.parse(json) : {};
    } catch {
      this.memoryCache = {};
    }
    return this.memoryCache!;
  }

  /**
   * Seed 365 days of realistic data usage
   */
  private async seed365DaysHistory(): Promise<void> {
    const records: Record<string, DailySnapshot> = {};
    const now = new Date();

    // Generate day by day for past 365 days
    for (let i = 364; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = toDateKey(date);

      // Day-of-week variation (weekends have higher video usage)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const dayFactor = isWeekend ? 1.35 : 0.95;

      // Add a slight growth trend over the year to reflect real world usage
      const trendFactor = 0.8 + ((365 - i) / 365) * 0.4; // 80% to 120%

      let dayWifiTotal = 0;
      let dayMobileTotal = 0;
      const appRecords: DailySnapshot['appRecords'] = {};

      for (const app of CATALOG_APPS) {
        // Random daily variance: 0.6 to 1.4
        const variance = 0.6 + Math.random() * 0.8;
        
        // Base MB unit (approx 10 MB per weight unit)
        const baseWifiMB = app.wifiWeight * 12 * dayFactor * trendFactor * variance;
        const baseMobileMB = app.mobileWeight * 4 * dayFactor * trendFactor * variance;

        // Rx (Download) is typically 80-90%, Tx (Upload) is 10-20%
        const rxRatio = 0.82 + Math.random() * 0.12;

        const wifiTotalMB = Math.max(0.5, baseWifiMB);
        const mobileTotalMB = Math.max(0.2, baseMobileMB);

        const wifiRx = Math.round(wifiTotalMB * rxRatio * 1024 * 1024);
        const wifiTx = Math.round(wifiTotalMB * (1 - rxRatio) * 1024 * 1024);

        const mobileRx = Math.round(mobileTotalMB * rxRatio * 1024 * 1024);
        const mobileTx = Math.round(mobileTotalMB * (1 - rxRatio) * 1024 * 1024);

        appRecords[app.package] = {
          wifiRx,
          wifiTx,
          mobileRx,
          mobileTx,
        };

        dayWifiTotal += wifiRx + wifiTx;
        dayMobileTotal += mobileRx + mobileTx;
      }

      records[dateKey] = {
        date: dateKey,
        wifiTotal: dayWifiTotal,
        mobileTotal: dayMobileTotal,
        appRecords,
      };
    }

    this.memoryCache = records;
    await AsyncStorage.setItem(STORAGE_KEY_DAILY_RECORDS, JSON.stringify(records));
  }

  /**
   * Automatically prune records older than 365 days
   */
  async pruneOlderThanOneYear(): Promise<void> {
    const all = await this.loadAllRecords();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 365);
    const cutoffKey = toDateKey(cutoff);

    let pruned = false;
    for (const key of Object.keys(all)) {
      if (key < cutoffKey) {
        delete all[key];
        pruned = true;
      }
    }

    if (pruned) {
      await AsyncStorage.setItem(STORAGE_KEY_DAILY_RECORDS, JSON.stringify(all));
    }
  }

  /**
   * Query usage for a specific start and end date
   */
  async getUsageForRange(startDate: Date, endDate: Date): Promise<{
    apps: AppUsageItem[];
    summary: UsageSummary;
  }> {
    const all = await this.loadAllRecords();
    const startKey = toDateKey(startDate);
    const endKey = toDateKey(endDate);

    // Aggregate values
    const appAggregates: Record<
      string,
      {
        wifiRx: number;
        wifiTx: number;
        mobileRx: number;
        mobileTx: number;
      }
    > = {};

    let totalWifiRx = 0;
    let totalWifiTx = 0;
    let totalMobileRx = 0;
    let totalMobileTx = 0;
    let matchedDays = 0;

    for (const [dateKey, snapshot] of Object.entries(all)) {
      if (dateKey >= startKey && dateKey <= endKey) {
        matchedDays++;
        for (const [pkg, usage] of Object.entries(snapshot.appRecords)) {
          if (!appAggregates[pkg]) {
            appAggregates[pkg] = { wifiRx: 0, wifiTx: 0, mobileRx: 0, mobileTx: 0 };
          }
          appAggregates[pkg].wifiRx += usage.wifiRx;
          appAggregates[pkg].wifiTx += usage.wifiTx;
          appAggregates[pkg].mobileRx += usage.mobileRx;
          appAggregates[pkg].mobileTx += usage.mobileTx;

          totalWifiRx += usage.wifiRx;
          totalWifiTx += usage.wifiTx;
          totalMobileRx += usage.mobileRx;
          totalMobileTx += usage.mobileTx;
        }
      }
    }

    const effectiveDays = Math.max(1, matchedDays);
    const totalWifi = totalWifiRx + totalWifiTx;
    const totalMobile = totalMobileRx + totalMobileTx;
    const grandTotal = totalWifi + totalMobile;

    // Map to AppUsageItem list
    const appList: AppUsageItem[] = Object.keys(appAggregates).map((pkg) => {
      const agg = appAggregates[pkg];
      const catalogInfo = CATALOG_APPS.find((c) => c.package === pkg);
      const appName = catalogInfo ? catalogInfo.name : pkg.split('.').pop() || pkg;
      const category = (catalogInfo?.category || 'other') as AppUsageItem['category'];
      
      const wifiTotal = agg.wifiRx + agg.wifiTx;
      const mobileTotal = agg.mobileRx + agg.mobileTx;
      const combinedTotal = wifiTotal + mobileTotal;

      return {
        id: pkg,
        packageName: pkg,
        appName,
        wifiRxBytes: agg.wifiRx,
        wifiTxBytes: agg.wifiTx,
        wifiTotalBytes: wifiTotal,
        mobileRxBytes: agg.mobileRx,
        mobileTxBytes: agg.mobileTx,
        mobileTotalBytes: mobileTotal,
        totalBytes: combinedTotal,
        iconColor: getAppColor(appName),
        category,
        isSystemApp: pkg.startsWith('android') || pkg.startsWith('com.android'),
      };
    });

    const summary: UsageSummary = {
      totalWifiBytes: totalWifi,
      totalWifiRxBytes: totalWifiRx,
      totalWifiTxBytes: totalWifiTx,
      totalMobileBytes: totalMobile,
      totalMobileRxBytes: totalMobileRx,
      totalMobileTxBytes: totalMobileTx,
      grandTotalBytes: grandTotal,
      daysInRange: effectiveDays,
      dailyAvgWifiBytes: Math.round(totalWifi / effectiveDays),
      dailyAvgMobileBytes: Math.round(totalMobile / effectiveDays),
      appsCount: appList.length,
    };

    return { apps: appList, summary };
  }

  /**
   * Save a single day's live snapshot
   */
  async saveDaySnapshot(dateKey: string, snapshot: DailySnapshot): Promise<void> {
    const all = await this.loadAllRecords();
    all[dateKey] = snapshot;
    this.memoryCache = all;
    await AsyncStorage.setItem(STORAGE_KEY_DAILY_RECORDS, JSON.stringify(all));
  }

  /**
   * Reset / re-seed data (for testing or user reset)
   */
  async resetData(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY_INITIALIZED);
    await AsyncStorage.removeItem(STORAGE_KEY_DAILY_RECORDS);
    this.memoryCache = null;
    await this.initialize();
  }
}

export const storageService = new StorageService();

