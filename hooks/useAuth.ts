import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { monadTestnet } from '@/config/chains';

export function useAuth() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const isOnCorrectNetwork = chainId === monadTestnet.id;
  const correctNetworkId = monadTestnet.id;

  // Debug logging
  console.log('useAuth Debug:', {
    isConnected,
    address: address?.slice(0, 6) + '...',
    chainId,
    isOnCorrectNetwork,
    monadTestnetId: monadTestnet.id,
    timestamp: new Date().toISOString()
  });

  const switchToMonadTestnet = () => {
    if (switchChain) {
      switchChain({ chainId: monadTestnet.id });
    }
  };

  const canAccessApp = isConnected && address && isOnCorrectNetwork;

  return {
    isConnected,
    address,
    chainId,
    isOnCorrectNetwork,
    correctNetworkId,
    switchToMonadTestnet,
    isSwitching,
    canAccessApp,
  };
}
