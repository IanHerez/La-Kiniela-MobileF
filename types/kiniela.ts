export interface Market {
  id: string;
  question: string;
  description: string;
  category: MarketCategory;
  optionA: string;
  optionB: string;
  totalSharesA: number;
  totalSharesB: number;
  totalVolume: number;
  closingTime: Date;
  isResolved: boolean;
  winningOption?: 'A' | 'B';
  creator: string;
  fees: {
    platform: number;
    social: number;
    total: number;
  };
  socialCause?: SocialCause;
}

export interface MarketCategory {
  id: string;
  name: string;
  description: string;
  socialPercentage: number;
  color: string;
}

export interface SocialCause {
  id: string;
  name: string;
  description: string;
  category: MarketCategory;
  totalDonated: number;
  targetAmount: number;
  organization: string;
  website?: string;
}

export interface Bet {
  id: string;
  marketId: string;
  userId: string;
  option: 'A' | 'B';
  amount: number;
  shares: number;
  timestamp: Date;
  isResolved: boolean;
  isWon?: boolean;
  payout?: number;
  claimed: boolean;
}

export interface User {
  address: string;
  balance: {
    mxnb: number;
    monad: number;
    usdc: number;
  };
  totalBets: number;
  totalWon: number;
  totalLost: number;
  activeBets: number;
  socialImpact: number;
}

export interface SwapQuote {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  priceImpact: number;
  gasEstimate: string;
  allowanceTarget: string;
  data: string;
}

export interface Transaction {
  hash: string;
  type: 'bet' | 'claim' | 'swap' | 'create_market';
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  details: any;
}
