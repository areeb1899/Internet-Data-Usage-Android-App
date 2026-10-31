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

  const totalAll = summary.grandTotalBytes;
  const wifiRatio = totalAll > 0 ? (summary.totalWifiBytes / totalAll) * 100 : 0;
  const mobileRatio = totalAll > 0 ? (summary.totalMobileBytes / totalAll) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Primary Active Card */}
      <View style={[styles.card, { borderColor: `${accentColor}44` }]}>
        {/* Card Header */}
        <View style={styles.headerRow}>
          <View style={styles.sectionBadge}>
            <Icon name={iconName} size={16} color={accentColor} />
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

        {/* Download / Upload Proportion Bar */}
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

      {/* Dual Section Breakdown Comparison */}
      <View style={styles.comparisonCard}>
        <Text style={styles.comparisonTitle}>Network Type Breakdown</Text>

        <View style={styles.dualGrid}>
          {/* Wi-Fi Box */}
          <View style={[styles.subCard, { borderColor: theme.colors.wifiBorder }]}>
            <View style={styles.subCardHeader}>
              <Icon name="wifi" size={14} color={theme.colors.wifiLight} />
              <Text style={[styles.subCardTitle, { color: theme.colors.wifiLight }]}>Wi-Fi Usage</Text>
            </View>
            <Text style={styles.subCardValue}>{formatBytes(summary.totalWifiBytes, 2)}</Text>
            <View style={styles.subCardDetailRow}>
              <Text style={styles.subCardDetail}>↓ {formatBytes(summary.totalWifiRxBytes, 1)}</Text>
              <Text style={styles.subCardDetail}>↑ {formatBytes(summary.totalWifiTxBytes, 1)}</Text>
            </View>
            <Text style={styles.ratioPercentText}>{wifiRatio.toFixed(1)}% of total</Text>
          </View>

          {/* Mobile Box */}
          <View style={[styles.subCard, { borderColor: theme.colors.mobileBorder }]}>
            <View style={styles.subCardHeader}>
              <Icon name="cellular" size={14} color={theme.colors.mobileLight} />
              <Text style={[styles.subCardTitle, { color: theme.colors.mobileLight }]}>Mobile Usage</Text>
            </View>
            <Text style={styles.subCardValue}>{formatBytes(summary.totalMobileBytes, 2)}</Text>
            <View style={styles.subCardDetailRow}>
              <Text style={styles.subCardDetail}>↓ {formatBytes(summary.totalMobileRxBytes, 1)}</Text>
              <Text style={styles.subCardDetail}>↑ {formatBytes(summary.totalMobileTxBytes, 1)}</Text>
            </View>
            <Text style={styles.ratioPercentText}>{mobileRatio.toFixed(1)}% of total</Text>
          </View>
        </View>

        {/* Overall Split Bar */}
        <View style={styles.splitBarContainer}>
          <View style={[styles.wifiSplitBar, { width: `${Math.max(3, Math.min(97, wifiRatio))}%` }]} />
          <View style={[styles.mobileSplitBar, { width: `${Math.max(3, Math.min(97, mobileRatio))}%` }]} />
        </View>
        <View style={styles.splitLegendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.wifiLight }]} />
            <Text style={styles.legendLabel}>Wi-Fi ({wifiRatio.toFixed(0)}%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.mobileLight }]} />
            <Text style={styles.legendLabel}>Mobile ({mobileRatio.toFixed(0)}%)</Text>
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
    gap: 12,
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
  comparisonCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  comparisonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: theme.spacing.md,
  },
  dualGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: theme.spacing.md,
  },
  subCard: {
    flex: 1,
    backgroundColor: theme.colors.cardAlt,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
  },
  subCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  subCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  subCardValue: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  subCardDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  subCardDetail: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  ratioPercentText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  splitBarContainer: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.cardAlt,
    flexDirection: 'row',
    overflow: 'hidden',
    gap: 2,
    marginBottom: 8,
  },
  wifiSplitBar: {
    backgroundColor: theme.colors.wifiLight,
    height: '100%',
    borderRadius: 3,
  },
  mobileSplitBar: {
    backgroundColor: theme.colors.mobileLight,
    height: '100%',
    borderRadius: 3,
  },
  splitLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
});
