import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Token, Transaction, SniperSettings } from '../types';
import { calculatePing, randomInRange } from '../utils/helpers';

interface AppContextType {
  tokens: Token[];
  transactions: Transaction[];
  selectedTokenIds: string[];
  activeSection: string;
  connected: boolean;
  connectionSpeed: number;
  isSnipeActive: boolean;
  liquidityDetected: Token | null;
  stats: {
    price: number;
    priceChange: number;
    successRate: number;
    avgProfit: number;
  };
  toggleSnipeActive: () => void;
  selectToken: (token: Token) => void;
  executeSnipe: (settings: SniperSettings) => void;
  setActiveSection: (section: string) => void;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data for demo purposes
const generateMockTokens = (): Token[] => {
  const tokens: Token[] = [];
  
  for (let i = 0; i < 20; i++) {
    const price = i % 3 === 0 
      ? randomInRange(0.000001, 0.0001) 
      : i % 7 === 0 
        ? randomInRange(0.1, 10) 
        : randomInRange(0.001, 0.1);
        
    tokens.push({
      id: `token-${i}`,
      name: `Token Project ${i}`,
      symbol: `TKN${i}`,
      price,
      priceChange24h: randomInRange(-15, 25),
      marketCap: price * randomInRange(100000, 10000000),
      liquidity: randomInRange(1, 200),
      volume1m: randomInRange(100, 10000),
      pumpScore: Math.floor(randomInRange(10, 95)),
      scamRiskScore: Math.floor(randomInRange(5, 90))
    });
  }
  
  return tokens;
};

const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const now = Date.now();
  
  for (let i = 0; i < 10; i++) {
    const isSuccess = Math.random() > 0.2;
    const isBuy = Math.random() > 0.3;
    
    transactions.push({
      id: `tx-${i}`,
      tokenSymbol: `TKN${Math.floor(Math.random() * 20)}`,
      tokenAddress: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      type: isBuy ? 'buy' : 'sell',
      amount: randomInRange(10, 1000),
      price: randomInRange(0.00001, 0.1),
      timestamp: now - Math.floor(Math.random() * 86400000),
      status: i === 0 ? 'pending' : isSuccess ? 'success' : 'failed',
      txHash: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    });
  }
  
  return transactions.sort((a, b) => b.timestamp - a.timestamp);
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tokens, setTokens] = useState<Token[]>(generateMockTokens());
  const [transactions, setTransactions] = useState<Transaction[]>(generateMockTransactions());
  const [selectedTokenIds, setSelectedTokenIds] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [connected, setConnected] = useState(false);
  const [connectionSpeed, setConnectionSpeed] = useState(calculatePing());
  const [isSnipeActive, setIsSnipeActive] = useState(false);
  const [liquidityDetected, setLiquidityDetected] = useState<Token | null>(null);
  const [stats, setStats] = useState({
    price: 72.45,
    priceChange: 3.28,
    successRate: 76,
    avgProfit: 24.5
  });
  
  // Simulate network speed
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionSpeed(calculatePing());
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Simulate liquidity detection when sniper is active
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isSnipeActive) {
      timeout = setTimeout(() => {
        const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
        setLiquidityDetected(randomToken);
        
        // Clear the notification after 5 seconds
        setTimeout(() => {
          setLiquidityDetected(null);
        }, 5000);
      }, 8000);
    }
    
    return () => clearTimeout(timeout);
  }, [isSnipeActive, tokens]);
  
  const toggleSnipeActive = () => {
    setIsSnipeActive(!isSnipeActive);
  };
  
  const selectToken = (token: Token) => {
    if (selectedTokenIds.includes(token.id)) {
      setSelectedTokenIds(selectedTokenIds.filter(id => id !== token.id));
    } else {
      setSelectedTokenIds([...selectedTokenIds, token.id]);
    }
  };
  
  const executeSnipe = (settings: SniperSettings) => {
    console.log('Executing snipe with settings:', settings);
    // In a real app, this would make API calls to execute trades
  };
  
  const connectWallet = () => {
    setConnected(true);
  };
  
  const disconnectWallet = () => {
    setConnected(false);
  };
  
  return (
    <AppContext.Provider
      value={{
        tokens,
        transactions,
        selectedTokenIds,
        activeSection,
        connected,
        connectionSpeed,
        isSnipeActive,
        liquidityDetected,
        stats,
        toggleSnipeActive,
        selectToken,
        executeSnipe,
        setActiveSection,
        connectWallet,
        disconnectWallet
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};