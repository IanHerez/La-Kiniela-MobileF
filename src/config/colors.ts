// Sistema de colores de La Kiniela inspirado en identidad mexicana
export const colors = {
  // Colores base usando HSL
  background: 'hsl(45 100% 96%)', // #fff6e4 - Warm cream
  foreground: 'hsl(0 0% 0%)', // Black text
  card: 'hsl(0 0% 100%)', // White
  cardForeground: 'hsl(120 100% 15%)', // #004d00 - Dark green
  primary: 'hsl(9 85% 52%)', // #df3925 - Red
  primaryForeground: 'hsl(0 0% 100%)', // White
  secondary: 'hsl(120 43% 34%)', // #177847 - Green
  secondaryForeground: 'hsl(0 0% 100%)', // White
  muted: 'hsl(45 100% 92%)', // #fef7e6 - Light cream
  mutedForeground: 'hsl(0 0% 25%)', // Dark gray
  accent: 'hsl(45 100% 92%)', // #fef7e6 - Light cream
  accentForeground: 'hsl(0 0% 15%)', // Very dark gray
  destructive: 'hsl(0 84% 60%)', // #e53e3e - Red
  destructiveForeground: 'hsl(0 0% 98%)', // Almost white
  border: 'hsl(45 50% 85%)', // #f5e6cc - Medium cream

  // Colores adicionales para la aplicación
  success: 'hsl(120 43% 34%)', // Green
  warning: 'hsl(45 100% 50%)', // Yellow
  info: 'hsl(200 100% 50%)', // Blue
  
  // Gradientes
  primaryGradient: ['hsl(9 85% 52%)', 'hsl(9 85% 42%)'],
  secondaryGradient: ['hsl(120 43% 34%)', 'hsl(120 43% 24%)'],
  backgroundGradient: ['hsl(45 100% 96%)', 'hsl(45 100% 92%)'],
  
  // Sombras
  shadow: {
    sm: '0 1px 2px 0 hsl(0 0% 0% / 0.05)',
    md: '0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)',
    lg: '0 10px 15px -3px hsl(0 0% 0% / 0.1), 0 4px 6px -4px hsl(0 0% 0% / 0.1)',
    xl: '0 20px 25px -5px hsl(0 0% 0% / 0.1), 0 8px 10px -6px hsl(0 0% 0% / 0.1)',
  },
} as const;

// Función helper para convertir HSL a RGB (para React Native)
export const hslToRgb = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  
  const r1 = Math.round((r + m) * 255);
  const g1 = Math.round((g + m) * 255);
  const b1 = Math.round((b + m) * 255);
  
  return `rgb(${r1}, ${g1}, ${b1})`;
};

// Colores en formato RGB para React Native
export const colorsRGB = {
  background: hslToRgb(45, 100, 96),
  foreground: hslToRgb(0, 0, 0),
  card: hslToRgb(0, 0, 100),
  cardForeground: hslToRgb(120, 100, 15),
  primary: hslToRgb(9, 85, 52),
  primaryForeground: hslToRgb(0, 0, 100),
  secondary: hslToRgb(120, 43, 34),
  secondaryForeground: hslToRgb(0, 0, 100),
  muted: hslToRgb(45, 100, 92),
  mutedForeground: hslToRgb(0, 0, 25),
  accent: hslToRgb(45, 100, 92),
  accentForeground: hslToRgb(0, 0, 15),
  destructive: hslToRgb(0, 84, 60),
  destructiveForeground: hslToRgb(0, 0, 98),
  border: hslToRgb(45, 50, 85),
  success: hslToRgb(120, 43, 34),
  warning: hslToRgb(45, 100, 50),
  info: hslToRgb(200, 100, 50),
} as const;

// Tipos para TypeScript
export type ColorKey = keyof typeof colors;
export type ColorKeyRGB = keyof typeof colorsRGB;
