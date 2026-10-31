export type NetworkType = 'wifi' | 'mobile' | 'both';

export type TimeRangePreset = 
  | 'today'
  | 'yesterday'
  | 'week'
  | 'month'
  | 'last30'
  | 'last90'
  | 'last180'
  | 'year'
  | 'custom';

export interface TimeRange {
  id: TimeRangePreset;
  label: string;
  startDate: Date;
  endDate: Date;
}

export type AppItemType = 'installed' | 'system' | 'removed';

export interface AppUsageItem {
  id: string;
  packageName: string;
  appName: string;
  appType: AppItemType;
  wifiRxBytes: number;
  wifiTxBytes: number;
  wifiTotalBytes: number;
  mobileRxBytes: number;
  mobileTxBytes: number;
  mobileTotalBytes: number;
  totalBytes: number;
  iconColor: string;
  category: 'media' | 'social' | 'browser' | 'games' | 'productivity' | 'system' | 'other';
  isSystemApp?: boolean;
}

export interface UsageSummary {
  totalWifiBytes: number;
  totalWifiRxBytes: number;
  totalWifiTxBytes: number;
  totalMobileBytes: number;
  totalMobileRxBytes: number;
  totalMobileTxBytes: number;
  grandTotalBytes: number;
  daysInRange: number;
  dailyAvgWifiBytes: number;
  dailyAvgMobileBytes: number;
  appsCount: number;
}

export interface DailySnapshot {
  date: string; // YYYY-MM-DD
  wifiTotal: number;
  mobileTotal: number;
  appRecords: {
    [packageName: string]: {
      wifiRx: number;
      wifiTx: number;
      mobileRx: number;
      mobileTx: number;
    };
  };
}
