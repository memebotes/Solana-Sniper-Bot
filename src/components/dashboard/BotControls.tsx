import React from 'react';
import { Play, Pause, RotateCw, AlertCircle } from 'lucide-react';
import { useBot } from '../../context/BotContext';

const BotControls: React.FC = () => {
  const { botStatus, startBot, stopBot, connectWallet, wallets } = useBot();
  
  const handleStartBot = async () => {
    const currentWallet = wallets.find(w => w.chain === 'solana');
    
    if (!currentWallet) {
      await connectWallet('solana');
    }
    
    startBot();
  };
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-lg font-semibold text-white mb-3">pump.fun Bot Controls</h2>
      
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={botStatus.isRunning ? stopBot : handleStartBot}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              botStatus.isRunning
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {botStatus.isRunning ? (
              <>
                <Pause size={18} className="mr-2" />
                Stop Bot
              </>
            ) : (
              <>
                <Play size={18} className="mr-2" />
                Start Bot
              </>
            )}
          </button>
          
          <button
            onClick={() => {
              if (botStatus.isRunning) {
                stopBot();
                setTimeout(startBot, 500);
              }
            }}
            disabled={!botStatus.isRunning}
            className={`flex items-center px-4 py-2 rounded-md ${
              botStatus.isRunning
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            <RotateCw size={18} className="mr-2" />
            Restart
          </button>
          
          {!wallets.some(w => w.chain === 'solana') && (
            <div className="text-yellow-500 flex items-center">
              <AlertCircle size={18} className="mr-1" />
              <span className="text-sm">Wallet not connected</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BotControls;