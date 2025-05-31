import React from 'react';
import SolanaLogo3D from '../visualizations/SolanaLogo3D';
import LiveLedDisplay from '../visualizations/LiveLedDisplay';
import { 
  Zap, 
  LineChart, 
  History, 
  Flame, 
  Radar, 
  Shield, 
  Lock, 
  Wrench
} from 'lucide-react';

interface SidebarProps {
  connectionSpeed: number;
  activeSection: string;
  onChangeSection: (section: string) => void;
  stats: {
    price: number;
    priceChange: number;
    successRate: number;
    avgProfit: number;
  };
}

const Sidebar: React.FC<SidebarProps> = ({ 
  connectionSpeed, 
  activeSection,
  onChangeSection,
  stats
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LineChart className="w-5 h-5" /> },
    { id: 'sniper', label: 'Sniper', icon: <Zap className="w-5 h-5" /> },
    { id: 'history', label: 'History', icon: <History className="w-5 h-5" /> },
    { id: 'hunter', label: 'Token Hunter', icon: <Radar className="w-5 h-5" /> },
    { id: 'protection', label: 'Rug Protection', icon: <Shield className="w-5 h-5" /> },
    { id: 'backtest', label: 'Backtest', icon: <Flame className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Wrench className="w-5 h-5" /> }
  ];

  return (
    <div className="bg-gray-900 border-r border-gray-800 h-screen sticky top-0 flex flex-col w-64">
      <div className="p-4 border-b border-gray-800">
        <SolanaLogo3D speed={connectionSpeed} />
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <LiveLedDisplay 
            label="SOL Price" 
            value={`$${stats.price.toFixed(2)}`} 
            color={stats.priceChange >= 0 ? 'green' : 'red'}
            blinking={true}
          />
          <LiveLedDisplay 
            label="24h Change" 
            value={`${stats.priceChange >= 0 ? '+' : ''}${stats.priceChange.toFixed(2)}%`} 
            color={stats.priceChange >= 0 ? 'green' : 'red'}
          />
        </div>
      </div>
      
      <nav className="flex-grow overflow-y-auto py-4 terminal-scrollbar">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onChangeSection(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm ${
                  activeSection === item.id 
                    ? 'bg-gray-800 text-solana-turquoise' 
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                <span className={activeSection === item.id ? 'text-solana-turquoise' : 'text-gray-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400">Success Rate</span>
            <span className="text-xs font-mono text-solana-turquoise">{stats.successRate}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-solana-turquoise" 
              style={{ width: `${stats.successRate}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center mt-3 mb-2">
            <span className="text-xs text-gray-400">Avg. Profit</span>
            <span className={`text-xs font-mono ${stats.avgProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.avgProfit >= 0 ? '+' : ''}{stats.avgProfit}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div 
              className={`h-full rounded-full ${
                stats.avgProfit >= 0 
                  ? 'bg-gradient-to-r from-blue-500 to-green-500' 
                  : 'bg-gradient-to-r from-yellow-500 to-red-500'
              }`} 
              style={{ width: `${Math.min(Math.abs(stats.avgProfit), 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center text-xs text-gray-500">
          <Lock className="w-3 h-3 mr-1" />
          <span>Secure connection</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;