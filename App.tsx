import React, { useState, useEffect } from 'react';
import { Home } from './views/Home';
import { Success } from './views/Success';
import { Stats } from './views/Stats';
import { Admin } from './views/Admin';
import { Page } from './types';
import { getTitle } from './services/storage';
import { Lock, BarChart3 } from 'lucide-react';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [appTitle, setAppTitle] = useState('');

  const refreshTitle = () => {
    setAppTitle(getTitle());
  };

  useEffect(() => {
    refreshTitle();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home setPage={setCurrentPage} />;
      case 'success':
        return <Success setPage={setCurrentPage} />;
      case 'stats':
        return <Stats setPage={setCurrentPage} />;
      case 'admin':
        return <Admin setPage={setCurrentPage} onUpdate={refreshTitle} />;
      default:
        return <Home setPage={setCurrentPage} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-cyan-50 text-slate-800 font-sans overflow-hidden selection:bg-indigo-100 selection:text-indigo-700">
      {/* Header - Modern Glassmorphism */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm shrink-0">
        <div className="w-full px-6 h-16 flex items-center justify-between max-w-7xl mx-auto">
          <div 
            className="flex items-center gap-3 font-bold text-xl tracking-tight cursor-pointer text-slate-800 hover:text-indigo-600 transition-colors group" 
            onClick={() => setCurrentPage('home')}
          >
             <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-indigo-200 shadow-lg group-hover:scale-105 transition-transform">
               <BarChart3 className="w-5 h-5" />
             </div>
             <span>{appTitle}</span>
          </div>
          <button 
            onClick={() => setCurrentPage('admin')}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 bg-white/80 hover:bg-white border border-slate-200 hover:border-indigo-200 px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Lock className="w-4 h-4" />
            <span>管理員登入</span>
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto relative flex flex-col w-full scroll-smooth">
        {renderPage()}
      </main>

      {/* Footer */}
      {currentPage !== 'stats' && (
        <footer className="py-4 text-center text-slate-400 text-xs shrink-0">
          <p className="font-medium opacity-60">© 2026 RMES. All rights reserved.</p>
        </footer>
      )}
       {currentPage === 'stats' && (
        <footer className="py-1 text-center text-slate-400 text-[10px] shrink-0 bg-white/50 backdrop-blur">
          <p>© 2026 RMES. All rights reserved.</p>
        </footer>
      )}
    </div>
  );
};

export default App;