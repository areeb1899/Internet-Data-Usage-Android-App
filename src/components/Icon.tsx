import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type IconName =
  | 'wifi'
  | 'cellular'
  | 'pie-chart'
  | 'swap-vertical'
  | 'arrow-down'
  | 'arrow-up'
  | 'calendar-outline'
  | 'calendar'
  | 'options-outline'
  | 'search'
  | 'close'
  | 'close-circle'
  | 'reload'
  | 'trending-up'
  | 'chevron-forward'
  | 'key-outline'
  | 'filter-outline'
  | 'globe-outline'
  | 'trash'
  | 'trash-outline'
  | 'settings'
  | 'text';

interface IconProps {
  name: IconName | string;
  size?: number;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 16, color = '#FFFFFF' }) => {
  // Ultra-lightweight vector symbol renderer with zero font bundle overhead
  switch (name) {
    case 'wifi':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <Text style={{ fontSize: size * 0.95, color, lineHeight: size * 1.1, textAlign: 'center' }}>
            📶
          </Text>
        </View>
      );

    case 'cellular':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <Text style={{ fontSize: size * 0.95, color, lineHeight: size * 1.1, textAlign: 'center' }}>
            📱
          </Text>
        </View>
      );

    case 'pie-chart':
    case 'globe-outline':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <Text style={{ fontSize: size * 0.95, color, lineHeight: size * 1.1, textAlign: 'center' }}>
            📊
          </Text>
        </View>
      );

    case 'swap-vertical':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <Text style={{ fontSize: size * 0.9, color, fontWeight: '900', lineHeight: size * 1.05 }}>
            ⇅
          </Text>
        </View>
      );

    case 'arrow-down':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <Text style={{ fontSize: size * 0.85, color, fontWeight: '900', lineHeight: size }}>
            ↓
          </Text>
        </View>
      );

    case 'arrow-up':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <Text style={{ fontSize: size * 0.85, color, fontWeight: '900', lineHeight: size }}>
            ↑
          </Text>
        </View>
      );

    case 'calendar':
    case 'calendar-outline':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <Text style={{ fontSize: size * 0.85, color, lineHeight: size * 1.1 }}>
            📅
          </Text>
        </View>
      );

    case 'options-outline':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <Text style={{ fontSize: size * 0.85, color, fontWeight: '800', lineHeight: size }}>
            ⚙
          </Text>
        </View>
      );

    case 'search':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <Text style={{ fontSize: size * 0.85, color, fontWeight: '800', lineHeight: size }}>
            🔍
          </Text>
        </View>
      );

    case 'close':
    case 'close-circle':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <Text style={{ fontSize: size * 0.85, color, fontWeight: '800', lineHeight: size }}>
            ✕
          </Text>
        </View>
      );

    case 'reload':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <Text style={{ fontSize: size * 0.85, color, fontWeight: '900', lineHeight: size }}>
            ↻
          </Text>
        </View>
      );

    case 'trending-up':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <Text style={{ fontSize: size * 0.85, color, fontWeight: '900', lineHeight: size }}>
            ↗
          </Text>
        </View>
      );

    case 'chevron-forward':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <Text style={{ fontSize: size * 0.9, color, fontWeight: '700', lineHeight: size }}>
            ›
          </Text>
        </View>
      );

    case 'key-outline':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <Text style={{ fontSize: size * 0.85, color, lineHeight: size }}>
            🔑
          </Text>
        </View>
      );

    case 'filter-outline':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <Text style={{ fontSize: size * 0.85, color, lineHeight: size }}>
            ⚡
          </Text>
        </View>
      );

    case 'text':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <Text style={{ fontSize: size * 0.85, color, fontWeight: '700', lineHeight: size }}>
            A-Z
          </Text>
        </View>
      );

    case 'trash':
    case 'trash-outline':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <Text style={{ fontSize: size * 0.85, color, lineHeight: size * 1.1 }}>
            🗑
          </Text>
        </View>
      );

    case 'settings':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <Text style={{ fontSize: size * 0.85, color, lineHeight: size * 1.1 }}>
            ⚙
          </Text>
        </View>
      );

    default:
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <Text style={{ fontSize: size * 0.8, color }}>•</Text>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

