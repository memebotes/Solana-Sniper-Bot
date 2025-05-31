import React, { useState } from 'react';
import TransactionList from '../components/dashboard/TransactionList';
import { useBot } from '../context/BotContext';
import { Transaction, Chain } from '../types';
import { Download, Filter } from 'lucide-react';

const Transactions: React.FC = () => {
  const { transactions, botStatus } = useBot();
  const [filterChain, setFilterChain] = useState<Chain | 'all'>('all');
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending' | 'failed'>('all');
  
  const filteredTransactions = transactions.filter(tx => {
    if (filterChain !== 'all' && tx.chain !== filterChain) return false;
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (filterStatus !== 'all' && tx.status !== filterStatus) return false;
    return true;
  });
  
  const downloadTransactions = () => {
    const headers = ['Date', 'Token', 'Chain', 'Type', 'Amount', 'Price', 'Status', 'Tx Hash', 'Profit'];
    
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(tx => {
        return [
          tx.timestamp.toISOString(),
          tx.tokenSymbol,
          tx.chain,
          tx.type,
          tx.amount,
          tx.price,
          tx.status,
          tx.txHash,
          tx.profitPercentage || ''
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const calculateStats = (transactions: Transaction[]) => {
    const buyTxs = transactions.filter(tx => tx.type === 'buy' && tx.status === 'confirmed');
    const sellTxs = transactions.filter(tx => tx.type === 'sell' && tx.status === 'confirmed');
    
    const totalBuys = buyTxs.length;
    const totalSells = sellTxs.length;
    
    const totalBuyAmount = buyTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const totalSellAmount = sellTxs.reduce((sum, tx) => sum + tx.amount, 0);
    
    const totalProfit = sellTxs.reduce((sum, tx) => sum + (tx.profit || 0), 0);
    
    const avgProfitPercentage = sellTxs.length > 0
      ? sellTxs.reduce((sum, tx) => sum + (tx.profitPercentage || 0), 0) / sellTxs.length
      : 0;
    
    return {
      totalBuys,
      totalSells,
      totalBuyAmount: totalBuyAmount.toFixed(4),
      totalSellAmount: totalSellAmount.toFixed(4),
      totalProfit: totalProfit.toFixed(6),
      avgProfitPercentage: avgProfitPercentage.toFixed(2)
    };
  };
  
  const stats = calculateStats(filteredTransactions);
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Transaction History</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={downloadTransactions}
            className="flex items-center px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
          >
            <Download size={16} className="mr-2" />
            Export CSV
          </button>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex space-x-4 mb-4 md:mb-0">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Chain</label>
              <select
                value={filterChain}
                onChange={(e) => setFilterChain(e.target.value as Chain | 'all')}
                className="bg-gray-700 text-white rounded px-3 py-1.5 text-sm border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-500/20"
              >
                <option value="all">All Chains</option>
                <option value="solana">Solana</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'buy' | 'sell')}
                className="bg-gray-700 text-white rounded px-3 py-1.5 text-sm border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-500/20"
              >
                <option value="all">All Types</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'confirmed' | 'pending' | 'failed')}
                className="bg-gray-700 text-white rounded px-3 py-1.5 text-sm border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-500/20"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center">
            <Filter size={16} className="text-gray-400 mr-2" />
            <span className="text-gray-400 text-sm">{filteredTransactions.length} transactions</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Transactions</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xl font-bold text-white">{stats.totalBuys}</p>
              <p className="text-xs text-gray-500">Buy Transactions</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">{stats.totalSells}</p>
              <p className="text-xs text-gray-500">Sell Transactions</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Volume</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xl font-bold text-white">{stats.totalBuyAmount} SOL</p>
              <p className="text-xs text-gray-500">Total Bought</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">{stats.totalSellAmount} SOL</p>
              <p className="text-xs text-gray-500">Total Sold</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Profit</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-xl font-bold ${Number(stats.totalProfit) >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                {Number(stats.totalProfit) >= 0 ? '+' : ''}{stats.totalProfit} SOL
              </p>
              <p className="text-xs text-gray-500">Total Profit</p>
            </div>
            <div>
              <p className={`text-xl font-bold ${Number(stats.avgProfitPercentage) >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                {Number(stats.avgProfitPercentage) >= 0 ? '+' : ''}{stats.avgProfitPercentage}%
              </p>
              <p className="text-xs text-gray-500">Avg. Profit</p>
            </div>
          </div>
        </div>
      </div>
      
      <TransactionList />
    </div>
  );
};

export default Transactions;