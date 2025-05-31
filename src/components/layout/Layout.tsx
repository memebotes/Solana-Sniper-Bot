import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
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

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  connected,
  onConnect,
  onDisconnect,
  connectionSpeed,
  activeSection,
  onChangeSection,
  stats
}) => {
  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <div className="hidden md:block">
        <Sidebar 
          connectionSpeed={connectionSpeed} 
          activeSection={activeSection}
          onChangeSection={onChangeSection}
          stats={stats}
        />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          connected={connected} 
          onConnect={onConnect} 
          onDisconnect={onDisconnect}
          connectionSpeed={connectionSpeed}
        />
        <main className="flex-1 overflow-y-auto bg-gray-950 p-4 md:p-6 terminal-scrollbar">
          {children}
        </main>
      </div>
      
      {/* Laser animation overlay when sniper is active */}
      {activeSection === 'sniper' && (
        <div className="fixed inset-0 pointer-events-none z-10 laser-overlay"></div>
      )}
    </div>
  );
};

export default Layout;