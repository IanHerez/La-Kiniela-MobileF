import { useState, useEffect } from 'react';
import { useBalance } from 'wagmi';
import { useAuth } from '@/hooks/useAuth';
import { formatEther } from 'viem';

interface MonadBalances {
  realBalance: number; // Balance real de MONAD en la wallet
  fictionalBalance: number; // Balance ficticio para el demo
  isLoading: boolean;
  error: string | null;
}

export function useRealMonadBalance(): MonadBalances {
  const { address, isConnected, chainId } = useAuth();
  const [fictionalBalance, setFictionalBalance] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // ✅ Obtener balance real de MONAD nativo
  const { 
    data: balanceData, 
    isLoading: balanceLoading,
    error: balanceError,
    refetch 
  } = useBalance({
    address: address as `0x${string}`,
    chainId: 10143, // Monad testnet
    query: {
      enabled: !!address && isConnected && chainId === 10143,
      refetchInterval: 10000, // Actualizar cada 10 segundos
    },
  });

  // ✅ Calcular balance real formateado
  const realBalance = balanceData ? parseFloat(formatEther(balanceData.value)) : 0;

  // ✅ Sincronizar balance ficticio con el real
  useEffect(() => {
    if (realBalance > 0) {
      // El balance ficticio coincide con el real + un bonus para el demo
      const bonusBalance = Math.max(1000, realBalance * 100); // Mínimo 1000 MONAD ficticios
      setFictionalBalance(Math.round(bonusBalance * 100) / 100); // Redondear a 2 decimales
    } else if (realBalance === 0 && isConnected) {
      // Si no tiene MONAD real, dar 1000 ficticios para el demo
      setFictionalBalance(1000);
    } else {
      setFictionalBalance(0);
    }
  }, [realBalance, isConnected]);

  // ✅ Manejar errores
  useEffect(() => {
    if (balanceError) {
      setError(balanceError.message);
      console.error('Error obteniendo balance MONAD:', balanceError);
    } else {
      setError(null);
    }
  }, [balanceError]);

  // ✅ Función para actualizar balances manualmente
  const refreshBalances = async () => {
    try {
      await refetch();
    } catch (err) {
      console.error('Error actualizando balances:', err);
    }
  };

  // ✅ Logs para debugging
  useEffect(() => {
    if (address && isConnected) {
      console.log('💰 MONAD Balances Debug:', {
        address: address?.slice(0, 6) + '...' + address?.slice(-4),
        chainId,
        isConnected,
        realBalance: realBalance.toFixed(6),
        fictionalBalance: fictionalBalance.toFixed(2),
        balanceLoading,
        error,
        timestamp: new Date().toISOString(),
      });
    }
  }, [address, chainId, isConnected, realBalance, fictionalBalance, balanceLoading, error]);

  return {
    realBalance,
    fictionalBalance,
    isLoading: balanceLoading,
    error,
  };
}
