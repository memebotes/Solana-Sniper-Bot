export type Chain = 'solana';

export type DEX = 'Jupiter' | 'Raydium';

export type TokenData = {
  address: string;
  symbol: string;
  name: string;
  chain: Chain;
  dex: DEX;
  price: number;
  priceChange24h: number;
  liquidity: number;
  volume24h: number;
  createdAt: Date;
  isAnalyzed: boolean;
  isHoneypot: boolean;
  whalePercentage: number;
  routeInfo?: {
    bestRoute: string;
    expectedOutput: number;
    priceImpact: number;
  };
  status: 'pending' | 'analyzing' | 'approved' | 'rejected' | 'purchased' | 'sold';
}

export type Transaction = {
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  chain: Chain;
  dex: DEX;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  priceImpact: number;
  route: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
  txHash: string;
  profit?: number;
  profitPercentage?: number;
}

export type BotStatus = {
  isRunning: boolean;
  currentDex: DEX;
  mode: 'discovery' | 'snipe' | 'sell' | 'idle';
  lastScan: Date | null;
  discoveredTokens: number;
  analyzedTokens: number;
  purchasedTokens: number;
  soldTokens: number;
  totalProfit: number;
  uptime: number;
  bestRoute?: {
    from: string;
    to: string;
    route: string[];
    expectedOutput: number;
  };
}

export type BotConfig = {
  dex: {
    jupiter: {
      enabled: boolean;
      slippage: number;
    };
    raydium: {
      enabled: boolean;
      slippage: number;
    };
  };
  strategy: {
    minLiquidity: number;
    maxWhalePercentage: number;
    targetProfit: number;
    stopLoss: number;
    buyAmount: number;
    maxPriceImpact: number;
    routeOptimization: 'best_price' | 'lowest_impact' | 'balanced';
  };
  notifications: {
    telegram: boolean;
    discord: boolean;
    email: boolean;
  };
}

export type Notification = {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export type WalletInfo = {
  address: string;
  chain: Chain;
  balance: number;
  connectedAt: Date;
}