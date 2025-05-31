import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BotProvider } from './context/BotContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Discovery from './pages/Discovery';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';

function App() {
  return (
    <BotProvider>
      <Router>
        <div className="flex h-screen bg-gray-900 text-gray-100">
          <Sidebar />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/discovery" element={<Discovery />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/wallet" element={<h1 className="text-2xl font-bold p-6">Wallet (Coming Soon)</h1>} />
                <Route path="/notifications" element={<h1 className="text-2xl font-bold p-6">Notifications (Coming Soon)</h1>} />
                <Route path="*" element={<h1 className="text-2xl font-bold p-6">Page Not Found</h1>} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </BotProvider>
  );
}

export default App;