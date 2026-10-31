import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Icon } from './Icon';
import { TimeRange } from '../types/dataUsage';
import { theme } from '../theme';
import { formatDate } from '../utils/formatters';

interface CustomDateModalProps {
  visible: boolean;
  currentRange: TimeRange;
  onApplyRange: (range: TimeRange) => void;
  onClose: () => void;
}

interface CustomPreset {
  label: string;
  sublabel: string;
  days: number;
}

const PRESETS: CustomPreset[] = [
  { label: 'Past 30 Days', sublabel: '1 full billing cycle', days: 30 },
  { label: 'Past 14 Days', sublabel: '2 weeks period', days: 14 },
  { label: 'Past 7 Days', sublabel: '1 week period', days: 7 },
  { label: 'Past 3 Days', sublabel: 'Recent 72 hours', days: 3 },
  { label: 'Past 60 Days', sublabel: '2 billing cycles', days: 60 },
  { label: 'Past 90 Days', sublabel: 'Quarterly review', days: 90 },
];

export const CustomDateModal: React.FC<CustomDateModalProps> = ({
  visible,
  currentRange,
  onApplyRange,
  onClose,
}) => {
  const [selectedDays, setSelectedDays] = useState(30);

  const calculateDates = (days: number) => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);
    return { start, end };
  };

  const handleApply = (days: number) => {
    const { start, end } = calculateDates(days);
    onApplyRange({
      id: 'custom',
      label: `Custom (${days}d)`,
      startDate: start,
      endDate: end,
    });
    onClose();
  };

  const preview = calculateDates(selectedDays);

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
              <Icon name="calendar" size={18} color="#38BDF8" />
              <Text style={styles.modalTitle}>Custom Date Range</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Active Preview */}
          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>Effective Window ({selectedDays} days):</Text>
            <Text style={styles.previewDates}>
              {formatDate(preview.start)} — {formatDate(preview.end)}
            </Text>
          </View>

          {/* Presets List */}
          <View style={styles.presetsList}>
            {PRESETS.map((p) => {
              const isSelected = selectedDays === p.days;
              return (
                <TouchableOpacity
                  key={p.days}
                  style={[styles.presetRow, isSelected && styles.activePresetRow]}
                  onPress={() => setSelectedDays(p.days)}
                  activeOpacity={0.7}
                >
                  <View style={styles.presetTextCol}>
                    <Text style={[styles.presetLabel, isSelected && styles.activePresetLabel]}>
                      {p.label}
                    </Text>
                    <Text style={styles.presetSublabel}>{p.sublabel}</Text>
                  </View>
                  <View style={[styles.radioCircle, isSelected && styles.activeRadioCircle]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Action Footer */}
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => handleApply(selectedDays)}
              activeOpacity={0.8}
            >
              <Text style={styles.applyBtnText}>Apply Window</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
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
  previewBox: {
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  previewLabel: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '600',
    marginBottom: 2,
  },
  previewDates: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  presetsList: {
    paddingHorizontal: theme.spacing.lg,
    gap: 8,
    marginBottom: theme.spacing.lg,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.cardAlt,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  activePresetRow: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.06)',
  },
  presetTextCol: {
    flex: 1,
  },
  presetLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  activePresetLabel: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  presetSublabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeRadioCircle: {
    borderColor: '#38BDF8',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#38BDF8',
  },
  footerRow: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    gap: 12,
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
  },
  applyBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#0284C7',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
