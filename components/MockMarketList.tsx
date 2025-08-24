import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMockMarkets, MockMarket } from '@/hooks/useMockMarkets';
import { useFixedBalance } from '@/hooks/useFixedBalance';
import { useSocialImpact } from '@/hooks/useSocialImpact';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { colorsRGB } from '@/src/config/colors';
import LaKinielaLogo from '@/components/LaKinielaLogo';
import PurchaseModal from '@/components/PurchaseModal';

interface MockMarketCardProps {
  market: MockMarket;
  onBuy: (marketId: number, option: 'A' | 'B') => void;
  loading: boolean;
}

const MockMarketCard: React.FC<MockMarketCardProps> = ({ market, onBuy, loading }) => {
  const isEmpty = market.totalFunds === 0;
  
  const getStatusColor = () => {
    if (isEmpty) return '#FF6B35'; // Naranja para mercados vacíos
    switch (market.status) {
      case 'resolved': return colorsRGB.success;
      case 'closed': return colorsRGB.warning;
      default: return colorsRGB.info;
    }
  };

  const getStatusText = () => {
    if (isEmpty) return '🚀 ¡Sé el Primero!';
    switch (market.status) {
      case 'resolved': return `Ganó: Opción ${market.winner}`;
      case 'closed': return 'Cerrado';
      default: return 'Activo';
    }
  };

  const handleBuyA = () => {
    onBuy(market.id, 'A');
  };

  const handleBuyB = () => {
    onBuy(market.id, 'B');
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <ThemedText style={styles.statusText}>{getStatusText()}</ThemedText>
        </View>
        <ThemedText style={styles.endTime}>Hasta: {market.endTime}</ThemedText>
      </View>
      
      <ThemedText style={styles.question} numberOfLines={3}>
        {market.question}
      </ThemedText>
      
      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={[styles.option, styles.optionA]} 
          onPress={handleBuyA}
          disabled={market.status !== 'active' || loading}
        >
          <View style={styles.optionHeader}>
            <ThemedText style={styles.optionLabel}>Opción A:</ThemedText>
            <ThemedText style={styles.optionPrice}>{(market.priceA * 100).toFixed(1)}%</ThemedText>
          </View>
          <ThemedText style={styles.optionText} numberOfLines={2}>{market.optionA}</ThemedText>
          <View style={styles.probabilityBar}>
            <View 
              style={[
                styles.probabilityFill, 
                { 
                  width: `${market.priceA * 100}%`,
                  backgroundColor: isEmpty ? '#FFA500' : colorsRGB.secondary
                }
              ]} 
            />
          </View>
          <View style={styles.shareInfo}>
            <ThemedText style={styles.shareText}>
              {isEmpty ? 'Sin shares aún' : `Shares: ${market.sharesA}`}
            </ThemedText>
            {market.userSharesA > 0 && (
              <ThemedText style={styles.userShares}>Tuyas: {market.userSharesA.toFixed(0)}</ThemedText>
            )}
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.option, styles.optionB]} 
          onPress={handleBuyB}
          disabled={market.status !== 'active' || loading}
        >
          <View style={styles.optionHeader}>
            <ThemedText style={styles.optionLabel}>Opción B:</ThemedText>
            <ThemedText style={styles.optionPrice}>{(market.priceB * 100).toFixed(1)}%</ThemedText>
          </View>
          <ThemedText style={styles.optionText} numberOfLines={2}>{market.optionB}</ThemedText>
          <View style={styles.probabilityBar}>
            <View 
              style={[
                styles.probabilityFill, 
                { 
                  width: `${market.priceB * 100}%`,
                  backgroundColor: isEmpty ? '#FFA500' : colorsRGB.primary
                }
              ]} 
            />
          </View>
          <View style={styles.shareInfo}>
            <ThemedText style={styles.shareText}>
              {isEmpty ? 'Sin shares aún' : `Shares: ${market.sharesB}`}
            </ThemedText>
            {market.userSharesB > 0 && (
              <ThemedText style={styles.userShares}>Tuyas: {market.userSharesB.toFixed(0)}</ThemedText>
            )}
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <ThemedText style={styles.footerLabel}>
            {isEmpty ? 'Pool Inicial:' : 'Volumen Total:'}
          </ThemedText>
          <ThemedText style={styles.footerValue}>
                         {isEmpty ? '100 $MON (automático)' : `${market.totalFunds.toFixed(3)} $MON`}
          </ThemedText>
        </View>
        
        {market.userInvested > 0 && (
          <View style={styles.footerItem}>
            <ThemedText style={styles.footerLabel}>Tu Inversión:</ThemedText>
            <ThemedText style={styles.footerValue}>{market.userInvested.toFixed(3)} $MON</ThemedText>
          </View>
        )}
        
        {isEmpty && (
          <View style={styles.footerItem}>
            <ThemedText style={styles.footerLabel}>Estado:</ThemedText>
            <ThemedText style={[styles.footerValue, { color: '#FF6B35' }]}>Esperando 1ª apuesta</ThemedText>
          </View>
        )}
      </View>
    </View>
  );
};

