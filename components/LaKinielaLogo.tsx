import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

interface LaKinielaLogoProps {
  width?: number;
  height?: number;
  showText?: boolean;
  variant?: 'app' | 'kiniela';
}

export default function LaKinielaLogo({ 
  width = 200, 
  height = 120, 
  showText = true, 
  variant = 'kiniela' 
}: LaKinielaLogoProps) {
  const getLogoSource = () => {
    if (variant === 'app') {
      return require('../src/Logos/Logo App.png');
    }
    return require('../src/Logos/KinielaMon.png');
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <Image
        source={getLogoSource()}
        style={[styles.logo, { width, height }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    // Los estilos se aplican dinámicamente
  },
});
