export type NetworkType = 'wifi' | 'mobile' | 'both';

export type TimeRangePreset = 
  | 'today'
  | 'yesterday'
  | 'week'
  | 'month'
  | 'last30'
  | 'custom';

export interface TimeRange {
  id: TimeRangePreset;
  label: string;
  startDate: Date;
  endDate: Date;
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
}

export interface DailySnapshot {
  date: string; // YYYY-MM-DD
  wifiRx: number;
  wifiTx: number;
  wifiTotal: number;
  mobileRx: number;
  mobileTx: number;
  mobileTotal: number;
}
