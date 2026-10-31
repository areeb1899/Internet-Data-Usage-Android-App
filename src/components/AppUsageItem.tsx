import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from './Icon';
import { AppUsageItem as AppUsageItemType, NetworkType } from '../types/dataUsage';
import { theme } from '../theme';
import { formatBytes } from '../utils/formatters';

interface AppUsageItemProps {
  item: AppUsageItemType;
  activeTab: NetworkType;
  maxUsageBytes: number;
  onPress: (item: AppUsageItemType) => void;
}

export const AppUsageItem: React.FC<AppUsageItemProps> = ({
  item,
  activeTab,
  maxUsageBytes,
  onPress,
}) => {
  // Determine relevant values according to section
  let usageBytes = 0;
  let rxBytes = 0;
  let txBytes = 0;
  let accentColor = theme.colors.wifiLight;

  if (activeTab === 'wifi') {
    usageBytes = item.wifiTotalBytes;
    rxBytes = item.wifiRxBytes;
    txBytes = item.wifiTxBytes;
    accentColor = theme.colors.wifiLight;
  } else if (activeTab === 'mobile') {
    usageBytes = item.mobileTotalBytes;
    rxBytes = item.mobileRxBytes;
    txBytes = item.mobileTxBytes;
    accentColor = theme.colors.mobileLight;
  } else {
    usageBytes = item.totalBytes;
    rxBytes = item.wifiRxBytes + item.mobileRxBytes;
    txBytes = item.wifiTxBytes + item.mobileTxBytes;
    accentColor = theme.colors.bothLight;
  }

  const percentOfMax = maxUsageBytes > 0 ? Math.min(100, Math.max(2, (usageBytes / maxUsageBytes) * 100)) : 0;
  const initial = item.appName.charAt(0).toUpperCase();

  const isSystem = item.appType === 'system';
  const isRemoved = item.appType === 'removed';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSystem && styles.systemCard,
        isRemoved && styles.removedCard,
      ]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.contentRow}>
        {/* App Avatar */}
        <View style={[styles.avatar, { backgroundColor: item.iconColor }]}>
          {isSystem ? (
            <Icon name="settings" size={20} color="#FFFFFF" />
          ) : isRemoved ? (
            <Icon name="trash" size={20} color="#FFFFFF" />
          ) : (
            <Text style={styles.avatarText}>{initial}</Text>
          )}
        </View>

        {/* Middle: App Name & Subdetails */}
        <View style={styles.middleColumn}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.appName,
                isRemoved && { color: '#F87171' },
                isSystem && { color: '#E2E8F0' },
              ]}
              numberOfLines={1}
            >
              {item.appName}
            </Text>
            {isSystem && (
              <View style={styles.systemBadge}>
                <Text style={styles.systemBadgeText}>System</Text>
              </View>
            )}
            {isRemoved && (
              <View style={styles.removedBadge}>
                <Text style={styles.removedBadgeText}>Uninstalled</Text>
              </View>
            )}
          </View>

          <Text style={styles.sublabel} numberOfLines={1}>
            {isSystem
              ? 'OS & Background Services'
              : isRemoved
              ? 'Previously used internet on mobile'
              : 'Installed on this device'}
          </Text>

          {/* Rx / Tx Micro Stats */}
          <View style={styles.rxTxRow}>
            <View style={styles.miniStat}>
              <Icon name="arrow-down" size={10} color={theme.colors.rxDownload} />
              <Text style={styles.miniStatText}>{formatBytes(rxBytes, 1)}</Text>
            </View>
            <View style={styles.miniStat}>
              <Icon name="arrow-up" size={10} color={theme.colors.txUpload} />
              <Text style={styles.miniStatText}>{formatBytes(txBytes, 1)}</Text>
            </View>
          </View>
        </View>

        {/* Right: Usage total and arrow */}
        <View style={styles.rightColumn}>
          <Text style={[styles.usageTotalText, { color: accentColor }]}>
            {formatBytes(usageBytes, 1)}
          </Text>
          <Icon name="chevron-forward" size={14} color={theme.colors.textMuted} />
        </View>
      </View>

      {/* Progress Bar of Top Consumption */}
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${percentOfMax}%`,
              backgroundColor: accentColor,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    marginBottom: 8,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  systemCard: {
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  removedCard: {
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  middleColumn: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  systemBadge: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  systemBadgeText: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '600',
  },
  removedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  removedBadgeText: {
    fontSize: 9,
    color: '#EF4444',
    fontWeight: '600',
  },
  sublabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  rxTxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  miniStatText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  rightColumn: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 6,
  },
  usageTotalText: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: theme.colors.cardAlt,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});
