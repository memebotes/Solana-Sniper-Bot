import { TokenData, Transaction, Notification } from '../types';

export const mockTokens: TokenData[] = [
  {
    address: '6x3FZk4k2',
    symbol: 'SNIPE',
    name: 'SniperToken',
    chain: 'solana',
    price: 0.00045,
    priceChange24h: 35.2,
    liquidity: 25000,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    isAnalyzed: true,
    isHoneypot: false,
    whalePercentage: 12,
    status: 'purchased',
  },
  {
    address: 'Ax8gF92js',
    symbol: 'SAFE',
    name: 'SafetyFirst',
    chain: 'solana',
    price: 0.00078,
    priceChange24h: -5.1,
    liquidity: 42000,
    createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
    isAnalyzed: true,
    isHoneypot: false,
    whalePercentage: 22,
    status: 'approved',
  },
  {
    address: '0x71C76F52e',
    symbol: 'MOON',
    name: 'MoonShooter',
    chain: 'ethereum',
    price: 0.00023,
    priceChange24h: 124.5,
    liquidity: 35000,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isAnalyzed: true,
    isHoneypot: false,
    whalePercentage: 28,
    status: 'sold',
  },
  {
    address: '0x92dB4E7a',
    symbol: 'TRAP',
    name: 'TrapToken',
    chain: 'ethereum',
    price: 0.00002,
    priceChange24h: -22.8,
    liquidity: 15000,
    createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
    isAnalyzed: true,
    isHoneypot: true,
    whalePercentage: 85,
    status: 'rejected',
  },
  {
    address: 'KL92jF7sh',
    symbol: 'NEW',
    name: 'NewCoin',
    chain: 'solana',
    price: 0.00012,
    priceChange24h: 0,
    liquidity: 12000,
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    isAnalyzed: false,
    isHoneypot: false,
    whalePercentage: 0,
    status: 'analyzing',
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    tokenAddress: '6x3FZk4k2',
    tokenSymbol: 'SNIPE',
    chain: 'solana',
    type: 'buy',
    amount: 1.5,
    price: 0.00032,
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    status: 'confirmed',
    txHash: '3sx2...9kL',
  },
  {
    id: '2',
    tokenAddress: '0x71C76F52e',
    tokenSymbol: 'MOON',
    chain: 'ethereum',
    type: 'buy',
    amount: 0.2,
    price: 0.00010,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    status: 'confirmed',
    txHash: '0x7f2...d4a',
  },
  {
    id: '3',
    tokenAddress: '0x71C76F52e',
    tokenSymbol: 'MOON',
    chain: 'ethereum',
    type: 'sell',
    amount: 0.2,
    price: 0.00023,
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    status: 'confirmed',
    txHash: '0x9a3...b2c',
    profit: 0.000026,
    profitPercentage: 130,
  },
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Token Purchased',
    message: 'Successfully purchased SNIPE token for 1.5 SOL',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'High Whale Percentage',
    message: 'TRAP token has 85% whale ownership. Purchase avoided.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
    read: false,
  },
  {
    id: '3',
    type: 'success',
    title: 'Profit Realized',
    message: 'Sold MOON token with 130% profit',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    read: true,
  },
  {
    id: '4',
    type: 'info',
    title: 'New Token Discovered',
    message: 'NEW token found on Solana with $12k liquidity',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    read: false,
  },
];