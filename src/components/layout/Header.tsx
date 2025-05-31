import React, { useState } from 'react';
import { Bell, Moon, Sun, ChevronDown } from 'lucide-react';
import { useBot } from '../../context/BotContext';

const Header: React.FC = () => {
  const { notifications, botStatus, wallets, markNotificationAsRead } = useBot();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showNotifications, setShowNotifications] = useState(false);
  
  const unreadNotifications = notifications.filter(n => !n.read);
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    // In a real app, you would actually change the theme here
  };
  
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };
  
  const getWalletDisplay = () => {
    const currentWallet = wallets.find(w => w.chain === botStatus.currentChain);
    if (!currentWallet) return "Not Connected";
    
    const shortAddress = `${currentWallet.address.substring(0, 4)}...${currentWallet.address.substring(currentWallet.address.length - 4)}`;
    return `${shortAddress} (${currentWallet.balance.toFixed(2)} ${currentWallet.chain === 'solana' ? 'SOL' : 'ETH'})`;
  };
  
  return (
    <header className="bg-gray-800 shadow-md px-6 py-4 flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold text-white">
          {botStatus.currentChain === 'solana' ? 'Solana' : 'Ethereum'} Sniper
        </h2>
        <p className="text-gray-400 text-sm">
          {botStatus.lastScan 
            ? `Last scan: ${formatTimeAgo(botStatus.lastScan)}` 
            : 'No recent scans'}
        </p>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="relative flex items-center">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              <Bell size={20} />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotifications.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-900 rounded-md shadow-lg overflow-hidden z-10 border border-gray-700">
                <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center">
                  <h3 className="font-medium text-white">Notifications</h3>
                  <button className="text-xs text-indigo-400 hover:text-indigo-300">
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-3 text-gray-400 text-center">
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <div 
                        key={notification.id}
                        className={`px-4 py-3 border-b border-gray-700 hover:bg-gray-800 transition-colors ${!notification.read ? 'bg-gray-800/50' : ''}`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start">
                          <div className={`h-2 w-2 rounded-full mt-1.5 mr-2 ${
                            notification.type === 'success' ? 'bg-green-500' :
                            notification.type === 'warning' ? 'bg-yellow-500' :
                            notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                          }`}></div>
                          <div>
                            <p className="font-medium text-sm text-white">{notification.title}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(notification.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 5 && (
                  <div className="px-4 py-2 border-t border-gray-700 text-center">
                    <a href="/notifications" className="text-sm text-indigo-400 hover:text-indigo-300">
                      View all notifications
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div className="flex items-center space-x-2 text-gray-300 border border-gray-700 rounded-md px-3 py-1.5 bg-gray-800 hover:bg-gray-700 transition-colors">
          <div className={`h-2 w-2 rounded-full ${wallets.some(w => w.chain === botStatus.currentChain) ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">{getWalletDisplay()}</span>
          <ChevronDown size={14} />
        </div>
      </div>
    </header>
  );
};

export default Header;