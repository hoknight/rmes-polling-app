import React, { useState, useEffect } from 'react';
import { Home } from './views/Home';
import { Success } from './views/Success';
import { Stats } from './views/Stats';
import { Admin } from './views/Admin';
import { Page } from './types';
import { getTitle } from './services/storage';

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
            className="flex items-center gap-3 font-bold text-xl tracking-tight cursor-pointer text-slate-800 hover:text-indigo-600 transition-colors" 
            onClick={() => setCurrentPage('home')}
          >
             <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-indigo-200 shadow-lg">
               📊
             </div>
             <span>{appTitle}</span>
          </div>
          <button 
            onClick={() => setCurrentPage('admin')}
            className="text-sm font-medium text-slate-500 hover:text-indigo-600 bg-slate-100/50 hover:bg-white px-4 py-2 rounded-full transition-all duration-200"
          >
            管理員
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