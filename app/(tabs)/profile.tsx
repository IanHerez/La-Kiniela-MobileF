import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useKinielaContract } from '@/hooks/useKiniela';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppKitButton } from '@reown/appkit-wagmi-react-native';
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

interface BetHistoryItemProps {
  bet: any;
  onClaim: () => void;
}

const BetHistoryItem: React.FC<BetHistoryItemProps> = ({ bet, onClaim }) => {
  const getStatusColor = () => {
    if (!bet.isResolved) return colorsRGB.warning;
    if (bet.isWon) return colorsRGB.success;
    return colorsRGB.destructive;
  };

  const getStatusText = () => {
    if (!bet.isResolved) return 'Pendiente';
    if (bet.isWon) return 'Ganada';
    return 'Perdida';
  };

  const formatDate = (timestamp: Date) => {
    return timestamp.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.betItem}>
      <View style={styles.betHeader}>
        <View style={styles.betInfo}>
          <ThemedText style={styles.betQuestion} numberOfLines={1}>
            {bet.marketQuestion || 'Mercado'}
          </ThemedText>
          <ThemedText style={styles.betDate}>
            {formatDate(bet.timestamp)}
          </ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <ThemedText style={styles.statusText}>{getStatusText()}</ThemedText>
        </View>
      </View>
      
      <View style={styles.betDetails}>
        <View style={styles.betRow}>
          <ThemedText style={styles.betLabel}>Opción:</ThemedText>
          <ThemedText style={styles.betValue}>{bet.option}</ThemedText>
        </View>
        <View style={styles.betRow}>
          <ThemedText style={styles.betLabel}>Monto:</ThemedText>
          <ThemedText style={styles.betValue}>{bet.amount.toFixed(2)} MXNB</ThemedText>
        </View>
        <View style={styles.betRow}>
          <ThemedText style={styles.betLabel}>Shares:</ThemedText>
          <ThemedText style={styles.betValue}>{bet.shares.toFixed(2)}</ThemedText>
        </View>
        {bet.isResolved && bet.isWon && bet.payout && (
          <View style={styles.betRow}>
            <ThemedText style={styles.betLabel}>Ganancia:</ThemedText>
            <ThemedText style={[styles.betValue, { color: '#22C55E' }]}>
              +{bet.payout.toFixed(2)} MXNB
            </ThemedText>
          </View>
        )}
      </View>
      
      {bet.isResolved && bet.isWon && !bet.claimed && (
        <TouchableOpacity style={styles.claimButton} onPress={onClaim}>
          <ThemedText style={styles.claimButtonText}>Reclamar Ganancia</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function ProfileScreen() {
  const { 
    isConnected, 
    address, 
    chainId, 
    isOnCorrectNetwork 
  } = useAuth();
  
  const { 
    mxnbBalance, 
    userBets, 
    betsLoading,
    claimWinnings 
  } = useKinielaContract();

  const handleClaimWinnings = async (betId: string) => {
    try {
      await claimWinnings.mutateAsync(betId);
      // La query se invalidará automáticamente
    } catch (error) {
      console.error('Error claiming winnings:', error);
    }
  };

  const renderBet = ({ item }: { item: any }) => (
    <BetHistoryItem 
      bet={item} 
      onClaim={() => handleClaimWinnings(item.id)} 
    />
  );

  if (!isConnected || !isOnCorrectNetwork) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.connectContainer}>
          <ThemedText style={styles.connectTitle}>
            {!isConnected ? 'Conecta tu Wallet' : 'Red Incorrecta'}
          </ThemedText>
          <ThemedText style={styles.connectSubtitle}>
            {!isConnected 
              ? 'Conecta tu wallet para ver tu perfil y historial de apuestas'
              : 'Debes estar conectado a Monad Testnet para usar La Kiniela'
            }
          </ThemedText>
          {!isConnected && (
            <AppKitButton 
              connectStyle={styles.connectButton}
              label="Conectar Wallet"
            />
          )}
        </View>
      </ThemedView>
    );
  }

  const totalBets = userBets.length;
  const wonBets = userBets.filter(bet => bet.isResolved && bet.isWon).length;
  const lostBets = userBets.filter(bet => bet.isResolved && !bet.isWon).length;
  const pendingBets = userBets.filter(bet => !bet.isResolved).length;
  const totalWinnings = userBets
    .filter(bet => bet.isResolved && bet.isWon && bet.payout)
    .reduce((sum, bet) => sum + (bet.payout || 0), 0);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Logo de La Kiniela */}
        <View style={styles.logoContainer}>
          <LaKinielaLogo width={100} height={60} variant="kiniela" />
        </View>
        
        {/* Header con información del usuario */}
        <View style={styles.header}>
          <View style={styles.addressContainer}>
            <ThemedText style={styles.addressLabel}>Dirección:</ThemedText>
            <ThemedText style={styles.addressValue} numberOfLines={1}>
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </ThemedText>
          </View>
          
          <View style={styles.networkContainer}>
            <ThemedText style={styles.networkLabel}>Red:</ThemedText>
            <View style={styles.networkBadge}>
              <ThemedText style={styles.networkText}>{getNetworkName(chainId || 0)}</ThemedText>
            </View>
          </View>
          
          <View style={styles.balanceContainer}>
            <ThemedText style={styles.balanceLabel}>Balance MXNB:</ThemedText>
            <ThemedText style={styles.balanceValue}>{mxnbBalance.toFixed(2)}</ThemedText>
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{totalBets}</ThemedText>
            <ThemedText style={styles.statLabel}>Total Apuestas</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{wonBets}</ThemedText>
            <ThemedText style={styles.statLabel}>Ganadas</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{lostBets}</ThemedText>
            <ThemedText style={styles.statLabel}>Perdidas</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{pendingBets}</ThemedText>
            <ThemedText style={styles.statLabel}>Pendientes</ThemedText>
          </View>
        </View>

        {/* Ganancias totales */}
        <View style={styles.winningsContainer}>
          <ThemedText style={styles.winningsTitle}>Ganancias Totales</ThemedText>
          <ThemedText style={styles.winningsValue}>+{totalWinnings.toFixed(2)} MXNB</ThemedText>
        </View>

        {/* Historial de apuestas */}
        <View style={styles.historyContainer}>
          <ThemedText style={styles.historyTitle}>Historial de Apuestas</ThemedText>
          
          {userBets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                No tienes apuestas aún. ¡Empieza a apostar en los mercados!
              </ThemedText>
            </View>
          ) : (
            <FlatList
              data={userBets}
              renderItem={renderBet}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={betsLoading}
                  onRefresh={() => {/* TODO: Implementar refresh */}}
                  colors={['#22C55E']}
                  tintColor="#22C55E"
                />
              }
            />
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorsRGB.background,
  },
  scrollContainer: {
    padding: 20,
  },
  connectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  connectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colorsRGB.cardForeground,
    marginBottom: 16,
    textAlign: 'center',
  },
  connectSubtitle: {
    fontSize: 16,
    color: colorsRGB.mutedForeground,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  connectButton: {
    backgroundColor: colorsRGB.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: colorsRGB.card,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: colorsRGB.foreground,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 14,
    color: colorsRGB.mutedForeground,
    marginBottom: 4,
  },
  addressValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colorsRGB.cardForeground,
    fontFamily: 'monospace',
  },
  networkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  networkLabel: {
    fontSize: 14,
    color: colorsRGB.mutedForeground,
    marginRight: 8,
  },
  networkBadge: {
    backgroundColor: colorsRGB.muted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  networkText: {
    fontSize: 12,
    fontWeight: '600',
    color: colorsRGB.cardForeground,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: colorsRGB.mutedForeground,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colorsRGB.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colorsRGB.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colorsRGB.foreground,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  winningsContainer: {
    backgroundColor: colorsRGB.muted,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colorsRGB.border,
  },
  winningsTitle: {
    fontSize: 16,
    color: colorsRGB.cardForeground,
    marginBottom: 8,
  },
  winningsValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colorsRGB.primary,
  },
  historyContainer: {
    backgroundColor: colorsRGB.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: colorsRGB.foreground,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colorsRGB.cardForeground,
    marginBottom: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colorsRGB.mutedForeground,
    textAlign: 'center',
    lineHeight: 24,
  },
  betItem: {
    backgroundColor: colorsRGB.muted,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colorsRGB.border,
  },
  betHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  betInfo: {
    flex: 1,
    marginRight: 12,
  },
  betQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: colorsRGB.cardForeground,
    marginBottom: 4,
  },
  betDate: {
    fontSize: 12,
    color: colorsRGB.mutedForeground,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  betDetails: {
    gap: 8,
    marginBottom: 16,
  },
  betRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  betLabel: {
    fontSize: 14,
    color: colorsRGB.mutedForeground,
  },
  betValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colorsRGB.cardForeground,
  },
  claimButton: {
    backgroundColor: colorsRGB.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  claimButtonText: {
    color: colorsRGB.primaryForeground,
    fontSize: 14,
    fontWeight: '600',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
});
