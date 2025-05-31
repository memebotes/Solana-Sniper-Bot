export interface Token {
  id: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  marketCap: number;
  liquidity: number;
  volume1m: number;
  pumpScore: number;
  scamRiskScore: number;
}

export interface Transaction {
  id: string;
  tokenSymbol: string;
  tokenAddress: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: number;
  status: 'success' | 'pending' | 'failed';
  txHash: string;
}

export interface SniperSettings {
  maxSlippage: number;
  gasLevel: 'Low' | 'Medium' | 'Turbo';
  autoSell: boolean;
  autoSellThreshold: number;
  multiTokenEnabled: boolean;
  maxTokensToSnipe: number;
  rugPullProtection: boolean;
}