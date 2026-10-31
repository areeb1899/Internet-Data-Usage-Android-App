import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Icon } from './Icon';
import { TimeRange } from '../types/dataUsage';
import { theme } from '../theme';
import { formatDate, toDateKey } from '../utils/formatters';

interface CustomDateModalProps {
  visible: boolean;
  currentRange: TimeRange;
  onApplyRange: (range: TimeRange) => void;
  onClose: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CustomDateModal: React.FC<CustomDateModalProps> = ({
  visible,
  currentRange,
  onApplyRange,
  onClose,
}) => {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const oneYearAgo = useMemo(() => {
    const y = new Date(today);
    y.setDate(y.getDate() - 365);
    return y;
  }, [today]);

  // Calendar navigation state
  const [viewDate, setViewDate] = useState<Date>(() => {
    const d = new Date(currentRange.endDate || today);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Range selection state
  const [selectedStart, setSelectedStart] = useState<Date | null>(
    () => new Date(currentRange.startDate)
  );
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(
    () => new Date(currentRange.endDate)
  );

  // Month navigation limits
  const isCurrentMonthOrFuture =
    viewDate.getFullYear() > today.getFullYear() ||
    (viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() >= today.getMonth());

  const isOldestMonth =
    viewDate.getFullYear() < oneYearAgo.getFullYear() ||
    (viewDate.getFullYear() === oneYearAgo.getFullYear() && viewDate.getMonth() <= oneYearAgo.getMonth());

  const handlePrevMonth = () => {
    if (isOldestMonth) return;
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    if (isCurrentMonthOrFuture) return;
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  // Build grid of days for the viewDate month
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstWeekday = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = [];

    // Preceding empty slots
    for (let i = 0; i < firstWeekday; i++) {
      days.push(null);
    }

    // Days of month
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d, 0, 0, 0, 0));
    }

    return days;
  }, [viewDate]);

  // Handle day tap
  const handleDayPress = (day: Date) => {
    if (day > today || day < oneYearAgo) return;

    if (!selectedStart || (selectedStart && selectedEnd)) {
      // Step 1: select start date
      setSelectedStart(day);
      setSelectedEnd(null);
    } else {
      // Step 2: select end date
      if (day < selectedStart) {
        // If tapped date is before start date, treat as new start date
        setSelectedStart(day);
        setSelectedEnd(null);
      } else {
        setSelectedEnd(day);
      }
    }
  };

  // Quick preset shortcuts
  const handleQuickPreset = (days: number) => {
    const end = new Date(today);
    const start = new Date(today);
    start.setDate(start.getDate() - (days - 1));
    setSelectedStart(start);
    setSelectedEnd(end);
    setViewDate(new Date(end.getFullYear(), end.getMonth(), 1));
  };

  const handleApply = () => {
    if (!selectedStart) return;

    const start = new Date(selectedStart);
    start.setHours(0, 0, 0, 0);

    const end = new Date(selectedEnd || selectedStart);
    end.setHours(23, 59, 59, 999);

    const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);

    onApplyRange({
      id: 'custom',
      label: `Custom (${diffDays}d)`,
      startDate: start,
      endDate: end,
    });
    onClose();
  };

  // Status message
  const rangeInfo = useMemo(() => {
    if (selectedStart && selectedEnd) {
      const diff = Math.max(1, Math.round((selectedEnd.getTime() - selectedStart.getTime()) / (1000 * 3600 * 24)) + 1);
      return {
        title: `${formatDate(selectedStart)} — ${formatDate(selectedEnd)}`,
        sub: `${diff} ${diff === 1 ? 'day' : 'days'} selected`,
        complete: true,
      };
    }
    if (selectedStart) {
      return {
        title: `Start: ${formatDate(selectedStart)}`,
        sub: 'Now tap an end date on the calendar',
        complete: false,
      };
    }
    return {
      title: 'Select a Date Range',
      sub: 'Tap a start date on the calendar',
      complete: false,
    };
  }, [selectedStart, selectedEnd]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <Icon name="calendar" size={17} color="#38BDF8" />
              <Text style={styles.modalTitle}>Select Custom Range</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="close" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Status & Preview Banner */}
            <View style={[styles.previewBox, rangeInfo.complete && styles.previewBoxComplete]}>
              <Text style={styles.previewTitle} numberOfLines={1}>
                {rangeInfo.title}
              </Text>
              <Text style={styles.previewSub}>{rangeInfo.sub}</Text>
            </View>

            {/* Quick Shortcuts */}
            <View style={styles.shortcutsRow}>
              <TouchableOpacity
                style={styles.shortcutChip}
                onPress={() => handleQuickPreset(7)}
                activeOpacity={0.7}
              >
                <Text style={styles.shortcutText}>7 Days</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shortcutChip}
                onPress={() => handleQuickPreset(14)}
                activeOpacity={0.7}
              >
                <Text style={styles.shortcutText}>14 Days</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shortcutChip}
                onPress={() => handleQuickPreset(30)}
                activeOpacity={0.7}
              >
                <Text style={styles.shortcutText}>30 Days</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shortcutChip}
                onPress={() => {
                  setSelectedStart(new Date(today.getFullYear(), today.getMonth(), 1));
                  setSelectedEnd(new Date(today));
                  setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.shortcutText}>This Month</Text>
              </TouchableOpacity>
            </View>

            {/* Interactive Calendar Month Navigator */}
            <View style={styles.calendarCard}>
              <View style={styles.monthNavRow}>
                <TouchableOpacity
                  style={[styles.navArrow, isOldestMonth && styles.navArrowDisabled]}
                  onPress={handlePrevMonth}
                  disabled={isOldestMonth}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon
                    name="chevron-back"
                    size={18}
                    color={isOldestMonth ? theme.colors.textMuted : theme.colors.textPrimary}
                  />
                </TouchableOpacity>

                <Text style={styles.monthTitle}>
                  {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
                </Text>

                <TouchableOpacity
                  style={[styles.navArrow, isCurrentMonthOrFuture && styles.navArrowDisabled]}
                  onPress={handleNextMonth}
                  disabled={isCurrentMonthOrFuture}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon
                    name="chevron-forward"
                    size={18}
                    color={isCurrentMonthOrFuture ? theme.colors.textMuted : theme.colors.textPrimary}
                  />
                </TouchableOpacity>
              </View>

              {/* Weekdays Row */}
              <View style={styles.weekdaysRow}>
                {WEEKDAYS.map((w, idx) => (
                  <Text key={idx} style={styles.weekdayLabel}>
                    {w}
                  </Text>
                ))}
              </View>

              {/* Month Days Grid */}
              <View style={styles.daysGrid}>
                {calendarDays.map((day, idx) => {
                  if (!day) {
                    return <View key={`empty-${idx}`} style={styles.dayCell} />;
                  }

                  const dayKey = toDateKey(day);
                  const isFuture = day > today;
                  const isTooOld = day < oneYearAgo;
                  const isDisabled = isFuture || isTooOld;

                  const isStart = selectedStart && toDateKey(selectedStart) === dayKey;
                  const isEnd = selectedEnd && toDateKey(selectedEnd) === dayKey;
                  const isSelectedEndpoint = isStart || isEnd;

                  const isInRange =
                    selectedStart &&
                    selectedEnd &&
                    day > selectedStart &&
                    day < selectedEnd;

                  const isCurrentDay = dayKey === toDateKey(today);

                  return (
                    <TouchableOpacity
                      key={dayKey}
                      style={[
                        styles.dayCell,
                        isInRange && styles.dayCellInRange,
                      ]}
                      onPress={() => handleDayPress(day)}
                      disabled={isDisabled}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.dayCircle,
                          isSelectedEndpoint && styles.dayCircleSelected,
                          isCurrentDay && !isSelectedEndpoint && styles.dayCircleToday,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            isDisabled && styles.dayTextDisabled,
                            isInRange && styles.dayTextInRange,
                            isSelectedEndpoint && styles.dayTextSelected,
                          ]}
                        >
                          {day.getDate()}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyBtn, !selectedStart && styles.applyBtnDisabled]}
              onPress={handleApply}
              disabled={!selectedStart}
              activeOpacity={0.8}
            >
              <Text style={styles.applyBtnText}>Apply Date Range</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: theme.colors.cardAlt,
  },
  scrollBody: {
    padding: theme.spacing.md,
  },
  previewBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  previewBoxComplete: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: '#38BDF8',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  previewSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#38BDF8',
    marginTop: 2,
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  shortcutChip: {
    flex: 1,
    backgroundColor: theme.colors.cardAlt,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  shortcutText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  calendarCard: {
    backgroundColor: theme.colors.cardAlt,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  monthNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  navArrow: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  navArrowDisabled: {
    opacity: 0.3,
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayLabel: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellInRange: {
    backgroundColor: 'rgba(56, 189, 248, 0.16)',
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    backgroundColor: '#0284C7',
  },
  dayCircleToday: {
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  dayTextDisabled: {
    color: 'rgba(148, 163, 184, 0.25)',
  },
  dayTextInRange: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    gap: 10,
    backgroundColor: theme.colors.card,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.cardAlt,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  applyBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#0284C7',
    alignItems: 'center',
  },
  applyBtnDisabled: {
    opacity: 0.5,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
