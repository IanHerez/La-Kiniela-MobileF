import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useKinielaContract } from '@/hooks/useKiniela';
import { useAuth } from '@/hooks/useAuth';
import { Market } from '@/types/kiniela';
import { MARKET_CATEGORIES } from '@/config/contracts';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { colorsRGB } from '@/src/config/colors';
import LaKinielaLogo from '@/components/LaKinielaLogo';

interface MarketCardProps {
  market: Market;
  onPress: () => void;
}

const MarketCard: React.FC<MarketCardProps> = ({ market, onPress }) => {
  const category = MARKET_CATEGORIES.find(cat => cat.id === market.category.toString()) || MARKET_CATEGORIES[5];
  const totalShares = market.totalSharesA + market.totalSharesB;
  const probabilityA = totalShares > 0 ? (market.totalSharesA / totalShares) * 100 : 50;
  const probabilityB = 100 - probabilityA;
  
  const timeLeft = market.closingTime.getTime() - Date.now();
  const isExpired = timeLeft <= 0;
  const isResolved = market.isResolved;

  const getStatusColor = () => {
    if (isResolved) return colorsRGB.success; // Verde para resuelto
    if (isExpired) return colorsRGB.warning; // Amarillo para expirado
    return colorsRGB.info; // Azul para activo
  };

  const getStatusText = () => {
    if (isResolved) return 'Resuelto';
    if (isExpired) return 'Expirado';
    return 'Activo';
  };

  const formatTimeLeft = () => {
    if (isExpired || isResolved) return '';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return '< 1h';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
          <ThemedText style={styles.categoryText}>{category.name}</ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <ThemedText style={styles.statusText}>{getStatusText()}</ThemedText>
        </View>
      </View>
      
      <ThemedText style={styles.question} numberOfLines={2}>
        {market.question}
      </ThemedText>
      
      <View style={styles.optionsContainer}>
        <View style={styles.option}>
          <ThemedText style={styles.optionLabel}>Opción A:</ThemedText>
          <ThemedText style={styles.optionText}>{market.optionA}</ThemedText>
          <View style={styles.probabilityBar}>
            <View 
              style={[
                styles.probabilityFill, 
                { 
                  width: `${probabilityA}%`,
                  backgroundColor: colorsRGB.secondary
                }
              ]} 
            />
          </View>
          <ThemedText style={styles.probabilityText}>{probabilityA.toFixed(1)}%</ThemedText>
        </View>
        
        <View style={styles.option}>
          <ThemedText style={styles.optionLabel}>Opción B:</ThemedText>
          <ThemedText style={styles.optionText}>{market.optionB}</ThemedText>
          <View style={styles.probabilityBar}>
            <View 
              style={[
                styles.probabilityFill, 
                { 
                  width: `${probabilityB}%`,
                  backgroundColor: colorsRGB.primary
                }
              ]} 
            />
          </View>
          <ThemedText style={styles.probabilityText}>{probabilityB.toFixed(1)}%</ThemedText>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <ThemedText style={styles.footerLabel}>Volumen Total:</ThemedText>
          <ThemedText style={styles.footerValue}>{market.totalVolume.toFixed(2)} MXNB</ThemedText>
        </View>
        
        <View style={styles.footerItem}>
          <ThemedText style={styles.footerLabel}>Impacto Social:</ThemedText>
          <ThemedText style={styles.footerValue}>{market.fees.social.toFixed(2)} MXNB</ThemedText>
        </View>
        
        {!isExpired && !isResolved && (
          <View style={styles.footerItem}>
            <ThemedText style={styles.footerLabel}>Cierra en:</ThemedText>
            <ThemedText style={styles.footerValue}>{formatTimeLeft()}</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function MarketList() {
  const router = useRouter();
  const { isConnected, isOnCorrectNetwork } = useAuth();
  const { activeMarkets, marketsLoading, mxnbBalance } = useKinielaContract();

  const handleMarketPress = (marketId: string) => {
    router.push(`/market/${marketId}` as any);
  };

  const handleCreateMarket = () => {
    router.push('/create-market' as any);
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

  const renderMarket = ({ item }: { item: Market }) => (
    <MarketCard 
      market={item} 
      onPress={() => handleMarketPress(item.id)} 
    />
  );

  if (marketsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22C55E" />
        <ThemedText style={styles.loadingText}>Cargando mercados...</ThemedText>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <LaKinielaLogo width={100} height={60} variant="kiniela" />
        </View>
        <ThemedText style={styles.title}>Mercados de Predicción</ThemedText>
        <View style={styles.balanceContainer}>
          <ThemedText style={styles.balanceLabel}>Balance MXNB:</ThemedText>
          <ThemedText style={styles.balanceValue}>{mxnbBalance.toFixed(2)}</ThemedText>
        </View>
      </View>
      
      {activeMarkets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyTitle}>No hay mercados activos</ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Sé el primero en crear un mercado de predicción
          </ThemedText>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateMarket}>
            <ThemedText style={styles.createButtonText}>Crear Mercado</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={activeMarkets}
          renderItem={renderMarket}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={marketsLoading}
              onRefresh={() => {/* TODO: Implementar refresh */}}
              colors={['#22C55E']}
              tintColor="#22C55E"
            />
          }
        />
      )}
      
      <TouchableOpacity style={styles.fab} onPress={handleCreateMarket}>
        <ThemedText style={styles.fabText}>+</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorsRGB.background,
  },
  header: {
    padding: 20,
    backgroundColor: colorsRGB.background,
    borderBottomWidth: 1,
    borderBottomColor: colorsRGB.border,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#22C55E',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
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
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: colorsRGB.cardForeground,
    marginBottom: 20,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  option: {
    gap: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colorsRGB.mutedForeground,
  },
  optionText: {
    fontSize: 16,
    color: colorsRGB.cardForeground,
  },
  probabilityBar: {
    height: 8,
    backgroundColor: colorsRGB.muted,
    borderRadius: 4,
    overflow: 'hidden',
  },
  probabilityFill: {
    height: '100%',
    borderRadius: 4,
  },
  probabilityText: {
    fontSize: 14,
    fontWeight: '600',
    color: colorsRGB.mutedForeground,
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
});
