import React, { useContext } from 'react';
import { GameContext } from '../App';
import { LogOut } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const context = useContext(GameContext);
  
  if (!context) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-20 md:pb-0 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-800/80 backdrop-blur-md border-b border-slate-700 flex items-center justify-between px-4 z-50">
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
                CB
            </div>
            <h1 className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                ColorBet<span className="text-indigo-400">Pro</span>
            </h1>
        </div>
        
        <div className="flex items-center space-x-3">
             <div className="text-right hidden sm:block">
                 <p className="text-xs text-slate-400">Welcome,</p>
                 <p className="text-sm font-bold text-white">{context.currentUser?.name}</p>
             </div>
            <span className={`px-2 py-1 rounded text-xs font-bold border ${context.currentUser?.role === 'ADMIN' ? 'border-red-500 text-red-400 bg-red-500/10' : 'border-emerald-500 text-emerald-400 bg-emerald-500/10'}`}>
                {context.currentUser?.role}
            </span>
            <button 
                onClick={() => context.authActions.logout()}
                className="bg-slate-700 hover:bg-red-500/20 hover:text-red-400 p-2 rounded-full transition-colors"
                title="Logout"
            >
                <LogOut size={16} />
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-4 max-w-7xl mx-auto min-h-screen">
        {children}
      </main>
    </div>
  );
};