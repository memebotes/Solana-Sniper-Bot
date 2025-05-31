import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cpu, LineChart, History, Settings, Bell, Wallet } from 'lucide-react';
import { useBot } from '../../context/BotContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { botStatus } = useBot();

  const navItems = [
    { path: '/', icon: <Cpu size={20} />, label: 'Dashboard' },
    { path: '/discovery', icon: <LineChart size={20} />, label: 'Discovery' },
    { path: '/transactions', icon: <History size={20} />, label: 'Transactions' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
    { path: '/wallet', icon: <Wallet size={20} />, label: 'Wallet' },
    { path: '/notifications', icon: <Bell size={20} />, label: 'Notifications' },
  ];

  return (
    <div className="h-screen bg-gray-900 text-gray-100 w-64 flex flex-col shadow-lg">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <Cpu className="text-green-400" size={24} />
          <h1 className="text-xl font-bold">Jupiter Bot</h1>
        </div>
        <p className="text-xs text-gray-500 mt-1">Jupiter & Raydium Trading Bot v1.0</p>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-4 mb-4">
          <div className={`px-3 py-2 rounded-md mb-1 ${botStatus.isRunning ? 'bg-green-900/20' : 'bg-red-900/20'} flex items-center`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${botStatus.isRunning ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            <span className="text-sm">{botStatus.isRunning ? 'Bot Active' : 'Bot Inactive'}</span>
          </div>
          <div className="text-xs text-gray-500 px-3">
            Mode: {botStatus.mode.charAt(0).toUpperCase() + botStatus.mode.slice(1)}
          </div>
          <div className="text-xs text-gray-500 px-3">
            DEX: {botStatus.currentDex}
          </div>
        </div>

        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 transition-colors ${
                  location.pathname === item.path
                    ? 'bg-green-900/30 text-green-400 border-l-2 border-green-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 text-center">
          Jupiter & Raydium Auto Trading Bot
        </div>
      </div>
    </div>
  );
};

export default Sidebar;