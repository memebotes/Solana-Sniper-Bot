import React, { useState } from 'react';
import Button from '../common/Button';
import { Wallet, Sliders, Database, Network, Menu, X } from 'lucide-react';

interface HeaderProps {
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  connectionSpeed: number;
}

const Header: React.FC<HeaderProps> = ({ 
  connected, 
  onConnect, 
  onDisconnect,
  connectionSpeed
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="text-solana-turquoise font-mono text-xl font-bold tracking-tighter flex items-center">
              <div className="w-2 h-5 bg-solana-turquoise mr-2 animate-pulse"></div>
              SOLANA SNIPER
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center text-xs text-gray-400">
              <Network className="w-4 h-4 mr-1 text-solana-turquoise" />
              <span className="hidden lg:inline mr-1">Connection Speed:</span>
              <span className={connectionSpeed < 50 ? "text-green-400" : connectionSpeed < 100 ? "text-amber-400" : "text-red-400"}>
                {connectionSpeed}ms
              </span>
            </div>
            
            <button
              onClick={toggleSettings}
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <Sliders className="w-5 h-5" />
            </button>
            
            {connected ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-sm text-gray-300">Connected</span>
                </div>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={onDisconnect}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={onConnect}
                className="flex items-center"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
          
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-800 bg-gray-900">
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center text-xs text-gray-400">
                <Network className="w-4 h-4 mr-1 text-solana-turquoise" />
                <span>Speed: </span>
                <span className={connectionSpeed < 50 ? "text-green-400" : connectionSpeed < 100 ? "text-amber-400" : "text-red-400"}>
                  {connectionSpeed}ms
                </span>
              </div>
              
              <button
                onClick={toggleSettings}
                className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <Sliders className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-3">
              {connected ? (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-sm text-gray-300">Connected</span>
                  </div>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={onDisconnect}
                    className="w-full"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={onConnect}
                  className="w-full flex items-center justify-center"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Settings panel */}
      {showSettings && (
        <div className="absolute right-4 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-md shadow-lg p-4 z-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-medium">Settings</h3>
            <button onClick={toggleSettings} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">RPC Endpoint</label>
              <div className="flex">
                <input 
                  type="text" 
                  className="flex-grow bg-gray-800 border border-gray-700 rounded-l-md py-1 px-3 text-sm text-gray-300 focus:outline-none focus:border-solana-turquoise"
                  defaultValue="https://api.mainnet-beta.solana.com"
                />
                <button className="bg-gray-700 text-gray-300 px-3 py-1 rounded-r-md text-sm">
                  Test
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">DEX</label>
              <select 
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-1.5 px-3 text-gray-300 text-sm focus:outline-none focus:border-solana-turquoise"
              >
                <option>Raydium</option>
                <option>Orca</option>
                <option>Jupiter</option>
                <option>All</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Node Encryption</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="toggle" 
                  className="sr-only" 
                  defaultChecked={true}
                />
                <label 
                  htmlFor="toggle" 
                  className="block overflow-hidden h-5 rounded-full bg-gray-700 cursor-pointer"
                >
                  <span 
                    className="block h-5 w-5 rounded-full bg-solana-turquoise transform translate-x-5 transition-transform"
                  ></span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Dark Theme</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="theme-toggle" 
                  className="sr-only" 
                  defaultChecked={true}
                />
                <label 
                  htmlFor="theme-toggle" 
                  className="block overflow-hidden h-5 rounded-full bg-gray-700 cursor-pointer"
                >
                  <span 
                    className="block h-5 w-5 rounded-full bg-solana-turquoise transform translate-x-5 transition-transform"
                  ></span>
                </label>
              </div>
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              className="w-full flex items-center justify-center"
            >
              <Database className="w-4 h-4 mr-2" />
              Export Settings
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;