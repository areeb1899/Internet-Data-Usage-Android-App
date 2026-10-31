import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon, IconName } from './Icon';
import { NetworkType, UsageSummary } from '../types/dataUsage';
import { theme } from '../theme';
import { formatBytes } from '../utils/formatters';

interface SummaryCardProps {
  activeTab: NetworkType;
  summary: UsageSummary;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ activeTab, summary }) => {
  // Determine metrics based on active tab
  let totalBytes = 0;
  let rxBytes = 0;
  let txBytes = 0;
  let dailyAvg = 0;
  let accentColor = theme.colors.wifiLight;
  let sectionTitle = 'Wi-Fi Data Consumed';
  let iconName: IconName = 'wifi';

  if (activeTab === 'wifi') {
    totalBytes = summary.totalWifiBytes;
    rxBytes = summary.totalWifiRxBytes;
    txBytes = summary.totalWifiTxBytes;
    dailyAvg = summary.dailyAvgWifiBytes;
    accentColor = theme.colors.wifiLight;
    sectionTitle = 'Wi-Fi Data Consumed';
    iconName = 'wifi';
  } else if (activeTab === 'mobile') {
    totalBytes = summary.totalMobileBytes;
    rxBytes = summary.totalMobileRxBytes;
    txBytes = summary.totalMobileTxBytes;
    dailyAvg = summary.dailyAvgMobileBytes;
    accentColor = theme.colors.mobileLight;
    sectionTitle = 'Mobile Data Consumed';
    iconName = 'cellular';
  } else {
    totalBytes = summary.grandTotalBytes;
    rxBytes = summary.totalWifiRxBytes + summary.totalMobileRxBytes;
    txBytes = summary.totalWifiTxBytes + summary.totalMobileTxBytes;
    dailyAvg = summary.dailyAvgWifiBytes + summary.dailyAvgMobileBytes;
    accentColor = theme.colors.bothLight;
    sectionTitle = 'Total Internet Data';
    iconName = 'globe-outline';
  }

  const rxPercent = totalBytes > 0 ? (rxBytes / totalBytes) * 100 : 0;
  const txPercent = totalBytes > 0 ? (txBytes / totalBytes) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.card, { borderColor: `${accentColor}33` }]}>
        {/* Card Header */}
        <View style={styles.headerRow}>
          <View style={styles.sectionBadge}>
            <Icon name={iconName} size={15} color={accentColor} />
            <Text style={[styles.sectionTitle, { color: accentColor }]}>{sectionTitle}</Text>
          </View>
          <View style={styles.daysBadge}>
            <Text style={styles.daysText}>{summary.daysInRange} {summary.daysInRange === 1 ? 'day' : 'days'}</Text>
          </View>
        </View>

        {/* Big Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalNumber}>{formatBytes(totalBytes, 2)}</Text>
          <View style={styles.dailyBadge}>
            <Icon name="trending-up" size={13} color={theme.colors.textMuted} />
            <Text style={styles.dailyText}>Avg {formatBytes(dailyAvg, 1)}/d</Text>
          </View>
        </View>

        {/* Proportion Bar */}
        <View style={styles.barContainer}>
          <View style={[styles.rxBar, { width: `${Math.max(4, Math.min(96, rxPercent))}%` }]} />
          <View style={[styles.txBar, { width: `${Math.max(4, Math.min(96, txPercent))}%` }]} />
        </View>

        {/* Breakdown Row (Rx & Tx) */}
        <View style={styles.breakdownRow}>
          {/* Download (Rx) */}
          <View style={styles.metricItem}>
            <View style={styles.metricDotRow}>
              <View style={[styles.colorDot, { backgroundColor: theme.colors.rxDownload }]} />
              <Icon name="arrow-down" size={12} color={theme.colors.rxDownload} />
              <Text style={styles.metricLabel}>Download (Rx)</Text>
            </View>
            <Text style={styles.metricValue}>{formatBytes(rxBytes, 2)}</Text>
            <Text style={styles.metricPercent}>{rxPercent.toFixed(1)}%</Text>
          </View>

          <View style={styles.metricDivider} />

          {/* Upload (Tx) */}
          <View style={styles.metricItem}>
            <View style={styles.metricDotRow}>
              <View style={[styles.colorDot, { backgroundColor: theme.colors.txUpload }]} />
              <Icon name="arrow-up" size={12} color={theme.colors.txUpload} />
              <Text style={styles.metricLabel}>Upload (Tx)</Text>
            </View>
            <Text style={styles.metricValue}>{formatBytes(txBytes, 2)}</Text>
            <Text style={styles.metricPercent}>{txPercent.toFixed(1)}%</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  daysBadge: {
    backgroundColor: theme.colors.cardAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  daysText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  totalNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  dailyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  dailyText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  barContainer: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.cardAlt,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    gap: 2,
  },
  rxBar: {
    backgroundColor: theme.colors.rxDownload,
    height: '100%',
    borderRadius: 3,
  },
  txBar: {
    backgroundColor: theme.colors.txUpload,
    height: '100%',
    borderRadius: 3,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.xs,
  },
  metricItem: {
    flex: 1,
  },
  metricDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  colorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 1,
  },
  metricPercent: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  metricDivider: {
    width: 1,
    height: 36,
    backgroundColor: theme.colors.divider,
    marginHorizontal: theme.spacing.md,
  },
});

