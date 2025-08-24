import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colorsRGB } from '@/src/config/colors';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Badge({
  label,
  variant = 'default',
  size = 'md',
  style,
  textStyle,
}: BadgeProps) {
  const badgeStyle = [
    styles.base,
    styles[variant],
    styles[size],
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    textStyle,
  ];

  return (
    <View style={badgeStyle}>
      <Text style={textStyleCombined}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Variantes
  default: {
    backgroundColor: colorsRGB.muted,
  },
  primary: {
    backgroundColor: colorsRGB.primary,
  },
  secondary: {
    backgroundColor: colorsRGB.secondary,
  },
  success: {
    backgroundColor: colorsRGB.success,
  },
  warning: {
    backgroundColor: colorsRGB.warning,
  },
  destructive: {
    backgroundColor: colorsRGB.destructive,
  },
  
  // Tamaños
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 20,
  },
  md: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 24,
  },
  lg: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 28,
  },
  
  // Texto base
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Texto por variante
  defaultText: {
    color: colorsRGB.mutedForeground,
  },
  primaryText: {
    color: colorsRGB.primaryForeground,
  },
  secondaryText: {
    color: colorsRGB.secondaryForeground,
  },
  successText: {
    color: colorsRGB.cardForeground,
  },
  warningText: {
    color: colorsRGB.cardForeground,
  },
  destructiveText: {
    color: colorsRGB.destructiveForeground,
  },
  
  // Texto por tamaño
  smText: {
    fontSize: 10,
  },
  mdText: {
    fontSize: 12,
  },
  lgText: {
    fontSize: 14,
  },
});
