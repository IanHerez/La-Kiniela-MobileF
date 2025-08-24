import { useState, useEffect } from 'react';

export interface MockMarket {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  sharesA: number;
  sharesB: number;
  totalFunds: number;
  userSharesA: number;
  userSharesB: number;
  userInvested: number;
  endTime: string;
  status: 'active' | 'closed' | 'resolved';
  winner?: 'A' | 'B';
  priceA: number;
  priceB: number;
}

// ✅ Markets vacíos esperando la primera apuesta
const MOCK_MARKETS: MockMarket[] = [
  {
    id: 1,
    question: "¿Bitcoin llegará a $100,000 USD antes del 31 de diciembre 2024?",
    optionA: "Sí llegará",
    optionB: "No llegará",
    sharesA: 0, // ✅ Sin shares inicialmente
    sharesB: 0, // ✅ Sin shares inicialmente
    totalFunds: 0, // ✅ Sin fondos hasta primera apuesta
    userSharesA: 0,
    userSharesB: 0,
    userInvested: 0,
    endTime: "2024-12-31",
    status: 'active',
    priceA: 0.5, // 50% inicial
    priceB: 0.5, // 50% inicial
  },
  {
    id: 2,
    question: "¿Ethereum tendrá más de $5,000 USD en 2024?",
    optionA: "Sí tendrá",
    optionB: "No tendrá",
    sharesA: 0,
    sharesB: 0,
    totalFunds: 0,
    userSharesA: 0,
    userSharesB: 0,
    userInvested: 0,
    endTime: "2024-12-31",
    status: 'active',
    priceA: 0.5,
    priceB: 0.5,
  },
  {
    id: 3,
    question: "¿Monad mainnet se lanzará en Q1 2025?",
    optionA: "Sí se lanzará",
    optionB: "No se lanzará",
    sharesA: 0,
    sharesB: 0,
    totalFunds: 0,
    userSharesA: 0,
    userSharesB: 0,
    userInvested: 0,
    endTime: "2025-03-31",
    status: 'active',
    priceA: 0.5,
    priceB: 0.5,
  },
  {
    id: 4,
    question: "¿El precio de MONAD superará $10 USD en 2024?",
    optionA: "Sí superará",
    optionB: "No superará",
    sharesA: 0,
    sharesB: 0,
    totalFunds: 0,
    userSharesA: 0,
    userSharesB: 0,
    userInvested: 0,
    endTime: "2024-12-31",
    status: 'active',
    priceA: 0.5,
    priceB: 0.5,
  },
  {
    id: 5,
    question: "¿Habrá una nueva criptomoneda en el top 10 en 2025?",
    optionA: "Sí habrá",
    optionB: "No habrá",
    sharesA: 0,
    sharesB: 0,
    totalFunds: 0,
    userSharesA: 0,
    userSharesB: 0,
    userInvested: 0,
    endTime: "2025-12-31",
    status: 'active',
    priceA: 0.5,
    priceB: 0.5,
  },
  {
    id: 6,
    question: "¿Solana superará a Ethereum en transacciones diarias en 2025?",
    optionA: "Sí superará",
    optionB: "No superará",
    sharesA: 0,
    sharesB: 0,
    totalFunds: 0,
    userSharesA: 0,
    userSharesB: 0,
    userInvested: 0,
    endTime: "2025-12-31",
    status: 'active',
    priceA: 0.5,
    priceB: 0.5,
  }
];

export function useMockMarkets() {
  const [markets, setMarkets] = useState<MockMarket[]>(MOCK_MARKETS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ ELIMINADO: Shares NO se mueven automáticamente
  // Los markets solo cambian cuando el usuario compra manualmente

  // ✅ Simular compra de shares con sistema de inicialización
  const buyShares = async (marketId: number, option: 'A' | 'B', amount: number) => {
    setLoading(true);
    
    // Simular delay de transacción
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setMarkets(prev => prev.map(market => {
      if (market.id !== marketId) return market;
      
      // ✅ SISTEMA DE PRIMERA APUESTA - POOL INICIAL DE 100 MONAD
      const isFirstBet = market.totalFunds === 0;
      const INITIAL_POOL = 100; // 100 MONAD inicial
      
      if (isFirstBet) {
        // 🎯 PRIMERA APUESTA - INICIALIZAR MERCADO
        console.log(`🚀 Inicializando mercado ${marketId} con pool de ${INITIAL_POOL} MONAD`);
        
        // El usuario compra shares, el sistema añade el pool inicial
        const userShares = amount / 0.5; // Precio inicial 50/50
        const poolShares = INITIAL_POOL / 0.5; // Pool inicial en la opción contraria
        
        const newSharesA = option === 'A' ? userShares : poolShares;
        const newSharesB = option === 'B' ? userShares : poolShares;
        const totalShares = newSharesA + newSharesB;
        
        return {
          ...market,
          sharesA: newSharesA,
          sharesB: newSharesB,
          userSharesA: option === 'A' ? userShares : 0,
          userSharesB: option === 'B' ? userShares : 0,
          userInvested: amount,
          totalFunds: amount + INITIAL_POOL, // Usuario + Pool inicial
          priceA: newSharesA / totalShares,
          priceB: newSharesB / totalShares,
        };
      } else {
        // 📈 APUESTAS NORMALES - MERCADO YA INICIALIZADO
        const currentPriceA = market.sharesA / (market.sharesA + market.sharesB);
        const currentPriceB = market.sharesB / (market.sharesA + market.sharesB);
        
        const sharePrice = option === 'A' ? currentPriceA : currentPriceB;
        const shares = amount / sharePrice;
        
        const newSharesA = option === 'A' ? market.sharesA + shares : market.sharesA;
        const newSharesB = option === 'B' ? market.sharesB + shares : market.sharesB;
        const totalShares = newSharesA + newSharesB;
        
        return {
          ...market,
          sharesA: newSharesA,
          sharesB: newSharesB,
          userSharesA: option === 'A' ? market.userSharesA + shares : market.userSharesA,
          userSharesB: option === 'B' ? market.userSharesB + shares : market.userSharesB,
          userInvested: market.userInvested + amount,
          totalFunds: market.totalFunds + amount,
          priceA: newSharesA / totalShares,
          priceB: newSharesB / totalShares,
        };
      }
    }));
    
    setLoading(false);
    return true;
  };

  // ✅ Refresh manual
  const refresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  // ✅ Estadísticas generales
  const stats = {
    totalMarkets: markets.length,
    activeMarkets: markets.filter(m => m.status === 'active').length,
    totalVolume: markets.reduce((sum, m) => sum + m.totalFunds, 0),
    userTotalInvested: markets.reduce((sum, m) => sum + m.userInvested, 0),
    userPotentialWinnings: markets.reduce((sum, m) => {
      const winningsA = m.userSharesA * (m.priceA > 0 ? 1 / m.priceA : 0);
      const winningsB = m.userSharesB * (m.priceB > 0 ? 1 / m.priceB : 0);
      return sum + Math.max(winningsA, winningsB) - m.userInvested;
    }, 0),
  };

  return {
    markets,
    loading,
    refreshing,
    buyShares,
    refresh,
    stats,
  };
}
