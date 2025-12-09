import React, { useContext, useState } from 'react';
import { GameContext } from '../App';
import { formatCurrency } from '../utils';
import { LayoutDashboard, Users, Gamepad2, CreditCard, History, Settings, Check, X, Search, Lock, Unlock } from 'lucide-react';
import { GameMode } from '../types';

type AdminPage = 'DASHBOARD' | 'USERS' | 'GAME_CONTROL' | 'TRANSACTIONS' | 'HISTORY' | 'SETTINGS';

// Move StatCard outside to prevent re-mounting and flickering
const StatCard = ({ title, value, sub, color }: any) => (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="text-slate-400 text-sm font-bold uppercase">{title}</h3>
        <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
);

export const AdminPanel: React.FC = () => {
    const [page, setPage] = useState<AdminPage>('DASHBOARD');

    const SidebarItem = ({ p, icon: Icon, label }: { p: AdminPage, icon: any, label: string }) => (
        <button 
            onClick={() => setPage(p)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${page === p ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] gap-6">
            {/* Sidebar */}
            <aside className="hidden md:block w-64 bg-slate-800 rounded-xl p-4 h-fit sticky top-24 border border-slate-700">
                <div className="space-y-2">
                    <SidebarItem p="DASHBOARD" icon={LayoutDashboard} label="Dashboard" />
                    <SidebarItem p="USERS" icon={Users} label="Users" />
                    <SidebarItem p="GAME_CONTROL" icon={Gamepad2} label="Game Control" />
                    <SidebarItem p="TRANSACTIONS" icon={CreditCard} label="Transactions" />
                    <SidebarItem p="HISTORY" icon={History} label="History" />
                    <SidebarItem p="SETTINGS" icon={Settings} label="Settings" />
                </div>
            </aside>

            {/* Mobile Nav for Admin */}
            <div className="md:hidden flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
                {['DASHBOARD', 'USERS', 'GAME_CONTROL', 'TRANSACTIONS', 'HISTORY', 'SETTINGS'].map(p => (
                    <button 
                        key={p}
                        onClick={() => setPage(p as AdminPage)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${page === p ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                        {p.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-slate-900 rounded-xl">
                {page === 'DASHBOARD' && <AdminDashboard />}
                {page === 'USERS' && <AdminUsers />}
                {page === 'GAME_CONTROL' && <AdminGameControl />}
                {page === 'TRANSACTIONS' && <AdminTransactions />}
                {page === 'HISTORY' && <AdminHistory />}
                {page === 'SETTINGS' && <AdminSettings />}
            </div>
        </div>
    );
};

// --- Sub Components ---

const AdminDashboard = () => {
    const { users, bets, transactions, games } = useContext(GameContext)!;
    const totalDeposits = transactions.filter(t => t.type === 'DEPOSIT' && t.status === 'APPROVED').reduce((acc, t) => acc + t.amount, 0);
    const totalWithdrawals = transactions.filter(t => t.type === 'WITHDRAWAL' && t.status === 'APPROVED').reduce((acc, t) => acc + t.amount, 0);
    const activeBetsAmount = bets.filter(b => b.status === 'PENDING').reduce((acc, b) => acc + b.amount, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6">Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Users" value={users.length} color="text-white" />
                <StatCard title="Total Revenue" value={formatCurrency(totalDeposits - totalWithdrawals)} color="text-emerald-400" />
                <StatCard title="Live Bets" value={formatCurrency(activeBetsAmount)} sub="Across all modes" color="text-indigo-400" />
                <StatCard title="Pending Withdrawals" value={transactions.filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING').length} color="text-yellow-400" />
            </div>
        </div>
    );
};

const AdminUsers = () => {
    const { users, adminActions } = useContext(GameContext)!;
    const [search, setSearch] = useState('');

    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.mobile.includes(search) || u.uid.includes(search));

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Users Management</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search UID, Name, Mobile..." 
                        className="bg-slate-800 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-700/50 text-slate-300">
                            <tr>
                                <th className="p-4">User Details</th>
                                <th className="p-4">Balance</th>
                                <th className="p-4">Stats</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredUsers.map(u => (
                                <tr key={u.id} className="hover:bg-slate-700/20">
                                    <td className="p-4">
                                        <p className="font-bold text-white">{u.name} <span className="text-xs text-indigo-400 font-mono">({u.uid})</span></p>
                                        <p className="text-xs text-slate-400">{u.mobile} | {u.email}</p>
                                    </td>
                                    <td className="p-4 font-mono text-emerald-400">{formatCurrency(u.balance)}</td>
                                    <td className="p-4 text-xs text-slate-400">
                                        Bets: {u.totalBets} | W: {u.totalWins}
                                    </td>
                                    <td className="p-4 flex justify-end gap-2">
                                        <button 
                                            onClick={() => {
                                                const amt = prompt("Enter new balance:", u.balance.toString());
                                                if (amt) adminActions.updateBalance(u.id, parseFloat(amt));
                                            }}
                                            className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded hover:bg-indigo-500 hover:text-white transition-colors"
                                        >
                                            Edit Bal
                                        </button>
                                        <button 
                                            onClick={() => adminActions.toggleBlockUser(u.id)}
                                            className={`p-2 rounded hover:bg-slate-600 transition-colors ${u.isBlocked ? 'text-red-400' : 'text-slate-400'}`}
                                        >
                                            {u.isBlocked ? <Lock size={16} /> : <Unlock size={16} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const AdminGameControl = () => {
    const { games, bets, adminActions } = useContext(GameContext)!;
    const [mode, setMode] = useState<GameMode>('FAST');
    
    const gameState = games[mode];
    
    // Calculate live bet distribution
    const modeBets = bets.filter(b => b.gameMode === mode && b.periodId === gameState.currentPeriodId);
    const betsOnRed = modeBets.filter(b => b.type === 'COLOR' && b.choice === 'red').reduce((a,b) => a + b.amount, 0);
    const betsOnGreen = modeBets.filter(b => b.type === 'COLOR' && b.choice === 'green').reduce((a,b) => a + b.amount, 0);
    const betsOnViolet = modeBets.filter(b => b.type === 'COLOR' && b.choice === 'violet').reduce((a,b) => a + b.amount, 0);

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex space-x-2">
                <button onClick={() => setMode('FAST')} className={`px-4 py-2 rounded-lg font-bold ${mode === 'FAST' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>FAST (30s)</button>
                <button onClick={() => setMode('STD')} className={`px-4 py-2 rounded-lg font-bold ${mode === 'STD' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>STD (1m)</button>
                <button onClick={() => setMode('PRO')} className={`px-4 py-2 rounded-lg font-bold ${mode === 'PRO' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>PRO (3m)</button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Live Monitor */}
                 <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                     <div className="flex justify-between items-center mb-6">
                         <h3 className="font-bold text-white">Live Period: {gameState.currentPeriodId}</h3>
                         <span className="bg-indigo-600 px-3 py-1 rounded text-xs font-bold text-white">{gameState.timeLeft}s</span>
                     </div>
                     <div className="space-y-4">
                         <div>
                             <div className="flex justify-between text-sm mb-1">
                                 <span className="text-rose-400">Red</span>
                                 <span className="text-white">{formatCurrency(betsOnRed)}</span>
                             </div>
                             <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                 <div className="h-full bg-rose-500" style={{width: `${(betsOnRed / (betsOnRed + betsOnGreen + betsOnViolet + 1)) * 100}%`}}></div>
                             </div>
                         </div>
                         <div>
                             <div className="flex justify-between text-sm mb-1">
                                 <span className="text-emerald-400">Green</span>
                                 <span className="text-white">{formatCurrency(betsOnGreen)}</span>
                             </div>
                             <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                 <div className="h-full bg-emerald-500" style={{width: `${(betsOnGreen / (betsOnRed + betsOnGreen + betsOnViolet + 1)) * 100}%`}}></div>
                             </div>
                         </div>
                         <div>
                             <div className="flex justify-between text-sm mb-1">
                                 <span className="text-violet-400">Violet</span>
                                 <span className="text-white">{formatCurrency(betsOnViolet)}</span>
                             </div>
                             <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                 <div className="h-full bg-violet-500" style={{width: `${(betsOnViolet / (betsOnRed + betsOnGreen + betsOnViolet + 1)) * 100}%`}}></div>
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* Control */}
                 <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                     <h3 className="font-bold text-white mb-4">Set Next Result for {mode}</h3>
                     <p className="text-xs text-slate-400 mb-4">Click a number to force the result for the current period. This overrides random generation.</p>
                     <div className="grid grid-cols-5 gap-2">
                         {[0,1,2,3,4,5,6,7,8,9].map(n => (
                             <button 
                                key={n}
                                onClick={() => {
                                    adminActions.setNextResult(mode, n);
                                    alert(`Result set to ${n} for next ${mode} round!`);
                                }}
                                className="aspect-square bg-slate-700 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors"
                            >
                                {n}
                            </button>
                         ))}
                     </div>
                 </div>
             </div>
        </div>
    );
};

const AdminTransactions = () => {
    const { transactions, adminActions } = useContext(GameContext)!;
    const [filter, setFilter] = useState<'ALL' | 'PENDING'>('PENDING');

    const displayTx = filter === 'ALL' ? transactions : transactions.filter(t => t.status === 'PENDING');

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex gap-4 mb-4">
                 <button onClick={() => setFilter('PENDING')} className={`px-4 py-2 rounded-lg text-sm font-bold ${filter === 'PENDING' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Pending Requests</button>
                 <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-lg text-sm font-bold ${filter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>All History</button>
             </div>

             <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-700/50 text-slate-300">
                        <tr>
                            <th className="p-4">User</th>
                            <th className="p-4">Details</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {displayTx.map(t => (
                            <tr key={t.id}>
                                <td className="p-4 font-bold text-white">{t.userName}</td>
                                <td className="p-4">
                                    <span className={`font-bold block ${t.type === 'DEPOSIT' ? 'text-emerald-400' : 'text-orange-400'}`}>{t.type}</span>
                                    {t.type === 'DEPOSIT' ? (
                                        <span className="text-xs text-slate-400">UTR: {t.utr}</span>
                                    ) : (
                                        <div className="text-xs text-slate-400">
                                            {t.method} <br/>
                                            {t.details && Object.entries(JSON.parse(t.details)).map(([k,v]) => (
                                                <span key={k} className="block text-[10px] text-slate-500">{k}: {v as string}</span>
                                            ))}
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 font-mono">{formatCurrency(t.amount)}</td>
                                <td className="p-4">
                                    <span className={`text-[10px] px-2 py-1 rounded ${
                                        t.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                                        t.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                                        'bg-yellow-500/10 text-yellow-400'
                                    }`}>
                                        {t.status}
                                    </span>
                                </td>
                                <td className="p-4 flex justify-end gap-2">
                                    {t.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => adminActions.processTransaction(t.id, true)} className="p-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500 hover:text-white"><Check size={16} /></button>
                                            <button onClick={() => adminActions.processTransaction(t.id, false)} className="p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500 hover:text-white"><X size={16} /></button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
    );
};

const AdminHistory = () => {
    const { games } = useContext(GameContext)!;
    const [mode, setMode] = useState<GameMode>('FAST');

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Game History</h2>
                <div className="flex space-x-2">
                    <button onClick={() => setMode('FAST')} className={`px-2 py-1 rounded text-xs font-bold ${mode === 'FAST' ? 'bg-indigo-600' : 'bg-slate-700'}`}>FAST</button>
                    <button onClick={() => setMode('STD')} className={`px-2 py-1 rounded text-xs font-bold ${mode === 'STD' ? 'bg-indigo-600' : 'bg-slate-700'}`}>STD</button>
                    <button onClick={() => setMode('PRO')} className={`px-2 py-1 rounded text-xs font-bold ${mode === 'PRO' ? 'bg-indigo-600' : 'bg-slate-700'}`}>PRO</button>
                </div>
             </div>

            <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                <table className="w-full text-sm">
                    <thead className="bg-slate-700/50 text-slate-300">
                        <tr>
                            <th className="p-3 text-left">Period</th>
                            <th className="p-3">Result</th>
                            <th className="p-3 text-right">Colors</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {games[mode].history.map(g => (
                            <tr key={g.periodId}>
                                <td className="p-3 text-slate-300">{g.periodId}</td>
                                <td className="p-3 text-center font-bold text-white">{g.resultNumber}</td>
                                <td className="p-3 flex justify-end">
                                    <div className="flex gap-1">
                                        {g.resultColor?.map(c => (
                                            <div key={c} className={`w-4 h-4 rounded-full bg-${c === 'violet' ? 'violet' : c === 'green' ? 'emerald' : 'rose'}-500`}></div>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AdminSettings = () => {
    const { settings } = useContext(GameContext)!;
    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white">Platform Settings</h2>
            <div className="grid gap-4">
                 <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                     <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Color Win Multiplier</label>
                     <input type="number" value={settings.winRatioColor} disabled className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
                 </div>
                 <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                     <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Number Win Multiplier</label>
                     <input type="number" value={settings.winRatioNumber} disabled className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
                 </div>
            </div>
            <p className="text-xs text-slate-500 italic">* Settings are read-only in this demo version.</p>
        </div>
    );
};