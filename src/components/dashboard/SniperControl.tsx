import React, { useState } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import Slider from '../common/Slider';
import { SniperSettings, Token } from '../../types';
import { Zap, Shield, Settings, AlertTriangle } from 'lucide-react';

interface SniperControlProps {
  onSnipe: (settings: SniperSettings) => void;
  selectedTokens: Token[];
  isActive: boolean;
  toggleActive: () => void;
}

const SniperControl: React.FC<SniperControlProps> = ({ 
  onSnipe, 
  selectedTokens,
  isActive,
  toggleActive
}) => {
  const [settings, setSettings] = useState<SniperSettings>({
    maxSlippage: 5,
    gasLevel: 'Medium',
    autoSell: true,
    autoSellThreshold: -10,
    multiTokenEnabled: false,
    maxTokensToSnipe: 1,
    rugPullProtection: true
  });

  const handleSlippageChange = (value: number) => {
    setSettings({...settings, maxSlippage: value});
  };

  const handleGasLevelChange = (value: number) => {
    const gasLevels: Record<number, 'Low' | 'Medium' | 'Turbo'> = {
      0: 'Low',
      1: 'Medium',
      2: 'Turbo'
    };
    setSettings({...settings, gasLevel: gasLevels[value]});
  };

  const handleAutoSellThresholdChange = (value: number) => {
    setSettings({...settings, autoSellThreshold: value});
  };

  const handleMaxTokensChange = (value: number) => {
    setSettings({...settings, maxTokensToSnipe: value});
  };

  const toggleAutoSell = () => {
    setSettings({...settings, autoSell: !settings.autoSell});
  };

  const toggleMultiToken = () => {
    setSettings({...settings, multiTokenEnabled: !settings.multiTokenEnabled});
  };

  const toggleRugPullProtection = () => {
    setSettings({...settings, rugPullProtection: !settings.rugPullProtection});
  };

  const handleSnipe = () => {
    onSnipe(settings);
  };

  return (
    <div className="space-y-4">
      <Card 
        title="Sniper Control" 
        className="border-solana-turquoise/20"
        glowing={isActive}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-solana-turquoise" />
                Sniper Mode
              </h3>
              <p className="text-gray-400 text-sm">
                {isActive 
                  ? "Active - targeting liquidity pools" 
                  : "Inactive - configure settings below"}
              </p>
            </div>
            <Button 
              variant={isActive ? "danger" : "primary"} 
              size="lg" 
              onClick={toggleActive}
              glowing={true}
              animated={true}
              className="font-mono font-bold tracking-wider"
            >
              {isActive ? "STOP SNIPER" : "SNIPE NOW"}
            </Button>
          </div>

          {selectedTokens.length > 0 && (
            <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Selected Targets</h4>
              <div className="flex flex-wrap gap-2">
                {selectedTokens.map(token => (
                  <div key={token.id} className="bg-gray-700 px-2 py-1 rounded text-xs font-mono flex items-center">
                    <span className="text-solana-turquoise mr-1">{token.symbol}</span>
                    <span className="text-gray-400">${token.price.toFixed(6)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Slider 
                label="Max Slippage %" 
                value={settings.maxSlippage}
                onChange={handleSlippageChange}
                min={1}
                max={15}
                step={0.5}
              />
            </div>
            <div>
              <Slider 
                label="Gas Fee Priority" 
                value={settings.gasLevel === 'Low' ? 0 : settings.gasLevel === 'Medium' ? 1 : 2}
                onChange={handleGasLevelChange}
                min={0}
                max={2}
                step={1}
                valueLabels={{0: 'Low', 1: 'Medium', 2: 'Turbo'}}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="autoSell" 
                checked={settings.autoSell}
                onChange={toggleAutoSell}
                className="w-4 h-4 accent-solana-turquoise"
              />
              <label htmlFor="autoSell" className="text-sm cursor-pointer">
                Auto Sell
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="multiToken" 
                checked={settings.multiTokenEnabled}
                onChange={toggleMultiToken}
                className="w-4 h-4 accent-solana-turquoise"
              />
              <label htmlFor="multiToken" className="text-sm cursor-pointer">
                Multi-Token Snipe
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="rugPullProtection" 
                checked={settings.rugPullProtection}
                onChange={toggleRugPullProtection}
                className="w-4 h-4 accent-solana-turquoise"
              />
              <label htmlFor="rugPullProtection" className="text-sm cursor-pointer flex items-center">
                <Shield className="w-3 h-3 mr-1 text-solana-turquoise" />
                Rug-Pull Protection
              </label>
            </div>
          </div>

          {settings.autoSell && (
            <div className="pt-2">
              <Slider 
                label="Auto-Sell Threshold %" 
                value={Math.abs(settings.autoSellThreshold)}
                onChange={(val) => handleAutoSellThresholdChange(-val)}
                min={1}
                max={50}
                step={1}
                valueDisplay={true}
                className="w-full"
              />
              <p className="text-xs text-gray-400 mt-1 flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1 text-amber-400" />
                Will auto-sell if token drops {settings.autoSellThreshold}% from peak
              </p>
            </div>
          )}

          {settings.multiTokenEnabled && (
            <div className="pt-2">
              <Slider 
                label="Max Tokens to Snipe" 
                value={settings.maxTokensToSnipe}
                onChange={handleMaxTokensChange}
                min={1}
                max={5}
                step={1}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SniperControl;