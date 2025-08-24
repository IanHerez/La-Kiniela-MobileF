import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem';
import { CONTRACTS, KINIELA_MARKET_ABI, MXNB_TOKEN_ABI } from '@/config/contracts';
import { Market, Bet, User } from '@/types/kiniela';

export function useKinielaContract() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  // Obtener mercados activos
  const { data: activeMarkets, isLoading: marketsLoading } = useReadContract({
    address: CONTRACTS.KINIELA_MARKET,
    abi: KINIELA_MARKET_ABI,
    functionName: 'getActiveMarkets',
  });

  // Obtener información de un mercado específico
  const useMarketInfo = (marketId: string) => {
    return useReadContract({
      address: CONTRACTS.KINIELA_MARKET,
      abi: KINIELA_MARKET_ABI,
      functionName: 'getMarketInfo',
      args: [BigInt(marketId)],
      enabled: !!marketId,
    });
  };

  // Obtener participaciones del usuario
  const { data: userBets, isLoading: betsLoading } = useReadContract({
    address: CONTRACTS.KINIELA_MARKET,
    abi: KINIELA_MARKET_ABI,
    functionName: 'getUserBets',
    args: [address!],
    enabled: !!address,
  });

  // Obtener información de una participación específica
  const useBetInfo = (betId: string) => {
    return useReadContract({
      address: CONTRACTS.KINIELA_MARKET,
      abi: KINIELA_MARKET_ABI,
      functionName: 'getBetInfo',
      args: [BigInt(betId)],
      enabled: !!betId,
    });
  };

  // Obtener balance de MXNB del usuario
  const { data: mxnbBalance, isLoading: balanceLoading } = useReadContract({
    address: CONTRACTS.MXNB_TOKEN,
    abi: MXNB_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address!],
    enabled: !!address,
  });

  // Obtener participación mínima
  const { data: minimumBet } = useReadContract({
    address: CONTRACTS.KINIELA_MARKET,
    abi: KINIELA_MARKET_ABI,
    functionName: 'minimumBet',
  });

  // Obtener porcentaje de fees de plataforma
  const { data: platformFeePercentage } = useReadContract({
    address: CONTRACTS.KINIELA_MARKET,
    abi: KINIELA_MARKET_ABI,
    functionName: 'platformFeePercentage',
  });

  // Mutaciones para escritura
  const { writeContract: writeContractFn, data: writeData, isPending: isWritePending } = useWriteContract();

  // Crear mercado
  const createMarket = useMutation({
    mutationFn: async ({
      question,
      description,
      category,
      optionA,
      optionB,
      closingTime,
      stake,
    }: {
      question: string;
      description: string;
      category: number;
      optionA: string;
      optionB: string;
      closingTime: number;
      stake: string;
    }) => {
      if (!isConnected || !address) throw new Error('Wallet no conectada');
      
      return writeContractFn({
        address: CONTRACTS.KINIELA_MARKET,
        abi: KINIELA_MARKET_ABI,
        functionName: 'createMarket',
        args: [question, description, BigInt(category), optionA, optionB, BigInt(closingTime)],
        value: parseEther(stake),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      queryClient.invalidateQueries({ queryKey: ['userBets'] });
    },
  });

  // Participar en mercado
  const placeBet = useMutation({
    mutationFn: async ({
      marketId,
      option,
      amount,
    }: {
      marketId: string;
      option: 0 | 1; // 0 = A, 1 = B
      amount: string;
    }) => {
      if (!isConnected || !address) throw new Error('Wallet no conectada');
      
      return writeContractFn({
        address: CONTRACTS.KINIELA_MARKET,
        abi: KINIELA_MARKET_ABI,
        functionName: 'placeBet',
        args: [BigInt(marketId), option],
        value: parseEther(amount),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      queryClient.invalidateQueries({ queryKey: ['userBets'] });
      queryClient.invalidateQueries({ queryKey: ['userBalance'] });
    },
  });

  // Reclamar ganancias
  const claimWinnings = useMutation({
    mutationFn: async (betId: string) => {
      if (!isConnected || !address) throw new Error('Wallet no conectada');
      
      return writeContractFn({
        address: CONTRACTS.KINIELA_MARKET,
        abi: KINIELA_MARKET_ABI,
        functionName: 'claimWinnings',
        args: [BigInt(betId)],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBets'] });
      queryClient.invalidateQueries({ queryKey: ['userBalance'] });
    },
  });

  // Resolver mercado (solo para creadores)
  const resolveMarket = useMutation({
    mutationFn: async ({
      marketId,
      winningOption,
    }: {
      marketId: string;
      winningOption: 0 | 1;
    }) => {
      if (!isConnected || !address) throw new Error('Wallet no conectada');
      
      return writeContractFn({
        address: CONTRACTS.KINIELA_MARKET,
        abi: KINIELA_MARKET_ABI,
        functionName: 'resolveMarket',
        args: [BigInt(marketId), winningOption],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      queryClient.invalidateQueries({ queryKey: ['userBets'] });
    },
  });

  // Queries para datos transformados
  const marketsQuery = useQuery({
    queryKey: ['markets', 'active'],
    queryFn: async (): Promise<Market[]> => {
      if (!activeMarkets) return [];
      
      const marketsData = await Promise.all(
        activeMarkets.map(async (marketId) => {
          const marketInfo = await queryClient.fetchQuery({
            queryKey: ['market', marketId.toString()],
            queryFn: () => useMarketInfo(marketId.toString()).data,
          });
          
          if (!marketInfo) return null;
          
          // Transformar datos del contrato a Market
          return {
            id: marketId.toString(),
            question: marketInfo[0],
            description: marketInfo[1],
            category: Number(marketInfo[2]),
            optionA: marketInfo[3],
            optionB: marketInfo[4],
            totalSharesA: Number(formatEther(marketInfo[5])),
            totalSharesB: Number(formatEther(marketInfo[6])),
            totalVolume: Number(formatEther(marketInfo[7])),
            closingTime: new Date(Number(marketInfo[8]) * 1000),
            isResolved: marketInfo[9],
            winningOption: marketInfo[10] === 0 ? 'A' : marketInfo[10] === 1 ? 'B' : undefined,
            creator: marketInfo[11],
            fees: {
              platform: Number(formatEther(marketInfo[12])),
              social: Number(formatEther(marketInfo[13])),
              total: Number(formatEther(marketInfo[12])) + Number(formatEther(marketInfo[13])),
            },
          } as Market;
        })
      );
      
      return marketsData.filter(Boolean) as Market[];
    },
    enabled: !!activeMarkets,
  });

  const userBetsQuery = useQuery({
    queryKey: ['userBets', address],
    queryFn: async (): Promise<Bet[]> => {
      if (!userBets || !address) return [];
      
      const betsData = await Promise.all(
        userBets.map(async (betId) => {
          const betInfo = await queryClient.fetchQuery({
            queryKey: ['bet', betId.toString()],
            queryFn: () => useBetInfo(betId.toString()).data,
          });
          
          if (!betInfo) return null;
          
          return {
            id: betId.toString(),
            marketId: betInfo[0].toString(),
            userId: address,
            option: betInfo[2] === 0 ? 'A' : 'B',
            amount: Number(formatEther(betInfo[3])),
            shares: Number(formatEther(betInfo[4])),
            timestamp: new Date(Number(betInfo[5]) * 1000),
            isResolved: betInfo[6],
            isWon: betInfo[7],
            payout: betInfo[8] ? Number(formatEther(betInfo[8])) : undefined,
            claimed: betInfo[9],
          } as Bet;
        })
      );
      
      return betsData.filter(Boolean) as Bet[];
    },
    enabled: !!userBets && !!address,
  });

  return {
    // Estado de conexión
    isConnected,
    address,
    
    // Datos de lectura
    activeMarkets: marketsQuery.data || [],
    marketsLoading: marketsLoading || marketsQuery.isLoading,
    userBets: userBetsQuery.data || [],
    betsLoading: betsLoading || userBetsQuery.isLoading,
    mxnbBalance: mxnbBalance ? Number(formatEther(mxnbBalance)) : 0,
    balanceLoading,
    minimumBet: minimumBet ? Number(formatEther(minimumBet)) : 0,
    platformFeePercentage: platformFeePercentage ? Number(platformFeePercentage) : 0,
    
    // Funciones de escritura
    createMarket,
    placeBet,
    claimWinnings,
    resolveMarket,
    
    // Estado de transacciones
    isWritePending,
    writeData,
    
    // Funciones auxiliares
    useMarketInfo,
    useBetInfo,
  };
}
