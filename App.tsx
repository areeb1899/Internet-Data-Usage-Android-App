import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  StatusBar as RNStatusBar,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { NetworkType, TimeRange, AppUsageItem as AppUsageItemType, UsageSummary } from './src/types/dataUsage';
import { getPresetTimeRanges } from './src/utils/formatters';
import { dataUsageService } from './src/services/dataUsageService';
import { storageService } from './src/services/storageService';
import { NetworkStats } from './src/native/NetworkStats';
import { theme } from './src/theme';

import { Header } from './src/components/Header';
import { NavigationBar } from './src/components/NavigationBar';
import { TimeRangeSelector } from './src/components/TimeRangeSelector';
import { SummaryCard } from './src/components/SummaryCard';
import { AppUsageList } from './src/components/AppUsageList';
import { AppDetailModal } from './src/components/AppDetailModal';
import { CustomDateModal } from './src/components/CustomDateModal';

const presetRanges = getPresetTimeRanges();

function MainScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<NetworkType>('wifi');
  const [selectedRange, setSelectedRange] = useState<TimeRange>(presetRanges[0]); // default 'today'
  const [apps, setApps] = useState<AppUsageItemType[]>([]);
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
    appsCount: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isNative, setIsNative] = useState<boolean>(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(true);

  // Modals state
  const [selectedApp, setSelectedApp] = useState<AppUsageItemType | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
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

      setApps(response.apps);
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
    // After user returns from Settings, re-check
    setTimeout(() => {
      loadUsageData(true);
    }, 1500);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Data Usage',
      'Are you sure you want to reset all recorded internet usage data? This will clear historical statistics.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            await storageService.resetData();
            await loadUsageData(true);
          },
        },
      ]
    );
  };

  const handleAppPress = (app: AppUsageItemType) => {
    setSelectedApp(app);
    setIsDetailModalVisible(true);
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

      {/* Top Header */}
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

      {/* Scrollable Core Screen */}
      <ScrollView
        style={styles.scrollView}
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

        {/* Selected Section Summary Metrics Card */}
        <SummaryCard activeTab={activeTab} summary={summary} />

        {/* Per-App Data Usage List */}
        <AppUsageList
          apps={apps}
          activeTab={activeTab}
          onSelectApp={handleAppPress}
        />
      </ScrollView>

      {/* Per-App Detailed Breakdown Modal */}
      <AppDetailModal
        visible={isDetailModalVisible}
        app={selectedApp}
        onClose={() => {
          setIsDetailModalVisible(false);
          setSelectedApp(null);
        }}
      />

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
});

