import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Icon } from './Icon';
import { AppUsageItem } from '../types/dataUsage';
import { theme } from '../theme';
import { formatBytes } from '../utils/formatters';

interface AppDetailModalProps {
  visible: boolean;
  app: AppUsageItem | null;
  onClose: () => void;
}

export const AppDetailModal: React.FC<AppDetailModalProps> = ({
  visible,
  app,
  onClose,
}) => {
  if (!app) return null;

  const initial = app.appName.charAt(0).toUpperCase();
  const total = app.totalBytes;
  const wifiRatio = total > 0 ? (app.wifiTotalBytes / total) * 100 : 0;
  const mobileRatio = total > 0 ? (app.mobileTotalBytes / total) * 100 : 0;

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
            <View style={styles.appHeaderInfo}>
              <View style={[styles.avatar, { backgroundColor: app.iconColor }]}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <View style={styles.headerTexts}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {app.appName}
                </Text>
                <Text style={styles.modalSubtitle} numberOfLines={1}>
                  {app.packageName}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Grand Total for App */}
            <View style={styles.totalBox}>
              <Text style={styles.totalBoxLabel}>Total Consumed</Text>
              <Text style={styles.totalBoxValue}>{formatBytes(app.totalBytes, 2)}</Text>
            </View>

            {/* Split Distribution Bar */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Network Distribution</Text>
            </View>
            <View style={styles.ratioBarContainer}>
              <View style={[styles.ratioBarWifi, { width: `${Math.max(4, Math.min(96, wifiRatio))}%` }]} />
              <View style={[styles.ratioBarMobile, { width: `${Math.max(4, Math.min(96, mobileRatio))}%` }]} />
            </View>
            <View style={styles.ratioLegendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: theme.colors.wifiLight }]} />
                <Text style={styles.legendText}>Wi-Fi: {wifiRatio.toFixed(1)}%</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: theme.colors.mobileLight }]} />
                <Text style={styles.legendText}>Mobile: {mobileRatio.toFixed(1)}%</Text>
              </View>
            </View>

            {/* Wi-Fi Details Card */}
            <View style={[styles.detailCard, { borderColor: theme.colors.wifiBorder }]}>
              <View style={styles.detailCardHeader}>
                <View style={styles.detailTitleRow}>
                  <Icon name="wifi" size={16} color={theme.colors.wifiLight} />
                  <Text style={[styles.detailSectionTitle, { color: theme.colors.wifiLight }]}>
                    Wi-Fi Consumption
                  </Text>
                </View>
                <Text style={[styles.detailTotalText, { color: theme.colors.wifiLight }]}>
                  {formatBytes(app.wifiTotalBytes, 2)}
                </Text>
              </View>

              <View style={styles.metricsGrid}>
                <View style={styles.subMetric}>
                  <View style={styles.subMetricLabelRow}>
                    <Icon name="arrow-down" size={12} color={theme.colors.rxDownload} />
                    <Text style={styles.subMetricLabel}>Download (Rx)</Text>
                  </View>
                  <Text style={styles.subMetricValue}>{formatBytes(app.wifiRxBytes, 2)}</Text>
                </View>
                <View style={styles.subMetric}>
                  <View style={styles.subMetricLabelRow}>
                    <Icon name="arrow-up" size={12} color={theme.colors.txUpload} />
                    <Text style={styles.subMetricLabel}>Upload (Tx)</Text>
                  </View>
                  <Text style={styles.subMetricValue}>{formatBytes(app.wifiTxBytes, 2)}</Text>
                </View>
              </View>
            </View>

            {/* Mobile Details Card */}
            <View style={[styles.detailCard, { borderColor: theme.colors.mobileBorder }]}>
              <View style={styles.detailCardHeader}>
                <View style={styles.detailTitleRow}>
                  <Icon name="cellular" size={16} color={theme.colors.mobileLight} />
                  <Text style={[styles.detailSectionTitle, { color: theme.colors.mobileLight }]}>
                    Mobile Data Consumption
                  </Text>
                </View>
                <Text style={[styles.detailTotalText, { color: theme.colors.mobileLight }]}>
                  {formatBytes(app.mobileTotalBytes, 2)}
                </Text>
              </View>

              <View style={styles.metricsGrid}>
                <View style={styles.subMetric}>
                  <View style={styles.subMetricLabelRow}>
                    <Icon name="arrow-down" size={12} color={theme.colors.rxDownload} />
                    <Text style={styles.subMetricLabel}>Download (Rx)</Text>
                  </View>
                  <Text style={styles.subMetricValue}>{formatBytes(app.mobileRxBytes, 2)}</Text>
                </View>
                <View style={styles.subMetric}>
                  <View style={styles.subMetricLabelRow}>
                    <Icon name="arrow-up" size={12} color={theme.colors.txUpload} />
                    <Text style={styles.subMetricLabel}>Upload (Tx)</Text>
                  </View>
                  <Text style={styles.subMetricValue}>{formatBytes(app.mobileTxBytes, 2)}</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Dismiss button */}
          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.doneBtnText}>Close</Text>
          </TouchableOpacity>
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
    maxHeight: '85%',
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
  appHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  headerTexts: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: theme.colors.cardAlt,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  totalBox: {
    backgroundColor: theme.colors.cardAlt,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  totalBoxLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
    marginBottom: 2,
  },
  totalBoxValue: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  sectionHeader: {
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  ratioBarContainer: {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.cardAlt,
    flexDirection: 'row',
    overflow: 'hidden',
    gap: 2,
    marginBottom: 6,
  },
  ratioBarWifi: {
    backgroundColor: theme.colors.wifiLight,
    height: '100%',
  },
  ratioBarMobile: {
    backgroundColor: theme.colors.mobileLight,
    height: '100%',
  },
  ratioLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  detailCard: {
    backgroundColor: theme.colors.cardAlt,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
  },
  detailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  detailTotalText: {
    fontSize: 14,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.sm,
    padding: 10,
  },
  subMetric: {
    flex: 1,
  },
  subMetricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  subMetricLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  subMetricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  doneBtn: {
    backgroundColor: theme.colors.cardAlt,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
});