export default function MockMarketList() {
  const router = useRouter();
  const { isConnected, isOnCorrectNetwork } = useAuth();
  const { markets, loading, refreshing, buyShares, refresh, stats } = useMockMarkets();
  const { currentBalance, makePurchase } = useFixedBalance();
  const { processDonation } = useSocialImpact();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<{
    marketId: number;
    option: 'A' | 'B';
    marketQuestion: string;
    optionText: string;
    isEmpty: boolean;
  } | null>(null);

  const handleBuyShares = (marketId: number, option: 'A' | 'B') => {
    const market = markets.find(m => m.id === marketId);
    if (!market) return;

    setSelectedMarket({
      marketId,
      option,
      marketQuestion: market.question,
      optionText: option === 'A' ? market.optionA : market.optionB,
      isEmpty: market.totalFunds === 0,
    });
    setModalVisible(true);
  };

  const handlePurchaseConfirm = async (amount: number): Promise<boolean> => {
    if (!selectedMarket) return false;

    try {
      // Guardar compra en persistencia
      const purchaseSuccess = await makePurchase(
        selectedMarket.marketId,
        selectedMarket.option,
        amount,
        selectedMarket.marketQuestion,
        selectedMarket.optionText
      );

      if (!purchaseSuccess) {
        return false;
      }

      // Actualizar market simulado
      const marketSuccess = await buyShares(selectedMarket.marketId, selectedMarket.option, amount);
      
      if (marketSuccess) {
        // ✅ Procesar donación del 10% para impacto social
        await processDonation(amount, selectedMarket.marketQuestion);
        
        // Calcular fee social
        const socialFee = amount * 0.1;
        
        if (selectedMarket.isEmpty) {
          Alert.alert(
            '🚀 ¡Mercado Inicializado!',
                         `¡Felicidades! Has inicializado el mercado con ${amount} $MON.\n\n💚 Impacto Social: ${socialFee.toFixed(2)} $MON donados (10%)\n\nEl sistema ha añadido automáticamente 100 $MON al pool.\n\nTu nuevo balance: ${(currentBalance - amount).toFixed(2)} $MON`
          );
        } else {
          Alert.alert(
            '✅ ¡Compra Exitosa!',
            `Has comprado shares por ${amount} $MON en la Opción ${selectedMarket.option}.\n\n💚 Impacto Social: ${socialFee.toFixed(2)} $MON donados (10%)\n\nTu nuevo balance: ${(currentBalance - amount).toFixed(2)} $MON`
          );
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error en compra:', error);
      return false;
    }
  };

  const handleCreateMarket = () => {
    Alert.alert(
      'Crear Mercado',
      'Función de demo: En la versión real, aquí podrías crear un nuevo mercado de predicción'
    );
  };

  // Verificar autenticación y red
  if (!isConnected || !isOnCorrectNetwork) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.authContainer}>
          <ThemedText style={styles.authTitle}>
            {!isConnected ? 'Conecta tu Wallet' : 'Red Incorrecta'}
          </ThemedText>
          <ThemedText style={styles.authSubtitle}>
            {!isConnected 
              ? 'Conecta tu wallet para ver los mercados de predicción'
              : 'Debes estar conectado a Monad Testnet para usar La Kiniela'
            }
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const renderMarket = ({ item }: { item: MockMarket }) => (
    <MockMarketCard 
      market={item} 
      onBuy={handleBuyShares}
      loading={loading}
    />
  );

  if (loading && markets.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22C55E" />
        <ThemedText style={styles.loadingText}>Cargando mercados...</ThemedText>
      </View>
    );
  }

    return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={['#22C55E']}
            tintColor="#22C55E"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LaKinielaLogo width={100} height={60} variant="kiniela" />
          </View>
          <ThemedText style={styles.title}>La Kiniela</ThemedText>
          <View style={styles.balanceContainer}>
            <ThemedText style={styles.balanceTitle}>💰 Tu Balance</ThemedText>
            <ThemedText style={styles.currentBalance}>{currentBalance.toFixed(2)} $MON</ThemedText>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statLabel}>Mercados:</ThemedText>
              <ThemedText style={styles.statValue}>{stats.activeMarkets}/{stats.totalMarkets}</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statLabel}>Tu Inversión:</ThemedText>
              <ThemedText style={styles.statValue}>{stats.userTotalInvested.toFixed(2)} $MON</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statLabel}>Ganancia Potencial:</ThemedText>
              <ThemedText style={[styles.statValue, { color: stats.userPotentialWinnings > 0 ? colorsRGB.success : colorsRGB.warning }]}>
                {stats.userPotentialWinnings > 0 ? '+' : ''}{stats.userPotentialWinnings.toFixed(2)} $MON
              </ThemedText>
            </View>
          </View>
        </View>
        
        {/* Markets */}
        <View style={styles.marketsContainer}>
          {markets.map((market) => (
            <MockMarketCard 
              key={market.id.toString()}
              market={market} 
              onBuy={handleBuyShares}
              loading={loading}
            />
          ))}
        </View>
      </ScrollView>
      
      <TouchableOpacity style={styles.fab} onPress={handleCreateMarket}>
        <ThemedText style={styles.fabText}>+</ThemedText>
      </TouchableOpacity>
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#22C55E" />
          <ThemedText style={styles.loadingText}>Procesando compra...</ThemedText>
        </View>
      )}

      {/* Modal de Compra */}
      {selectedMarket && (
        <PurchaseModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedMarket(null);
          }}
          onConfirm={handlePurchaseConfirm}
          marketQuestion={selectedMarket.marketQuestion}
          option={selectedMarket.option}
          optionText={selectedMarket.optionText}
          currentBalance={currentBalance}
          isEmpty={selectedMarket.isEmpty}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorsRGB.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100, // Espacio para el FAB
  },
  header: {
    padding: 20,
    backgroundColor: colorsRGB.background,
    borderBottomWidth: 1,
    borderBottomColor: colorsRGB.border,
  },
  marketsContainer: {
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colorsRGB.card,
    padding: 12,
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colorsRGB.mutedForeground,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colorsRGB.cardForeground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },

  card: {
    backgroundColor: colorsRGB.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colorsRGB.foreground,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  endTime: {
    fontSize: 12,
    color: colorsRGB.mutedForeground,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: colorsRGB.cardForeground,
    marginBottom: 20,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  option: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  optionA: {
    borderColor: colorsRGB.secondary,
    backgroundColor: `${colorsRGB.secondary}10`,
  },
  optionB: {
    borderColor: colorsRGB.primary,
    backgroundColor: `${colorsRGB.primary}10`,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colorsRGB.mutedForeground,
  },
  optionPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colorsRGB.cardForeground,
  },
  optionText: {
    fontSize: 16,
    color: colorsRGB.cardForeground,
    marginBottom: 12,
  },
  probabilityBar: {
    height: 8,
    backgroundColor: colorsRGB.muted,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  probabilityFill: {
    height: '100%',
    borderRadius: 4,
  },
  shareInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shareText: {
    fontSize: 12,
    color: colorsRGB.mutedForeground,
  },
  userShares: {
    fontSize: 12,
    fontWeight: '600',
    color: colorsRGB.success,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colorsRGB.border,
  },
  footerItem: {
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 12,
    color: colorsRGB.mutedForeground,
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colorsRGB.cardForeground,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colorsRGB.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colorsRGB.foreground,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: colorsRGB.primaryForeground,
    fontSize: 24,
    fontWeight: 'bold',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colorsRGB.cardForeground,
    textAlign: 'center',
    marginBottom: 10,
  },
  authSubtitle: {
    fontSize: 16,
    color: colorsRGB.mutedForeground,
    textAlign: 'center',
    marginBottom: 24,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  currentBalance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  balanceContainer: {
    backgroundColor: colorsRGB.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
});
