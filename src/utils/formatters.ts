import { TimeRange, TimeRangePreset } from '../types/dataUsage';

/**
 * Formats a byte number into a clean, human-readable string (B, KB, MB, GB, TB).
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (!bytes || bytes <= 0 || isNaN(bytes)) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeIndex = Math.min(i, sizes.length - 1);

  const formattedValue = parseFloat((bytes / Math.pow(k, safeIndex)).toFixed(dm));
  return `${formattedValue} ${sizes[safeIndex]}`;
}

/**
 * Returns formatted date string: e.g. "Oct 31, 2026"
 */
export function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Returns ISO date key: "YYYY-MM-DD"
 */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse YYYY-MM-DD to local Date object at start of day
 */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/**
 * Preset time ranges generator
 */
export function getPresetTimeRanges(): TimeRange[] {
  const now = new Date();
  
  // Start of today: 00:00:00
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Yesterday
  const startYesterday = new Date(startToday);
  startYesterday.setDate(startYesterday.getDate() - 1);
  const endYesterday = new Date(startYesterday);
  endYesterday.setHours(23, 59, 59, 999);

  // Last 7 days
  const start7Days = new Date(startToday);
  start7Days.setDate(start7Days.getDate() - 6);

  // This Month
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

  // Last 30 days
  const start30Days = new Date(startToday);
  start30Days.setDate(start30Days.getDate() - 29);

  // Last 90 days (3 months)
  const start90Days = new Date(startToday);
  start90Days.setDate(start90Days.getDate() - 89);

  // Last 180 days (6 months)
  const start180Days = new Date(startToday);
  start180Days.setDate(start180Days.getDate() - 179);

  // Past 1 Year (365 days)
  const startYear = new Date(startToday);
  startYear.setDate(startYear.getDate() - 364);

  return [
    {
      id: 'today',
      label: 'Today',
      startDate: startToday,
      endDate: endToday,
    },
    {
      id: 'yesterday',
      label: 'Yesterday',
      startDate: startYesterday,
      endDate: endYesterday,
    },
    {
      id: 'week',
      label: 'Last 7 Days',
      startDate: start7Days,
      endDate: endToday,
    },
    {
      id: 'month',
      label: 'This Month',
      startDate: startThisMonth,
      endDate: endToday,
    },
    {
      id: 'last30',
      label: 'Last 30 Days',
      startDate: start30Days,
      endDate: endToday,
    },
    {
      id: 'last90',
      label: '3 Months',
      startDate: start90Days,
      endDate: endToday,
    },
    {
      id: 'last180',
      label: '6 Months',
      startDate: start180Days,
      endDate: endToday,
    },
    {
      id: 'year',
      label: '1 Year (365d)',
      startDate: startYear,
      endDate: endToday,
    },
    {
      id: 'custom',
      label: 'Custom Range',
      startDate: start30Days,
      endDate: endToday,
    },
  ];
}

/**
 * Generate a consistent, attractive color based on app name or package
 */
export function getAppColor(name: string): string {
  const palette = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#6366F1', // Indigo
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palette.length;
  return palette[index];
}

