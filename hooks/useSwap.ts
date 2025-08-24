import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccount, useWriteContract } from 'wagmi';
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem';
import { ZEROX_CONFIG } from '@/config/contracts';
import { SwapQuote } from '@/types/kiniela';

export function useSwap() {
  const { address, isConnected } = useAccount();
  const { writeContract, isPending: isWritePending } = useWriteContract();
  const queryClient = useQueryClient();

  // Obtener cotización de swap
  const getSwapQuote = useMutation({
    mutationFn: async ({
      fromToken,
      toToken,
      fromAmount,
      slippage = 0.5, // 0.5% por defecto
    }: {
      fromToken: string;
      toToken: string;
      fromAmount: string;
      slippage?: number;
    }): Promise<SwapQuote> => {
      const response = await fetch(
        `${ZEROX_CONFIG.baseUrl}/swap/v1/quote?` +
        `fromTokenAddress=${fromToken}&` +
        `toTokenAddress=${toToken}&` +
        `amount=${fromAmount}&` +
        `slippagePercentage=${slippage}&` +
        `excludedSources=0x&` +
        `enableSlippageProtection=true`,
        {
          headers: {
            '0x-api-key': ZEROX_CONFIG.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener cotización de swap');
      }

      const data = await response.json();
      
      return {
        fromToken: data.fromToken.address,
        toToken: data.toToken.address,
        fromAmount: data.fromTokenAmount,
        toAmount: data.toTokenAmount,
        priceImpact: data.priceImpact,
        gasEstimate: data.gas,
        allowanceTarget: data.allowanceTarget,
        data: data.data,
      };
    },
  });

  // Ejecutar swap
  const executeSwap = useMutation({
    mutationFn: async ({
      quote,
      fromToken,
      toToken,
      fromAmount,
      toAmount,
    }: {
      quote: SwapQuote;
      fromToken: string;
      toToken: string;
      fromAmount: string;
      toAmount: string;
    }) => {
      if (!isConnected || !address) {
        throw new Error('Wallet no conectada');
      }

      // Si es token nativo (MONAD), usar transacción simple
      if (fromToken === '0x0000000000000000000000000000000000000000') {
        // Swap nativo a token
        return writeContract({
          address: quote.allowanceTarget as `0x${string}`,
          abi: [
            'function fillQuote(bytes calldata quote, uint256 value) external payable',
          ],
          functionName: 'fillQuote',
          args: [quote.data as `0x${string}`],
          value: parseEther(fromAmount),
        });
      } else if (toToken === '0x0000000000000000000000000000000000000000') {
        // Swap token a nativo
        return writeContract({
          address: quote.allowanceTarget as `0x${string}`,
          abi: [
            'function fillQuote(bytes calldata quote) external',
          ],
          functionName: 'fillQuote',
          args: [quote.data as `0x${string}`],
        });
      } else {
        // Swap token a token
        return writeContract({
          address: quote.allowanceTarget as `0x${string}`,
          abi: [
            'function fillQuote(bytes calldata quote) external',
          ],
          functionName: 'fillQuote',
          args: [quote.data as `0x${string}`],
        });
      }
    },
    onSuccess: () => {
      // Invalidar queries relacionadas con balances
      queryClient.invalidateQueries({ queryKey: ['userBalance'] });
      queryClient.invalidateQueries({ queryKey: ['tokenBalance'] });
    },
  });

  // Obtener tokens soportados
  const supportedTokens = useQuery({
    queryKey: ['supportedTokens'],
    queryFn: async () => {
      const response = await fetch(
        `${ZEROX_CONFIG.baseUrl}/tokens`,
        {
          headers: {
            '0x-api-key': ZEROX_CONFIG.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener tokens soportados');
      }

      const data = await response.json();
      return data.tokens.filter((token: any) => 
        Object.values(ZEROX_CONFIG.supportedTokens).some(
          supportedToken => supportedToken.address.toLowerCase() === token.address.toLowerCase()
        )
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Obtener precio de un token
  const getTokenPrice = useQuery({
    queryKey: ['tokenPrice', 'usd'],
    queryFn: async () => {
      const response = await fetch(
        `${ZEROX_CONFIG.baseUrl}/price/v1/quote?` +
        `baseToken=${ZEROX_CONFIG.supportedTokens.USDC.address}&` +
        `quoteToken=${ZEROX_CONFIG.supportedTokens.MXNB.address}&` +
        `baseAmount=1000000`, // 1 USDC (6 decimales)
        {
          headers: {
            '0x-api-key': ZEROX_CONFIG.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener precio del token');
      }

      const data = await response.json();
      return {
        mxnbPrice: parseFloat(data.price),
        usdcPrice: 1, // USDC siempre vale $1
        monadPrice: 0, // TODO: Implementar precio de MONAD
      };
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
  });

  // Aprobar gasto de tokens
  const approveToken = useMutation({
    mutationFn: async ({
      tokenAddress,
      spender,
      amount,
    }: {
      tokenAddress: string;
      spender: string;
      amount: string;
    }) => {
      if (!isConnected || !address) {
        throw new Error('Wallet no conectada');
      }

      return writeContract({
        address: tokenAddress as `0x${string}`,
        abi: [
          'function approve(address spender, uint256 amount) external returns (bool)',
        ],
        functionName: 'approve',
        args: [spender as `0x${string}`, parseEther(amount)],
      });
    },
  });

  return {
    // Estado de conexión
    isConnected,
    address,
    
    // Funciones de swap
    getSwapQuote,
    executeSwap,
    approveToken,
    
    // Datos
    supportedTokens: supportedTokens.data || [],
    supportedTokensLoading: supportedTokens.isLoading,
    tokenPrices: getTokenPrice.data,
    tokenPricesLoading: getTokenPrice.isLoading,
    
    // Estado de transacciones
    isWritePending,
    
    // Configuración
    config: ZEROX_CONFIG,
  };
}
