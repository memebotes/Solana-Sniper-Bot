import React from 'react';
import { CheckCircle as CircleCheck, XCircle, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { Transaction } from '../../types';
import { useBot } from '../../context/BotContext';

interface TransactionListProps {
  limit?: number;
}

const TransactionList: React.FC<TransactionListProps> = ({ limit }) => {
  const { transactions } = useBot();
  
  const limitedTransactions = limit ? transactions.slice(0, limit) : transactions;
  
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-md">
      <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
        <a href="/transactions" className="text-xs text-indigo-400 hover:text-indigo-300">
          View all
        </a>
      </div>
      
      <div className="divide-y divide-gray-700">
        {limitedTransactions.map((tx) => (
          <div key={tx.id} className="p-4 hover:bg-gray-700/50 transition-colors">
            <div className="flex justify-between">
              <div className="flex items-start">
                <div className={`mr-3 mt-1 rounded-full p-1 ${
                  tx.type === 'buy' ? 'bg-green-900/30 text-green-400' : 'bg-purple-900/30 text-purple-400'
                }`}>
                  {tx.type === 'buy' ? (
                    <TrendingDown size={16} />
                  ) : (
                    <TrendingUp size={16} />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center">
                    <span className="font-medium text-white">{tx.tokenSymbol}</span>
                    <span className="mx-2 text-gray-500">•</span>
                    <span className={`text-sm ${
                      tx.status === 'confirmed' ? 'text-green-400' : 
                      tx.status === 'pending' ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {tx.status === 'confirmed' ? (
                        <CircleCheck size={14} className="inline mr-1" />
                      ) : tx.status === 'failed' ? (
                        <XCircle size={14} className="inline mr-1" />
                      ) : null}
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-400 mt-1">
                    {tx.type === 'buy' ? 'Purchased' : 'Sold'} {tx.amount} SOL worth
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <span>{formatTimeAgo(tx.timestamp)}</span>
                    <span className="mx-1">•</span>
                    <span>Solana</span>
                    <span className="mx-1">•</span>
                    <span className="font-mono">Tx: {tx.txHash}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <span className="text-white font-mono">${tx.price.toFixed(8)}</span>
                
                {tx.type === 'sell' && tx.profitPercentage !== undefined && (
                  <span className={`text-sm ${tx.profitPercentage >= 0 ? 'text-green-400' : 'text-green-500'}`}>
                    {tx.profitPercentage >= 0 ? '+' : ''}{tx.profitPercentage}%
                  </span>
                )}
                
                <a
                  href={`https://solscan.io/tx/${tx.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-indigo-400 hover:text-indigo-300"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        ))}
        
        {transactions.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No transactions yet
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;