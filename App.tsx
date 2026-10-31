import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  Platform,
  Alert,
  Text,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { NetworkType, TimeRange, UsageSummary } from './src/types/dataUsage';
import { getPresetTimeRanges } from './src/utils/formatters';
import { dataUsageService } from './src/services/dataUsageService';
import { storageService } from './src/services/storageService';
import { NetworkStats } from './src/native/NetworkStats';
import { theme } from './src/theme';

import { Header } from './src/components/Header';
import { NavigationBar } from './src/components/NavigationBar';
import { TimeRangeSelector } from './src/components/TimeRangeSelector';
import { SummaryCard } from './src/components/SummaryCard';
import { CustomDateModal } from './src/components/CustomDateModal';

const presetRanges = getPresetTimeRanges();

function MainScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<NetworkType>('wifi');
  const [selectedRange, setSelectedRange] = useState<TimeRange>(presetRanges[0]); // default 'today'
  const [summary, setSummary] = useState<UsageSummary>({
    totalWifiBytes: 0,
    totalWifiRxBytes: 0,
    totalWifiTxBytes: 0,
    totalMobileBytes: 0,
    totalMobileRxBytes: 0,
    totalMobileTxBytes: 0,
    grandTotalBytes: 0,
    daysInRange: 1,
    dailyAvgWifiBytes: 0,
    dailyAvgMobileBytes: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isNative, setIsNative] = useState<boolean>(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(true);
  const [isCustomDateModalVisible, setIsCustomDateModalVisible] = useState<boolean>(false);

  // Load data for the chosen date range
  const loadUsageData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await dataUsageService.getDataUsage(
        selectedRange.startDate,
        selectedRange.endDate
      );

      setSummary(response.summary);
      setIsNative(response.isNative);
      setPermissionGranted(response.permissionGranted);
    } catch (error) {
      console.warn('Failed to load usage data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedRange]);

  // Initial load
  useEffect(() => {
    const initApp = async () => {
      await dataUsageService.init();
      loadUsageData();
    };
    initApp();
  }, [loadUsageData]);

  // Request system permission if native Android
  const handleRequestPermission = async () => {
    await NetworkStats.requestPermission();
    setTimeout(() => {
      loadUsageData(true);
    }, 1500);
  };

  // Foolproof Reset action
  const executeReset = async () => {
    setIsLoading(true);
    try {
      await storageService.resetData();
      await loadUsageData(true);
    } catch (err) {
      console.warn('Reset error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Reset all internet data usage records to 0 B?')) {
        executeReset();
      }
      return;
    }

    Alert.alert(
      'Reset Data Usage',
      'Are you sure you want to reset all recorded internet usage data? All statistics will be reset to 0 B.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: executeReset,
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View
      style={[
        styles.fullScreen,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <StatusBar style="light" backgroundColor={theme.colors.background} />

      {/* Top Header with App Icon and Reset Button */}
      <Header
        isNative={isNative}
        permissionGranted={permissionGranted}
        isLoading={isLoading}
        onRefresh={() => loadUsageData(true)}
        onRequestPermission={handleRequestPermission}
        onReset={handleReset}
      />

      {/* Prominent Navigation Switcher (Wi-Fi | Mobile | Combined) */}
      <NavigationBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        wifiTotalBytes={summary.totalWifiBytes}
        mobileTotalBytes={summary.totalMobileBytes}
        grandTotalBytes={summary.grandTotalBytes}
      />

      {/* Scrollable Core Dashboard */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadUsageData(true)}
            tintColor="#38BDF8"
            colors={['#38BDF8']}
          />
        }
      >
        {/* Time Range Selector & Custom Picker */}
        <TimeRangeSelector
          ranges={presetRanges}
          selectedRange={selectedRange}
          onSelectRange={setSelectedRange}
          onOpenCustomModal={() => setIsCustomDateModalVisible(true)}
        />

        {/* Selected Section Total Usage Metrics & Breakdown */}
        <SummaryCard activeTab={activeTab} summary={summary} />

        {/* Bottom Credits Footer */}
        <View style={styles.footerContainer}>
          <View style={styles.footerDivider} />
          <Text style={styles.footerText}>Developed by Areeb Ahmed v1.1</Text>
        </View>
      </ScrollView>

      {/* Custom Time Range Selector Modal */}
      <CustomDateModal
        visible={isCustomDateModalVisible}
        currentRange={selectedRange}
        onApplyRange={setSelectedRange}
        onClose={() => setIsCustomDateModalVisible(false)}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    paddingHorizontal: 24,
  },
  footerDivider: {
    width: '60%',
    height: 1,
    backgroundColor: theme.colors.cardBorder,
    marginBottom: 16,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
});
