import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Icon } from './Icon';
import { TimeRange, TimeRangePreset } from '../types/dataUsage';
import { theme } from '../theme';
import { formatDate } from '../utils/formatters';

interface TimeRangeSelectorProps {
  ranges: TimeRange[];
  selectedRange: TimeRange;
  onSelectRange: (range: TimeRange) => void;
  onOpenCustomModal: () => void;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  ranges,
  selectedRange,
  onSelectRange,
  onOpenCustomModal,
}) => {
  const handlePillPress = (r: TimeRange) => {
    if (r.id === 'custom') {
      onOpenCustomModal();
    } else {
      onSelectRange(r);
    }
  };

  return (
    <View style={styles.container}>
      {/* Date Range Subheader */}
      <View style={styles.dateHeader}>
        <View style={styles.calendarIcon}>
          <Icon name="calendar-outline" size={14} color={theme.colors.textMuted} />
        </View>
        <Text style={styles.dateRangeText}>
          {formatDate(selectedRange.startDate)} — {formatDate(selectedRange.endDate)}
        </Text>
        <TouchableOpacity
          style={styles.customBtn}
          onPress={onOpenCustomModal}
          activeOpacity={0.7}
        >
          <Icon name="options-outline" size={14} color="#38BDF8" />
          <Text style={styles.customBtnText}>Custom</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {ranges.map((r) => {
          const isSelected = selectedRange.id === r.id;
          return (
            <TouchableOpacity
              key={r.id}
              style={[
                styles.pill,
                isSelected && styles.activePill,
              ]}
              onPress={() => handlePillPress(r)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  isSelected && styles.activePillText,
                ]}
              >
                {r.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    gap: 6,
  },
  calendarIcon: {
    marginRight: 2,
  },
  dateRangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    flex: 1,
  },
  customBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  customBtnText: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '600',
  },
  scrollList: {
    paddingHorizontal: theme.spacing.lg,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  activePill: {
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    borderColor: '#38BDF8',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
  activePillText: {
    color: '#38BDF8',
    fontWeight: '700',
  },
});

