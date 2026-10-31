import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Icon } from './Icon';
import { theme } from '../theme';

interface HeaderProps {
  isNative: boolean;
  permissionGranted: boolean;
  isLoading: boolean;
  onRefresh: () => void;
  onRequestPermission: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isNative,
  permissionGranted,
  isLoading,
  onRefresh,
  onRequestPermission,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.logoBadge}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <View>
          <Text style={styles.appName}>Internet Usage</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.statusDot, { backgroundColor: isNative ? '#10B981' : '#38BDF8' }]} />
            <Text style={styles.statusText}>
              {isNative
                ? permissionGranted
                  ? 'Android Live Stats'
                  : 'Needs Usage Access'
                : '1-Year History Vault'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsRow}>
        {isNative && !permissionGranted && (
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={onRequestPermission}
            activeOpacity={0.8}
          >
            <Icon name="key-outline" size={14} color="#EF4444" />
            <Text style={styles.permissionText}>Grant Access</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#38BDF8" />
          ) : (
            <Icon name="reload" size={18} color="#94A3B8" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
    backgroundColor: theme.colors.background,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    padding: 3,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: 0.3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  permissionText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '600',
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

