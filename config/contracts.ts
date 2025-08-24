import { MarketCategory } from '@/types/kiniela';
import { colorsRGB } from '@/src/config/colors';

// Direcciones de contratos en Monad Testnet
export const CONTRACTS = {
  KINIELA_MARKET: '0x1234567890123456789012345678901234567890', // Reemplazar con dirección real
  MXNB_TOKEN: '0x0987654321098765432109876543210987654321', // Reemplazar con dirección real
  USDC_TOKEN: '0x1111111111111111111111111111111111111111', // Reemplazar con dirección real
} as const;

// Categorías de mercados con porcentajes de impacto social
export const MARKET_CATEGORIES: MarketCategory[] = [
  {
    id: 'sports',
    name: 'Deportes',
    description: 'Eventos deportivos y competencias',
    socialPercentage: 10,
    color: colorsRGB.secondary,
  },
  {
    id: 'politics',
    name: 'Política',
    description: 'Eventos políticos y elecciones',
    socialPercentage: 15,
    color: colorsRGB.info,
  },
  {
    id: 'entertainment',
    name: 'Entretenimiento',
    description: 'Premios, eventos y noticias',
    socialPercentage: 8,
    color: colorsRGB.warning,
  },
  {
    id: 'technology',
    name: 'Tecnología',
    description: 'Lanzamientos y avances tecnológicos',
    socialPercentage: 12,
    color: colorsRGB.warning,
  },
  {
    id: 'finance',
    name: 'Finanzas',
    description: 'Mercados financieros y economía',
    socialPercentage: 20,
    color: colorsRGB.primary,
  },
  {
    id: 'other',
    name: 'Otros',
    description: 'Temas diversos y misceláneos',
    socialPercentage: 5,
    color: colorsRGB.mutedForeground,
  },
];

// ABI del contrato Kiniela Market (simplificado)
export const KINIELA_MARKET_ABI = [
  // Funciones de lectura
  'function getMarketInfo(uint256 marketId) external view returns (tuple(string question, string description, uint256 category, string optionA, string optionB, uint256 totalSharesA, uint256 totalSharesB, uint256 totalVolume, uint256 closingTime, bool isResolved, uint8 winningOption, address creator, uint256 platformFees, uint256 socialFees))',
  'function getActiveMarkets() external view returns (uint256[])',
  'function getUserBets(address user) external view returns (uint256[])',
  'function getBetInfo(uint256 betId) external view returns (tuple(uint256 marketId, address user, uint8 option, uint256 amount, uint256 shares, uint256 timestamp, bool isResolved, bool isWon, uint256 payout, bool claimed))',
  'function minimumBet() external view returns (uint256)',
  'function platformFeePercentage() external view returns (uint256)',
  
  // Funciones de escritura
  'function createMarket(string question, string description, uint256 category, string optionA, string optionB, uint256 closingTime) external payable',
  'function placeBet(uint256 marketId, uint8 option) external payable',
  'function claimWinnings(uint256 betId) external',
  'function resolveMarket(uint256 marketId, uint8 winningOption) external',
  
  // Eventos
  'event MarketCreated(uint256 indexed marketId, address indexed creator, string question, uint256 category)',
  'event BetPlaced(uint256 indexed betId, uint256 indexed marketId, address indexed user, uint8 option, uint256 amount)',
  'event BetResolved(uint256 indexed betId, bool isWon, uint256 payout)',
  'event WinningsClaimed(uint256 indexed betId, address indexed user, uint256 amount)',
] as const;

// ABI del token MXNB (ERC-20 estándar)
export const MXNB_TOKEN_ABI = [
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function decimals() external view returns (uint8)',
  'function totalSupply() external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) external returns (bool)',
  
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
] as const;

// Configuración de la API 0x para swaps
export const ZEROX_CONFIG = {
  baseUrl: 'https://api.0x.org',
  apiKey: process.env.EXPO_PUBLIC_ZEROX_API_KEY || '',
  supportedTokens: {
    MXNB: {
      address: CONTRACTS.MXNB_TOKEN,
      symbol: 'MXNB',
      decimals: 18,
      logoURI: 'https://example.com/mxnb-logo.png',
    },
    MONAD: {
      address: '0x0000000000000000000000000000000000000000', // Token nativo
      symbol: 'MONAD',
      decimals: 18,
      logoURI: 'https://example.com/monad-logo.png',
    },
    USDC: {
      address: CONTRACTS.USDC_TOKEN,
      symbol: 'USDC',
      decimals: 6,
      logoURI: 'https://example.com/usdc-logo.png',
    },
  },
};
