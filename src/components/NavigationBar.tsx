import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Icon } from './Icon';
import { NetworkType } from '../types/dataUsage';
import { theme } from '../theme';
import { formatBytes } from '../utils/formatters';

interface NavigationBarProps {
  activeTab: NetworkType;
  onTabChange: (tab: NetworkType) => void;
  wifiTotalBytes: number;
  mobileTotalBytes: number;
  grandTotalBytes: number;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeTab,
  onTabChange,
  wifiTotalBytes,
  mobileTotalBytes,
  grandTotalBytes,
}) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 360;

  return (
    <View style={styles.wrapper}>
      {/* Tab Navigation Buttons */}
      <View style={styles.container}>
        {/* Wi-Fi Section Button */}
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'wifi' && styles.activeWifiTab,
          ]}
          onPress={() => onTabChange('wifi')}
          activeOpacity={0.8}
        >
          <View style={styles.tabContent}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: activeTab === 'wifi' ? 'rgba(56, 189, 248, 0.2)' : 'transparent' },
              ]}
            >
              <Icon
                name="wifi"
                size={18}
                color={activeTab === 'wifi' ? theme.colors.wifiLight : theme.colors.textMuted}
              />
            </View>
            <View style={styles.textColumn}>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'wifi' && styles.activeWifiLabel,
                ]}
              >
                Wi-Fi Data
              </Text>
              <Text
                style={[
                  styles.tabValue,
                  activeTab === 'wifi' ? { color: theme.colors.wifiLight } : null,
                ]}
                numberOfLines={1}
              >
                {formatBytes(wifiTotalBytes, 1)}
              </Text>
            </View>
          </View>
          {activeTab === 'wifi' && <View style={[styles.activeIndicator, { backgroundColor: theme.colors.wifiLight }]} />}
        </TouchableOpacity>

        {/* Mobile Data Section Button */}
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'mobile' && styles.activeMobileTab,
          ]}
          onPress={() => onTabChange('mobile')}
          activeOpacity={0.8}
        >
          <View style={styles.tabContent}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: activeTab === 'mobile' ? 'rgba(16, 185, 129, 0.2)' : 'transparent' },
              ]}
            >
              <Icon
                name="cellular"
                size={18}
                color={activeTab === 'mobile' ? theme.colors.mobileLight : theme.colors.textMuted}
              />
            </View>
            <View style={styles.textColumn}>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'mobile' && styles.activeMobileLabel,
                ]}
              >
                Mobile Data
              </Text>
              <Text
                style={[
                  styles.tabValue,
                  activeTab === 'mobile' ? { color: theme.colors.mobileLight } : null,
                ]}
                numberOfLines={1}
              >
                {formatBytes(mobileTotalBytes, 1)}
              </Text>
            </View>
          </View>
          {activeTab === 'mobile' && <View style={[styles.activeIndicator, { backgroundColor: theme.colors.mobileLight }]} />}
        </TouchableOpacity>

        {/* Combined / Total Section Button */}
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'both' && styles.activeBothTab,
          ]}
          onPress={() => onTabChange('both')}
          activeOpacity={0.8}
        >
          <View style={styles.tabContent}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: activeTab === 'both' ? 'rgba(99, 102, 241, 0.2)' : 'transparent' },
              ]}
            >
              <Icon
                name="pie-chart"
                size={18}
                color={activeTab === 'both' ? theme.colors.bothLight : theme.colors.textMuted}
              />
            </View>
            <View style={styles.textColumn}>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'both' && styles.activeBothLabel,
                ]}
              >
                {isCompact ? 'Total' : 'All Data'}
              </Text>
              <Text
                style={[
                  styles.tabValue,
                  activeTab === 'both' ? { color: theme.colors.bothLight } : null,
                ]}
                numberOfLines={1}
              >
                {formatBytes(grandTotalBytes, 1)}
              </Text>
            </View>
          </View>
          {activeTab === 'both' && <View style={[styles.activeIndicator, { backgroundColor: theme.colors.bothLight }]} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
    backgroundColor: theme.colors.background,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  activeWifiTab: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: theme.colors.wifiBorder,
    borderWidth: 1,
  },
  activeMobileTab: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: theme.colors.mobileBorder,
    borderWidth: 1,
  },
  activeBothTab: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: theme.colors.bothBorder,
    borderWidth: 1,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 2,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  activeWifiLabel: {
    color: theme.colors.wifiLight,
    fontWeight: '700',
  },
  activeMobileLabel: {
    color: theme.colors.mobileLight,
    fontWeight: '700',
  },
  activeBothLabel: {
    color: theme.colors.bothLight,
    fontWeight: '700',
  },
  tabValue: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 2,
    borderRadius: 1,
  },
});

