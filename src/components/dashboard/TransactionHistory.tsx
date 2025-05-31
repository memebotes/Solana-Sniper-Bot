import React, { useState } from 'react';
import Card from '../common/Card';
import { Transaction } from '../../types';
import { formatTimestamp } from '../../utils/helpers';
import { ExternalLink, ArrowDown, ArrowUp, Check, X, Clock } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');
  
  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Check className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <X className="w-4 h-4 text-red-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-400" />;
      default:
        return null;
    }
  };

  return (
    <Card title="Transaction History">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 text-xs rounded-md ${filter === 'all' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-md ${filter === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400'}`}
            onClick={() => setFilter('buy')}
          >
            Buy
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-md ${filter === 'sell' ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-400'}`}
            onClick={() => setFilter('sell')}
          >
            Sell
          </button>
        </div>
        
        <div className="text-xs text-gray-500 font-mono">
          {filteredTransactions.length} transactions
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-96 terminal-scrollbar">
        {filteredTransactions.length > 0 ? (
          <div className="space-y-2">
            {filteredTransactions.map((tx) => (
              <div 
                key={tx.id} 
                className={`p-3 rounded-md border ${
                  tx.status === 'success' 
                    ? tx.type === 'buy' 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                    : tx.status === 'pending'
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-gray-800 border-gray-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="mr-2">
                      {tx.type === 'buy' ? (
                        <div className="bg-green-500/20 p-1 rounded">
                          <ArrowDown className="w-4 h-4 text-green-500" />
                        </div>
                      ) : (
                        <div className="bg-red-500/20 p-1 rounded">
                          <ArrowUp className="w-4 h-4 text-red-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium text-white">{tx.tokenSymbol}</span>
                        <span className="text-xs text-gray-400 ml-2">{tx.type.toUpperCase()}</span>
                        <span className="ml-2">{getStatusIcon(tx.status)}</span>
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {tx.tokenAddress.slice(0, 8)}...{tx.tokenAddress.slice(-4)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">
                      {tx.amount.toFixed(4)} @ ${tx.price.toFixed(6)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimestamp(tx.timestamp)}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center text-xs">
                  <a 
                    href={`https://solscan.io/tx/${tx.txHash}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-solana-turquoise hover:text-white flex items-center"
                  >
                    View on Solscan
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400">
            <p>No transactions to display</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TransactionHistory;