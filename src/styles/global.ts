import { StyleSheet } from 'react-native';
import { colorsRGB } from '@/src/config/colors';

export const globalStyles = StyleSheet.create({
  // Contenedores
  container: {
    flex: 1,
    backgroundColor: colorsRGB.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colorsRGB.background,
  },
  
  // Layout
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  spaceAround: {
    justifyContent: 'space-around',
  },
  
  // Espaciado
  gap: {
    gap: 16,
  },
  gapSm: {
    gap: 8,
  },
  gapMd: {
    gap: 16,
  },
  gapLg: {
    gap: 24,
  },
  
  // Padding
  padding: {
    padding: 20,
  },
  paddingSm: {
    padding: 16,
  },
  paddingMd: {
    padding: 20,
  },
  paddingLg: {
    padding: 24,
  },
  paddingX: {
    paddingHorizontal: 20,
  },
  paddingY: {
    paddingVertical: 20,
  },
  
  // Margin
  margin: {
    margin: 20,
  },
  marginSm: {
    margin: 16,
  },
  marginMd: {
    margin: 20,
  },
  marginLg: {
    margin: 24,
  },
  marginX: {
    marginHorizontal: 20,
  },
  marginY: {
    marginVertical: 20,
  },
  
  // Bordes
  border: {
    borderWidth: 1,
    borderColor: colorsRGB.border,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: colorsRGB.border,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colorsRGB.border,
  },
  
  // Sombras
  shadow: {
    shadowColor: colorsRGB.foreground,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  shadowLg: {
    shadowColor: colorsRGB.foreground,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  
  // Bordes redondeados
  rounded: {
    borderRadius: 12,
  },
  roundedSm: {
    borderRadius: 8,
  },
  roundedMd: {
    borderRadius: 12,
  },
  roundedLg: {
    borderRadius: 16,
  },
  roundedFull: {
    borderRadius: 9999,
  },
  
  // Texto
  text: {
    color: colorsRGB.cardForeground,
  },
  textMuted: {
    color: colorsRGB.mutedForeground,
  },
  textPrimary: {
    color: colorsRGB.primary,
  },
  textSecondary: {
    color: colorsRGB.secondary,
  },
  textSuccess: {
    color: colorsRGB.success,
  },
  textWarning: {
    color: colorsRGB.warning,
  },
  textDestructive: {
    color: colorsRGB.destructive,
  },
  
  // Fondos
  bgCard: {
    backgroundColor: colorsRGB.card,
  },
  bgPrimary: {
    backgroundColor: colorsRGB.primary,
  },
  bgSecondary: {
    backgroundColor: colorsRGB.secondary,
  },
  bgMuted: {
    backgroundColor: colorsRGB.muted,
  },
  bgSuccess: {
    backgroundColor: colorsRGB.success,
  },
  bgWarning: {
    backgroundColor: colorsRGB.warning,
  },
  bgDestructive: {
    backgroundColor: colorsRGB.destructive,
  },
});

// Tipos para TypeScript
export type GlobalStyleKey = keyof typeof globalStyles;
