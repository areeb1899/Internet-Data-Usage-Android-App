import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Icon } from './Icon';
import { AppUsageItem as AppUsageItemType, NetworkType } from '../types/dataUsage';
import { AppUsageItem } from './AppUsageItem';
import { theme } from '../theme';

interface AppUsageListProps {
  apps: AppUsageItemType[];
  activeTab: NetworkType;
  onSelectApp: (app: AppUsageItemType) => void;
}

type SortOrder = 'desc' | 'asc' | 'alpha';

export const AppUsageList: React.FC<AppUsageListProps> = ({
  apps,
  activeTab,
  onSelectApp,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Filter and sort apps
  const filteredApps = useMemo(() => {
    let result = apps.filter((app) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        app.appName.toLowerCase().includes(q) ||
        app.packageName.toLowerCase().includes(q)
      );
    });

    result.sort((a, b) => {
      let aVal = 0;
      let bVal = 0;

      if (activeTab === 'wifi') {
        aVal = a.wifiTotalBytes;
        bVal = b.wifiTotalBytes;
      } else if (activeTab === 'mobile') {
        aVal = a.mobileTotalBytes;
        bVal = b.mobileTotalBytes;
      } else {
        aVal = a.totalBytes;
        bVal = b.totalBytes;
      }

      if (sortOrder === 'desc') {
        return bVal - aVal;
      } else if (sortOrder === 'asc') {
        return aVal - bVal;
      } else {
        return a.appName.localeCompare(b.appName);
      }
    });

    return result;
  }, [apps, searchQuery, sortOrder, activeTab]);

  // Max usage in current filtered list for proportional bar calculation
  const maxUsageBytes = useMemo(() => {
    if (!filteredApps.length) return 1;
    const top = filteredApps[0];
    if (activeTab === 'wifi') return top.wifiTotalBytes;
    if (activeTab === 'mobile') return top.mobileTotalBytes;
    return top.totalBytes;
  }, [filteredApps, activeTab]);

  const sectionLabel =
    activeTab === 'wifi'
      ? 'Wi-Fi App Usage'
      : activeTab === 'mobile'
      ? 'Mobile App Usage'
      : 'All Network App Usage';

  return (
    <View style={styles.container}>
      {/* Search & Sort Bar */}
      <View style={styles.controlsRow}>
        <View style={styles.searchBar}>
          <Icon name="search" size={16} color={theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search app name or package..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="close-circle" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Sort Cycle Button */}
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => {
            if (sortOrder === 'desc') setSortOrder('asc');
            else if (sortOrder === 'asc') setSortOrder('alpha');
            else setSortOrder('desc');
          }}
          activeOpacity={0.7}
        >
          <Icon
            name={sortOrder === 'desc' ? 'arrow-down' : sortOrder === 'asc' ? 'arrow-up' : 'text'}
            size={14}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.sortText}>
            {sortOrder === 'desc' ? 'High' : sortOrder === 'asc' ? 'Low' : 'A-Z'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* List Header */}
      <View style={styles.listHeaderRow}>
        <Text style={styles.sectionHeaderTitle}>{sectionLabel}</Text>
        <Text style={styles.countText}>{filteredApps.length} apps</Text>
      </View>

      {/* App List */}
      {filteredApps.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="filter-outline" size={32} color={theme.colors.textMuted} />
          <Text style={styles.emptyTitle}>No apps found</Text>
          <Text style={styles.emptySubtitle}>No data recorded matching "{searchQuery}"</Text>
        </View>
      ) : (
        <FlatList
          data={filteredApps}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AppUsageItem
              item={item}
              activeTab={activeTab}
              maxUsageBytes={maxUsageBytes}
              onPress={onSelectApp}
            />
          )}
          scrollEnabled={false} // Parent ScrollView handles full page scrolling smoothly
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 13,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.borderRadius.md,
    height: 40,
    paddingHorizontal: 10,
    gap: 4,
  },
  sortText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: 0.2,
  },
  countText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
});

