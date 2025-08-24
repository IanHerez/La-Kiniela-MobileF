import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useKinielaContract } from '@/hooks/useKiniela';
import { useAuth } from '@/hooks/useAuth';
import { useRealMonadBalance } from '@/hooks/useRealMonadBalance';
import { useMockMarkets } from '@/hooks/useMockMarkets';
import { useFixedBalance } from '@/hooks/useFixedBalance';
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

  // ✅ Balances reales y ficticios de MONAD
  const { 
    realBalance: realMonadBalance, 
    fictionalBalance: fictionalMonadBalance,
    isLoading: balanceLoading,
    error: balanceError 
  } = useRealMonadBalance();

  // ✅ Estadísticas del demo
  const { stats: demoStats } = useMockMarkets();

  // ✅ Balance fijo y historial de compras
  const { currentBalance, purchases, resetData } = useFixedBalance();

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
              ? 'Conecta tu wallet para ver tu perfil y historial de participaciones'
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
          
          {/* Balance Real de MONAD */}
          <View style={styles.balanceContainer}>
            <ThemedText style={styles.balanceLabel}>Balance $MON (Real):</ThemedText>
            <View style={styles.balanceWithStatus}>
              <ThemedText style={[styles.balanceValue, { color: '#FFD700' }]}>
                {balanceLoading ? '...' : realMonadBalance.toFixed(6)}
              </ThemedText>
              {realMonadBalance > 0 && (
                <View style={styles.realBadge}>
                  <ThemedText style={styles.realBadgeText}>✅ Real</ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* Balance Fijo */}
          <View style={styles.balanceContainer}>
            <ThemedText style={styles.balanceLabel}>Balance $MON (App):</ThemedText>
            <View style={styles.balanceWithStatus}>
              <ThemedText style={[styles.balanceValue, { color: colorsRGB.primary }]}>
                {currentBalance.toFixed(2)}
              </ThemedText>
              <View style={styles.demoBadge}>
                <ThemedText style={styles.demoBadgeText}>💰 App</ThemedText>
              </View>
            </View>
          </View>

          {/* Información adicional */}
          {balanceError && (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>⚠️ Error: {balanceError}</ThemedText>
            </View>
          )}

          {realMonadBalance === 0 && isConnected && (
            <TouchableOpacity 
              style={styles.helpContainer}
              onPress={() => Alert.alert(
                'Balance Real vs Demo',
                'Tu balance real es 0 $MON. El balance demo te permite probar la aplicación con 1000 $MON ficticios.\n\nPara obtener $MON real:\n• Usa un faucet de Monad testnet\n• O intercambia tokens en un DEX'
              )}
            >
              <ThemedText style={styles.helpText}>ℹ️ ¿Por qué tengo 0 $MON real?</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Estadísticas de Mercados */}
        <View style={styles.statsContainer}>
          <View style={styles.statsHeader}>
            <ThemedText style={styles.statsTitle}>📊 Estadísticas Mercados</ThemedText>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{demoStats.totalMarkets}</ThemedText>
              <ThemedText style={styles.statLabel}>Markets Totales</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{demoStats.activeMarkets}</ThemedText>
              <ThemedText style={styles.statLabel}>Markets Activos</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: colorsRGB.primary }]}>
                {purchases.reduce((sum, p) => sum + p.amount, 0).toFixed(1)}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Total Gastado ($MON)</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{purchases.length}</ThemedText>
              <ThemedText style={styles.statLabel}>Compras Realizadas</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[
                styles.statValue, 
                { color: demoStats.userPotentialWinnings > 0 ? colorsRGB.success : colorsRGB.warning }
              ]}>
                {demoStats.userPotentialWinnings > 0 ? '+' : ''}{demoStats.userPotentialWinnings.toFixed(1)}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Ganancia Potencial ($MON)</ThemedText>
            </View>
          </View>
        </View>

        {/* Estadísticas Contratos Reales (si existen) */}
        {userBets.length > 0 && (
          <View style={styles.statsContainer}>
            <View style={styles.statsHeader}>
              <ThemedText style={styles.statsTitle}>⛓️ Contratos Reales</ThemedText>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>{totalBets}</ThemedText>
                <ThemedText style={styles.statLabel}>Total Participaciones</ThemedText>
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
          </View>
        )}

        {/* Ganancias totales */}
        <View style={styles.winningsContainer}>
          <ThemedText style={styles.winningsTitle}>Ganancias Totales</ThemedText>
          <ThemedText style={styles.winningsValue}>+{totalWinnings.toFixed(2)} MXNB</ThemedText>
        </View>

        {/* Historial de Compras */}
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <ThemedText style={styles.historyTitle}>💰 Historial de Compras</ThemedText>
            {purchases.length > 0 && (
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={() => Alert.alert(
                  'Resetear Datos',
                  '¿Seguro que quieres resetear tu balance y compras? Volverás a tener 1000 $MON.',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Resetear', style: 'destructive', onPress: resetData }
                  ]
                )}
              >
                <ThemedText style={styles.resetButtonText}>🔄 Reset</ThemedText>
              </TouchableOpacity>
            )}
          </View>
          
          {purchases.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                No has realizado compras aún. ¡Ve a los mercados y haz tu primera apuesta!
              </ThemedText>
            </View>
          ) : (
            <FlatList
              data={purchases.slice().reverse()} // Más recientes primero
              renderItem={({ item }) => (
                <View style={styles.purchaseItem}>
                  <View style={styles.purchaseHeader}>
                    <View style={styles.purchaseInfo}>
                      <ThemedText style={styles.purchaseQuestion} numberOfLines={2}>
                        {item.marketQuestion}
                      </ThemedText>
                      <ThemedText style={styles.purchaseDate}>
                        {new Date(item.timestamp).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </ThemedText>
                    </View>
                    <View style={[styles.optionBadge, item.option === 'A' ? styles.optionABadge : styles.optionBBadge]}>
                      <ThemedText style={styles.optionBadgeText}>Opción {item.option}</ThemedText>
                    </View>
                  </View>
                  
                  <View style={styles.purchaseDetails}>
                    <View style={styles.purchaseRow}>
                      <ThemedText style={styles.purchaseLabel}>Opción elegida:</ThemedText>
                      <ThemedText style={styles.purchaseValue}>{item.optionText}</ThemedText>
                    </View>
                    <View style={styles.purchaseRow}>
                      <ThemedText style={styles.purchaseLabel}>Monto invertido:</ThemedText>
                      <ThemedText style={styles.purchaseValue}>{item.amount.toFixed(2)} $MON</ThemedText>
                    </View>
                  </View>
                </View>
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Historial de participaciones */}
        {userBets.length > 0 && (
          <View style={styles.historyContainer}>
            <ThemedText style={styles.historyTitle}>⛓️ Contratos Reales</ThemedText>
            
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
          </View>
        )}
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
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 16,
    color: colorsRGB.mutedForeground,
    flex: 1,
  },
  balanceWithStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colorsRGB.primary,
  },
  realBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  realBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  demoBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  demoBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
  },
  helpContainer: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  helpText: {
    fontSize: 12,
    color: '#0369A1',
    textAlign: 'center',
  },
  statsContainer: {
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
  statsHeader: {
    marginBottom: 16,
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colorsRGB.cardForeground,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    minWidth: '40%',
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
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: colorsRGB.destructive,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  purchaseItem: {
    backgroundColor: colorsRGB.muted,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colorsRGB.border,
  },
  purchaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  purchaseInfo: {
    flex: 1,
    marginRight: 12,
  },
  purchaseQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: colorsRGB.cardForeground,
    marginBottom: 4,
    lineHeight: 20,
  },
  purchaseDate: {
    fontSize: 12,
    color: colorsRGB.mutedForeground,
  },
  optionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  optionABadge: {
    backgroundColor: colorsRGB.secondary,
  },
  optionBBadge: {
    backgroundColor: colorsRGB.primary,
  },
  optionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  purchaseDetails: {
    gap: 8,
  },
  purchaseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  purchaseLabel: {
    fontSize: 14,
    color: colorsRGB.mutedForeground,
  },
  purchaseValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colorsRGB.cardForeground,
  },
});
