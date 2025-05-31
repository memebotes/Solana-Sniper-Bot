import React, { useState } from 'react';
import { Token } from '../../types';
import { formatNumber } from '../../utils/helpers';

interface TokenTableProps {
  tokens: Token[];
  onSelect?: (token: Token) => void;
  selectedTokenIds?: string[];
}

const TokenTable: React.FC<TokenTableProps> = ({ 
  tokens, 
  onSelect,
  selectedTokenIds = []
}) => {
  const [sortBy, setSortBy] = useState<keyof Token>('pumpScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: keyof Token) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  const sortedTokens = [...tokens].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a[sortBy] > b[sortBy] ? 1 : -1;
    } else {
      return a[sortBy] < b[sortBy] ? 1 : -1;
    }
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-gray-800 text-gray-400">
          <tr>
            {onSelect && <th className="px-4 py-2"></th>}
            <th className="px-4 py-2 cursor-pointer hover:text-solana-turquoise" onClick={() => handleSort('symbol')}>
              Token
              {sortBy === 'symbol' && (
                <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th className="px-4 py-2 cursor-pointer hover:text-solana-turquoise" onClick={() => handleSort('price')}>
              Price
              {sortBy === 'price' && (
                <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th className="px-4 py-2 cursor-pointer hover:text-solana-turquoise" onClick={() => handleSort('liquidity')}>
              Liquidity
              {sortBy === 'liquidity' && (
                <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th className="px-4 py-2 cursor-pointer hover:text-solana-turquoise" onClick={() => handleSort('volume1m')}>
              1m Vol
              {sortBy === 'volume1m' && (
                <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th className="px-4 py-2 cursor-pointer hover:text-solana-turquoise" onClick={() => handleSort('pumpScore')}>
              Pump Score
              {sortBy === 'pumpScore' && (
                <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th className="px-4 py-2 cursor-pointer hover:text-solana-turquoise" onClick={() => handleSort('scamRiskScore')}>
              Risk
              {sortBy === 'scamRiskScore' && (
                <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedTokens.map(token => (
            <tr 
              key={token.id} 
              className={`border-b border-gray-800 hover:bg-gray-800/50 ${
                selectedTokenIds.includes(token.id) ? 'bg-solana-turquoise/10 border-solana-turquoise/30' : ''
              } ${onSelect ? 'cursor-pointer' : ''}`}
              onClick={() => onSelect && onSelect(token)}
            >
              {onSelect && (
                <td className="px-4 py-2">
                  <input 
                    type="checkbox" 
                    checked={selectedTokenIds.includes(token.id)} 
                    onChange={() => {}} 
                    className="w-4 h-4 accent-solana-turquoise"
                  />
                </td>
              )}
              <td className="px-4 py-2 font-medium text-white">
                {token.symbol}
                <div className="text-xs text-gray-400 truncate max-w-[120px]">{token.name}</div>
              </td>
              <td className="px-4 py-2 font-mono">
                ${formatNumber(token.price)}
                <div className={`text-xs ${token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                </div>
              </td>
              <td className="px-4 py-2 font-mono">${formatNumber(token.liquidity)}</td>
              <td className="px-4 py-2 font-mono">${formatNumber(token.volume1m)}</td>
              <td className="px-4 py-2">
                <div className="flex items-center">
                  <div className="w-full bg-gray-700 rounded-full h-2 mr-2">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-solana-turquoise" 
                      style={{ width: `${token.pumpScore}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-mono">{token.pumpScore}</span>
                </div>
              </td>
              <td className="px-4 py-2">
                <div className="flex items-center">
                  <div className="w-full bg-gray-700 rounded-full h-2 mr-2">
                    <div 
                      className={`h-full rounded-full ${
                        token.scamRiskScore > 66 ? 'bg-red-500' : 
                        token.scamRiskScore > 33 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${token.scamRiskScore}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-mono">{token.scamRiskScore}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TokenTable;