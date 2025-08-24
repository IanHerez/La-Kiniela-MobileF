import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { AppKitButton } from '@reown/appkit-wagmi-react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { colorsRGB } from '@/src/config/colors';
import LaKinielaLogo from '@/components/LaKinielaLogo';

// Función helper para obtener el nombre de la red
const getNetworkName = (chainId: number): string => {
  switch (chainId) {
    case 1:
      return 'Ethereum Mainnet';
    case 137:
      return 'Polygon';
    case 42161:
      return 'Arbitrum One';
    case 10143:
      return 'Monad Testnet';
    case 10144:
      return 'Monad Mainnet';
    default:
      return `Chain ID: ${chainId}`;
  }
};

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const { 
    isConnected, 
    address, 
    chainId, 
    isOnCorrectNetwork, 
    switchToMonadTestnet, 
    isSwitching,
    canAccessApp 
  } = useAuth();

  // Debug logging
  console.log('AuthGuard Debug:', {
    isConnected,
    address: address?.slice(0, 6) + '...',
    chainId,
    isOnCorrectNetwork,
    canAccessApp
  });

  // Esperar a que AppKit se inicialice completamente
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000); // Esperar 1 segundo para que AppKit se inicialice

    return () => clearTimeout(timer);
  }, []);

  // Mostrar loading mientras se inicializa
  if (isInitializing) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <LaKinielaLogo width={120} height={80} variant="app" />
          </View>
          <ActivityIndicator size="large" color={colorsRGB.primary} style={{ marginTop: 20 }} />
          <ThemedText style={styles.loadingText}>Inicializando...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  // Si no está conectado, mostrar pantalla de login
  if (!isConnected || !address) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.content}>
          {/* Logo de La Kiniela */}
          <View style={styles.logoContainer}>
            <LaKinielaLogo width={140} height={90} variant="app" />
          </View>

          <View style={styles.textContainer}>
            <ThemedText style={styles.title}>Bienvenido a La Kiniela</ThemedText>
            <ThemedText style={styles.subtitle}>
              Mercados de predicción descentralizados con impacto social
            </ThemedText>
            <ThemedText style={styles.description}>
              Conecta tu wallet para participar en mercados de predicción, 
              hacer apuestas y contribuir a causas sociales.
            </ThemedText>
          </View>

          <View style={styles.walletSection}>
            <ThemedText style={styles.walletTitle}>Conecta tu Wallet</ThemedText>
            <ThemedText style={styles.walletSubtitle}>
              Asegúrate de estar conectado a la red Monad Testnet
            </ThemedText>
            
            <AppKitButton 
              connectStyle={styles.connectButton}
              label="Conectar Wallet"
            />
          </View>

          <View style={styles.networkInfo}>
            <ThemedText style={styles.networkTitle}>Red Requerida:</ThemedText>
            <View style={styles.networkBadge}>
              <ThemedText style={styles.networkText}>Monad Testnet</ThemedText>
            </View>
            <ThemedText style={styles.networkDescription}>
              Chain ID: 10143
            </ThemedText>
          </View>
          
          {/* Botón de debug para forzar cambio de red */}
          <TouchableOpacity
            style={styles.debugButton}
            onPress={() => {
              console.log('Debug: Forzando cambio a Monad Testnet');
              if (switchToMonadTestnet) {
                switchToMonadTestnet();
              }
            }}
          >
            <ThemedText style={styles.debugButtonText}>Debug: Cambiar a Monad Testnet</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  // Si está conectado pero no en la red correcta, mostrar pantalla de cambio de red
  if (!isOnCorrectNetwork) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <LaKinielaLogo width={140} height={90} variant="app" />
          </View>

          <View style={styles.textContainer}>
            <ThemedText style={styles.title}>Red Incorrecta</ThemedText>
            <ThemedText style={styles.subtitle}>
              Tu wallet está conectada a una red diferente
            </ThemedText>
            <ThemedText style={styles.description}>
              Para usar La Kiniela, debes cambiar a la red Monad Testnet.
            </ThemedText>
          </View>

          <View style={styles.networkSection}>
            <View style={styles.currentNetwork}>
              <ThemedText style={styles.networkLabel}>Red Actual:</ThemedText>
              <View style={[styles.networkBadge, { backgroundColor: colorsRGB.warning }]}>
                <ThemedText style={styles.networkText}>{getNetworkName(chainId)}</ThemedText>
              </View>
            </View>

            <View style={styles.requiredNetwork}>
              <ThemedText style={styles.networkLabel}>Red Requerida:</ThemedText>
              <View style={styles.networkBadge}>
                <ThemedText style={styles.networkText}>Monad Testnet</ThemedText>
              </View>
            </View>

                                    <TouchableOpacity
                          style={styles.switchButton}
                          onPress={switchToMonadTestnet}
                          disabled={isSwitching}
                        >
                          <ThemedText style={styles.switchButtonText}>
                            {isSwitching ? 'Cambiando...' : 'Cambiar a Monad Testnet'}
                          </ThemedText>
                        </TouchableOpacity>
                        
                        {/* Botón de debug para ver estado actual */}
                        <TouchableOpacity
                          style={styles.debugButton}
                          onPress={() => {
                            console.log('Debug: Estado actual:', {
                              isConnected,
                              address: address?.slice(0, 6) + '...',
                              chainId,
                              isOnCorrectNetwork
                            });
                          }}
                        >
                          <ThemedText style={styles.debugButtonText}>Debug: Ver Estado</ThemedText>
                        </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    );
  }

  // Si está conectado y en la red correcta, mostrar el contenido principal
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorsRGB.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colorsRGB.cardForeground,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: colorsRGB.primary,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: colorsRGB.mutedForeground,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  walletSection: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  walletTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colorsRGB.cardForeground,
    marginBottom: 8,
  },
  walletSubtitle: {
    fontSize: 14,
    color: colorsRGB.mutedForeground,
    marginBottom: 24,
    textAlign: 'center',
  },
  connectButton: {
    backgroundColor: colorsRGB.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
    shadowColor: colorsRGB.foreground,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  networkInfo: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: colorsRGB.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colorsRGB.border,
  },
  networkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colorsRGB.cardForeground,
    marginBottom: 12,
  },
  networkBadge: {
    backgroundColor: colorsRGB.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  networkText: {
    color: colorsRGB.secondaryForeground,
    fontSize: 14,
    fontWeight: '600',
  },
  networkDescription: {
    fontSize: 12,
    color: colorsRGB.mutedForeground,
  },
  networkSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  currentNetwork: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  networkLabel: {
    fontSize: 14,
    color: colorsRGB.mutedForeground,
    marginRight: 8,
  },
  requiredNetwork: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  switchButton: {
    backgroundColor: colorsRGB.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 200,
    shadowColor: colorsRGB.foreground,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  switchButtonText: {
    color: colorsRGB.primaryForeground,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colorsRGB.mutedForeground,
    marginTop: 16,
    textAlign: 'center',
  },
  debugButton: {
    backgroundColor: colorsRGB.warning,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    minWidth: 200,
  },
  debugButtonText: {
    color: colorsRGB.primaryForeground,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
