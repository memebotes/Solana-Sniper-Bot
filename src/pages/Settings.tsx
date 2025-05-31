import React, { useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { useBot } from '../context/BotContext';
import { BotConfig } from '../types';

const Settings: React.FC = () => {
  const { botConfig, updateConfig, botStatus } = useBot();
  const [config, setConfig] = useState<BotConfig>({...botConfig});
  const [isEditing, setIsEditing] = useState(false);
  
  const handleInputChange = (section: keyof BotConfig, field: string, value: any) => {
    setIsEditing(true);
    
    if (section === 'chains') {
      setConfig({
        ...config,
        chains: {
          ...config.chains,
          [field]: {
            ...config.chains[field as keyof typeof config.chains],
            ...value
          }
        }
      });
    } else if (section === 'strategy') {
      setConfig({
        ...config,
        strategy: {
          ...config.strategy,
          [field]: value
        }
      });
    } else if (section === 'notifications') {
      setConfig({
        ...config,
        notifications: {
          ...config.notifications,
          [field]: value
        }
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(config);
    setIsEditing(false);
  };
  
  const discardChanges = () => {
    setConfig({...botConfig});
    setIsEditing(false);
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Bot Settings</h1>
        
        {botStatus.isRunning && (
          <div className="flex items-center text-yellow-500 bg-yellow-900/20 px-3 py-2 rounded-md">
            <AlertCircle size={16} className="mr-2" />
            <span>Some settings may not apply while the bot is running</span>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Chain Configuration</h2>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Solana</h3>
              
              <div className="mb-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.chains.solana.enabled}
                    onChange={(e) => handleInputChange('chains', 'solana', { enabled: e.target.checked })}
                    className="rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring focus:ring-indigo-500/20 mr-2"
                  />
                  <span className="text-gray-300">Enable Solana</span>
                </label>
              </div>
              
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">RPC URL</label>
                <input
                  type="text"
                  value={config.chains.solana.rpcUrl}
                  onChange={(e) => handleInputChange('chains', 'solana', { rpcUrl: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-500/20"
                  placeholder="https://api.mainnet-beta.solana.com"
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">Ethereum</h3>
              
              <div className="mb-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.chains.ethereum.enabled}
                    onChange={(e) => handleInputChange('chains', 'ethereum', { enabled: e.target.checked })}
                    className="rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring focus:ring-indigo-500/20 mr-2"
                  />
                  <span className="text-gray-300">Enable Ethereum</span>
                </label>
              </div>
              
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">RPC URL</label>
                <input
                  type="text"
                  value={config.chains.ethereum.rpcUrl}
                  onChange={(e) => handleInputChange('chains', 'ethereum', { rpcUrl: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-500/20"
                  placeholder="https://mainnet.infura.io/v3/your-api-key"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Trading Strategy</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Min Liquidity ($)</label>
                <input
                  type="number"
                  min="0"
                  value={config.strategy.minLiquidity}
                  onChange={(e) => handleInputChange('strategy', 'minLiquidity', Number(e.target.value))}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-500/20"
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Max Whale Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.strategy.maxWhalePercentage}
                  onChange={(e) => handleInputChange('strategy', 'maxWhalePercentage', Number(e.target.value))}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-500/20"
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Target Profit (%)</label>
                <input
                  type="number"
                  min="0"
                  value={config.strategy.targetProfit}
                  onChange={(e) => handleInputChange('strategy', 'targetProfit', Number(e.target.value))}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-500/20"
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Stop Loss (%)</label>
                <input
                  type="number"
                  min="0"
                  value={config.strategy.stopLoss}
                  onChange={(e) => handleInputChange('strategy', 'stopLoss', Number(e.target.value))}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-500/20"
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Buy Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={config.strategy.buyAmount}
                  onChange={(e) => handleInputChange('strategy', 'buyAmount', Number(e.target.value))}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-500/20"
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Slippage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.strategy.slippage}
                  onChange={(e) => handleInputChange('strategy', 'slippage', Number(e.target.value))}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Notifications</h2>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.notifications.telegram}
                  onChange={(e) => handleInputChange('notifications', 'telegram', e.target.checked)}
                  className="rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring focus:ring-indigo-500/20 mr-2"
                />
                <span className="text-gray-300">Telegram Notifications</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.notifications.discord}
                  onChange={(e) => handleInputChange('notifications', 'discord', e.target.checked)}
                  className="rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring focus:ring-indigo-500/20 mr-2"
                />
                <span className="text-gray-300">Discord Notifications</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.notifications.email}
                  onChange={(e) => handleInputChange('notifications', 'email', e.target.checked)}
                  className="rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring focus:ring-indigo-500/20 mr-2"
                />
                <span className="text-gray-300">Email Notifications</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-end space-x-3">
          {isEditing && (
            <button
              type="button"
              onClick={discardChanges}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors"
            >
              Discard Changes
            </button>
          )}
          
          <button
            type="submit"
            disabled={!isEditing}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              isEditing
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Save size={18} className="mr-2" />
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;