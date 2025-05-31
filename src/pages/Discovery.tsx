import React, { useState } from 'react';
import TokenTable from '../components/dashboard/TokenTable';
import { TokenData } from '../types';

const Discovery: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'analyzing' | 'approved' | 'rejected'>('all');
  
  const getFilterForTab = (tab: typeof activeTab) => {
    switch (tab) {
      case 'analyzing':
        return (token: TokenData) => token.status === 'analyzing';
      case 'approved':
        return (token: TokenData) => token.status === 'approved';
      case 'rejected':
        return (token: TokenData) => token.status === 'rejected';
      default:
        return undefined;
    }
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Token Discovery</h1>
      
      <div className="bg-gray-800 rounded-lg shadow-md mb-6">
        <div className="flex">
          {(['all', 'analyzing', 'approved', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 text-center transition-colors ${
                activeTab === tab
                  ? 'text-white border-b-2 border-indigo-500'
                  : 'text-gray-400 hover:text-gray-300 border-b border-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <TokenTable 
        title={`${activeTab === 'all' ? 'All' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Tokens`}
        filter={getFilterForTab(activeTab)}
      />
    </div>
  );
};

export default Discovery;