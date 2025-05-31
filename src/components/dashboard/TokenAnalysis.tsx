import React, { useState } from 'react';
import Card from '../common/Card';
import { Token } from '../../types';
import TokenTable from '../common/TokenTable';
import { Search, AlertTriangle, BarChart3 } from 'lucide-react';

interface TokenAnalysisProps {
  tokens: Token[];
  onSelectToken: (token: Token) => void;
  selectedTokenIds: string[];
  liquidityDetected?: Token | null;
}

const TokenAnalysis: React.FC<TokenAnalysisProps> = ({ 
  tokens, 
  onSelectToken,
  selectedTokenIds,
  liquidityDetected
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMinLiquidity, setFilterMinLiquidity] = useState(5);
  
  const filteredTokens = tokens.filter(token => {
    const matchesSearch = token.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         token.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const meetsLiquidityMin = token.liquidity >= filterMinLiquidity;
    return matchesSearch && meetsLiquidityMin;
  });

  return (
    <div className="space-y-4">
      {liquidityDetected && (
        <div className="bg-solana-turquoise/10 border border-solana-turquoise rounded-lg p-4 flex items-center animate-pulse">
          <div className="w-3 h-3 rounded-full bg-solana-turquoise mr-3 animate-ping"></div>
          <div>
            <div className="text-solana-turquoise font-mono font-bold text-lg">Liquidity Detected!</div>
            <div className="text-sm text-gray-300">{liquidityDetected.symbol} - {liquidityDetected.name}</div>
            <div className="text-xs text-gray-400">Initial liquidity: ${liquidityDetected.liquidity.toFixed(2)} SOL</div>
          </div>
        </div>
      )}
      
      <Card title="Token Analysis">
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 pl-10 pr-4 text-gray-300 focus:outline-none focus:border-solana-turquoise"
            />
            <Search className="absolute left-3 top-2.5 text-gray-500 h-4 w-4" />
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-400">Min Liquidity:</label>
            <select
              value={filterMinLiquidity}
              onChange={(e) => setFilterMinLiquidity(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 rounded-md py-1.5 px-3 text-gray-300 text-sm focus:outline-none focus:border-solana-turquoise"
            >
              <option value={0}>All</option>
              <option value={1}>1+ SOL</option>
              <option value={5}>5+ SOL</option>
              <option value={10}>10+ SOL</option>
              <option value={50}>50+ SOL</option>
              <option value={100}>100+ SOL</option>
            </select>
          </div>
        </div>
        
        <div className="mb-4 flex items-center gap-2 text-xs text-gray-400">
          <div className="flex items-center">
            <div className="w-2 h-2 mr-1 rounded-full bg-gradient-to-r from-blue-500 to-solana-turquoise"></div>
            <span>Pump Score</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 mr-1 rounded-full bg-green-500"></div>
            <span>Low Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 mr-1 rounded-full bg-yellow-500"></div>
            <span>Medium Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 mr-1 rounded-full bg-red-500"></div>
            <span>High Risk</span>
          </div>
        </div>
        
        {filteredTokens.length > 0 ? (
          <TokenTable 
            tokens={filteredTokens} 
            onSelect={onSelectToken}
            selectedTokenIds={selectedTokenIds}
          />
        ) : (
          <div className="py-8 text-center text-gray-400">
            <BarChart3 className="mx-auto h-12 w-12 mb-3 text-gray-600" />
            <p>No tokens match your filters.</p>
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {filteredTokens.length} tokens displayed
          </div>
          
          <div className="text-xs text-gray-400 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1 text-amber-400" />
            <span>AI risk assessment is not financial advice</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TokenAnalysis;