import React, { useEffect } from 'react';
import Layout from './components/layout/Layout';
import SniperControl from './components/dashboard/SniperControl';
import TokenAnalysis from './components/dashboard/TokenAnalysis';
import TransactionHistory from './components/dashboard/TransactionHistory';
import { useApp } from './context/AppContext';

function App() {
  const { 
    tokens, 
    transactions,
    selectedTokenIds,
    activeSection,
    connected,
    connectionSpeed,
    isSnipeActive,
    liquidityDetected,
    stats,
    toggleSnipeActive,
    selectToken,
    executeSnipe,
    setActiveSection,
    connectWallet,
    disconnectWallet
  } = useApp();

  const selectedTokens = tokens.filter(token => selectedTokenIds.includes(token.id));

  // Change page title to match the app
  useEffect(() => {
    document.title = "Solana Sniper Bot";
  }, []);

  return (
    <Layout 
      connected={connected}
      onConnect={connectWallet}
      onDisconnect={disconnectWallet}
      connectionSpeed={connectionSpeed}
      activeSection={activeSection}
      onChangeSection={setActiveSection}
      stats={stats}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <SniperControl 
              onSnipe={executeSnipe}
              selectedTokens={selectedTokens}
              isActive={isSnipeActive}
              toggleActive={toggleSnipeActive}
            />
          </div>
          <div className="lg:col-span-2">
            <TokenAnalysis 
              tokens={tokens}
              onSelectToken={selectToken}
              selectedTokenIds={selectedTokenIds}
              liquidityDetected={liquidityDetected}
            />
          </div>
        </div>
        
        <div>
          <TransactionHistory transactions={transactions} />
        </div>
        
        {/* Terminal-style log display */}
        <div className="bg-black/80 border border-gray-800 rounded-lg p-3 font-mono text-xs text-green-500 h-32 overflow-y-auto terminal-scrollbar terminal-output">
          <div className="mb-1">[System] Solana Sniper Bot initialized</div>
          <div className="mb-1">[RPC] Connected to mainnet-beta endpoint (latency: {connectionSpeed}ms)</div>
          <div className="mb-1">[Config] Loaded user preferences</div>
          <div className="mb-1">[Scanner] Monitoring Raydium pools...</div>
          {isSnipeActive && (
            <>
              <div className="mb-1 text-solana-turquoise">[Sniper] ACTIVATED - Watching for new liquidity events</div>
              <div className="mb-1">[Memory] Allocated 256MB for high-speed operations</div>
              <div className="mb-1">[Status] Ready to execute trades in {Math.floor(connectionSpeed / 2)}ms</div>
            </>
          )}
          {liquidityDetected && (
            <div className="text-yellow-400">[ALERT] New liquidity detected for {liquidityDetected.symbol}!</div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default App;