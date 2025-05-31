import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Shield, AlertTriangle, Check, X, ExternalLink } from 'lucide-react';
import { TokenData } from '../../types';
import { useBot } from '../../context/BotContext';

interface TokenTableProps {
  title: string;
  filter?: (token: TokenData) => boolean;
}

const TokenTable: React.FC<TokenTableProps> = ({ title, filter }) => {
  const { tokens } = useBot();
  const [sortField, setSortField] = useState<keyof TokenData>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Filter and sort tokens
  const filteredTokens = filter ? tokens.filter(filter) : tokens;
  const sortedTokens = [...filteredTokens].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
    }
    
    const aString = String(aValue);
    const bString = String(bValue);
    return sortDirection === 'asc' ? aString.localeCompare(bString) : bString.localeCompare(aString);
  });
  
  const handleSort = (field: keyof TokenData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
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
  
  const renderStatusBadge = (token: TokenData) => {
    const statusConfig = {
      pending: { bg: 'bg-gray-700', text: 'text-gray-300', icon: null },
      analyzing: { bg: 'bg-blue-900/50', text: 'text-blue-400', icon: <Shield size={12} className="mr-1" /> },
      approved: { bg: 'bg-indigo-900/50', text: 'text-indigo-400', icon: <Check size={12} className="mr-1" /> },
      rejected: { bg: 'bg-red-900/50', text: 'text-red-400', icon: <X size={12} className="mr-1" /> },
      purchased: { bg: 'bg-green-900/50', text: 'text-green-400', icon: <Check size={12} className="mr-1" /> },
      sold: { bg: 'bg-purple-900/50', text: 'text-purple-400', icon: <Check size={12} className="mr-1" /> },
    };
    
    const config = statusConfig[token.status];
    
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${config.bg} ${config.text}`}>
        {config.icon}
        {token.status.charAt(0).toUpperCase() + token.status.slice(1)}
      </span>
    );
  };
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-md">
      <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <span className="text-xs text-gray-400">{filteredTokens.length} tokens</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-900/50 text-gray-400 text-xs">
              <th className="px-4 py-2 text-left cursor-pointer hover:text-white" onClick={() => handleSort('symbol')}>
                Token
              </th>
              <th className="px-4 py-2 text-right cursor-pointer hover:text-white" onClick={() => handleSort('liquidity')}>
                Liquidity
              </th>
              <th className="px-4 py-2 text-right cursor-pointer hover:text-white" onClick={() => handleSort('price')}>
                Price
              </th>
              <th className="px-4 py-2 text-right cursor-pointer hover:text-white" onClick={() => handleSort('priceChange24h')}>
                24h %
              </th>
              <th className="px-4 py-2 text-right cursor-pointer hover:text-white" onClick={() => handleSort('whalePercentage')}>
                Whale %
              </th>
              <th className="px-4 py-2 text-right cursor-pointer hover:text-white" onClick={() => handleSort('createdAt')}>
                Found
              </th>
              <th className="px-4 py-2 text-center">Status</th>
              <th className="px-4 py-2 text-center">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sortedTokens.map((token) => (
              <tr key={token.address} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className="mr-2 bg-indigo-900/30 text-indigo-400 h-8 w-8 rounded-md flex items-center justify-center font-bold">
                      {token.symbol.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-white">{token.symbol}</div>
                      <div className="text-xs text-gray-400">{token.chain.charAt(0).toUpperCase() + token.chain.slice(1)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-white font-medium">${token.liquidity.toLocaleString()}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-white font-mono">${token.price.toFixed(8)}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className={`flex items-center justify-end ${token.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {token.priceChange24h >= 0 ? (
                      <TrendingUp size={14} className="mr-1" />
                    ) : (
                      <TrendingDown size={14} className="mr-1" />
                    )}
                    {Math.abs(token.priceChange24h).toFixed(2)}%
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className={`flex items-center justify-end ${
                    token.whalePercentage > 50 ? 'text-red-500' : 
                    token.whalePercentage > 30 ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {token.whalePercentage > 50 && <AlertTriangle size={14} className="mr-1" />}
                    {token.whalePercentage}%
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-gray-400 text-sm">
                  {formatTimeAgo(token.createdAt)}
                </td>
                <td className="px-4 py-3 flex justify-center">
                  {renderStatusBadge(token)}
                </td>
                <td className="px-4 py-3 text-center">
                  <button className="text-indigo-400 hover:text-indigo-300 p-1 rounded-full hover:bg-gray-700">
                    <ExternalLink size={16} />
                  </button>
                </td>
              </tr>
            ))}
            
            {sortedTokens.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  No tokens found matching the criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TokenTable;