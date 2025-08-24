import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colorsRGB } from '@/src/config/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
}

export default function Card({
  children,
  style,
  variant = 'default',
  padding = 'md',
}: CardProps) {
  const cardStyle = [
    styles.base,
    styles[variant],
    styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colorsRGB.card,
    borderRadius: 16,
  },
  
  // Variantes
  default: {
    shadowColor: colorsRGB.foreground,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  elevated: {
    shadowColor: colorsRGB.foreground,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colorsRGB.border,
  },
  
  // Padding
  paddingSm: {
    padding: 16,
  },
  paddingMd: {
    padding: 20,
  },
  paddingLg: {
    padding: 24,
  },
});
