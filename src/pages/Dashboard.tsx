import React from 'react';
import BotControls from '../components/dashboard/BotControls';
import { StatsGrid } from '../components/dashboard/StatsCard';
import TokenTable from '../components/dashboard/TokenTable';
import TransactionList from '../components/dashboard/TransactionList';

const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      <BotControls />
      
      <StatsGrid />
      
      <div className="mb-6">
        <TokenTable 
          title="Recently Discovered Tokens" 
          filter={(token) => 
            token.status !== 'rejected' && 
            new Date().getTime() - token.createdAt.getTime() < 24 * 60 * 60 * 1000
          } 
        />
      </div>
      
      <div>
        <TransactionList limit={5} />
      </div>
    </div>
  );
};

export default Dashboard;