import React, { useState, useEffect, useCallback, createContext } from 'react';
import { User, Bet, Transaction, AppState, BetChoice, TransactionType, GameMode, GameState, GamePeriod } from './types';
import { Layout } from './components/Layout';
import { UserPanel } from './components/UserPanel';
import { AdminPanel } from './components/AdminPanel';
import { Auth } from './components/Auth';
import { calculateResultColors, generatePeriodId, generateUID } from './utils';

// --- Initial Data ---
const ADMIN_USER: User = { 
    id: 'admin1', uid: 'ADMIN01', name: 'Master Admin', email: 'admin@colorbet.com', password: 'admin', mobile: '0000000000', 
    balance: 0, promoCode: 'ADMIN', role: 'ADMIN', isBlocked: false, totalBets: 0, totalWins: 0, totalLoss: 0 
};

// --- Game Configurations ---
const GAME_CONFIGS: Record<GameMode, number> = {
    FAST: 30,
    STD: 60,
    PRO: 180
};

const INITIAL_GAME_STATE = (mode: GameMode): GameState => ({
    currentPeriodId: generatePeriodId(mode),
    timeLeft: GAME_CONFIGS[mode],
    history: [],
    status: 'ACTIVE'
});

const INITIAL_STATE: AppState = {
    view: 'USER_AUTH', // Default to User Auth
    currentUser: null,
    users: [ADMIN_USER],
    bets: [],
    transactions: [],
    games: {
        FAST: INITIAL_GAME_STATE('FAST'),
        STD: INITIAL_GAME_STATE('STD'),
        PRO: INITIAL_GAME_STATE('PRO')
    },
    settings: {
        minBet: 10,
        winRatioColor: 1.96,
        winRatioNumber: 8.8,
    }
};

interface GameContextType extends AppState {
    authActions: {
        login: (e: string, p: string, isAdmin: boolean) => void;
        register: (n: string, e: string, m: string, p: string, r: string) => void;
        logout: () => void;
    };
    gameActions: {
        placeBet: (mode: GameMode, amount: number, choice: BetChoice, type: 'COLOR' | 'NUMBER') => void;
    };
    adminActions: {
        updateBalance: (userId: string, amount: number) => void;
        toggleBlockUser: (userId: string) => void;
        setNextResult: (mode: GameMode, number: number) => void;
        processTransaction: (id: string, approve: boolean) => void;
    };
    userActions: {
        requestDeposit: (amount: number, utr: string) => void;
        requestWithdraw: (amount: number, method: 'UPI'|'BANK', details: any) => void;
    };
}

export const GameContext = createContext<GameContextType | null>(null);

export default function App() {
    const [state, setState] = useState<AppState>(INITIAL_STATE);
    const [manualResults, setManualResults] = useState<Record<GameMode, number | null>>({ FAST: null, STD: null, PRO: null });

    // --- Hash Routing Logic ---
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash === '#admin') {
                if (state.currentUser?.role === 'ADMIN') {
                    setState(prev => ({ ...prev, view: 'ADMIN_APP' }));
                } else {
                    setState(prev => ({ ...prev, view: 'ADMIN_AUTH' }));
                }
            } else {
                if (state.currentUser?.role === 'USER') {
                    setState(prev => ({ ...prev, view: 'USER_APP' }));
                } else {
                    setState(prev => ({ ...prev, view: 'USER_AUTH' }));
                }
            }
        };

        // Initial check
        handleHashChange();

        // Listen for changes
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [state.currentUser]);

    // --- Core Game Loop ---
    useEffect(() => {
        const interval = setInterval(() => {
            setState(prev => {
                const newGames = { ...prev.games };
                let stateChanged = false;
                const completedModes: GameMode[] = [];

                (['FAST', 'STD', 'PRO'] as GameMode[]).forEach(mode => {
                    if (newGames[mode].timeLeft <= 1) {
                        completedModes.push(mode);
                        stateChanged = true;
                    } else {
                        newGames[mode] = { ...newGames[mode], timeLeft: newGames[mode].timeLeft - 1 };
                        stateChanged = true;
                    }
                });

                if (completedModes.length > 0) {
                     return processGameCompletion(prev, completedModes);
                }

                return stateChanged ? { ...prev, games: newGames } : prev;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [manualResults]);

    const processGameCompletion = (currentState: AppState, modes: GameMode[]): AppState => {
        let newState = { ...currentState };
        
        modes.forEach(mode => {
            // 1. Determine Result
            const winningNumber = manualResults[mode] !== null ? manualResults[mode]! : Math.floor(Math.random() * 10);
            const winningColors = calculateResultColors(winningNumber);
            
            // Clear manual result
            if (manualResults[mode] !== null) {
                setManualResults(p => ({...p, [mode]: null}));
            }

            const currentPeriodId = newState.games[mode].currentPeriodId;
            const finishedPeriod: GamePeriod = {
                periodId: currentPeriodId,
                resultNumber: winningNumber,
                resultColor: winningColors
            };

            // 2. Settle Bets
            const updatedBets = newState.bets.map(bet => {
                if (bet.gameMode === mode && bet.periodId === currentPeriodId && bet.status === 'PENDING') {
                    let isWin = false;
                    if (bet.type === 'NUMBER' && bet.choice === winningNumber) isWin = true;
                    if (bet.type === 'COLOR' && winningColors.includes(bet.choice as string)) isWin = true;

                    const winAmount = isWin 
                        ? bet.amount * (bet.type === 'NUMBER' ? newState.settings.winRatioNumber : newState.settings.winRatioColor) 
                        : 0;
                    
                    return { ...bet, status: isWin ? 'WIN' : 'LOSS', winAmount: Math.floor(winAmount) } as Bet;
                }
                return bet;
            });

            // 3. Update User Balances
            const updatedUsers = newState.users.map(u => {
                const userBets = updatedBets.filter(b => b.userId === u.id && b.gameMode === mode && b.periodId === currentPeriodId && b.status !== 'PENDING' && newState.bets.find(oldB => oldB.id === b.id)?.status === 'PENDING');
                const totalWinnings = userBets.reduce((acc, b) => acc + (b.winAmount || 0), 0);
                
                if (userBets.length > 0) {
                    return { 
                        ...u, 
                        balance: u.balance + totalWinnings,
                        totalWins: u.totalWins + userBets.filter(b => b.status === 'WIN').length,
                        totalLoss: u.totalLoss + userBets.filter(b => b.status === 'LOSS').length
                    };
                }
                return u;
            });

            // 4. Update Game State
            newState = {
                ...newState,
                users: updatedUsers,
                bets: updatedBets,
                games: {
                    ...newState.games,
                    [mode]: {
                        currentPeriodId: generatePeriodId(mode),
                        timeLeft: GAME_CONFIGS[mode],
                        history: [finishedPeriod, ...newState.games[mode].history].slice(0, 50),
                        status: 'ACTIVE'
                    }
                }
            };
        });

        if (newState.currentUser) {
            newState.currentUser = newState.users.find(u => u.id === newState.currentUser!.id) || null;
        }

        return newState;
    };


    // --- Actions ---

    const authActions = {
        login: (email: string, pass: string, isAdmin: boolean) => {
            const user = state.users.find(u => u.email === email && u.password === pass);
            if (!user) {
                alert("Invalid Credentials");
                return;
            }
            if (user.isBlocked) {
                alert("Account Blocked. Contact Support.");
                return;
            }
            if (isAdmin) {
                if(user.role !== 'ADMIN') {
                     alert("Access Denied. Not an Admin.");
                     return;
                }
                setState(prev => ({ ...prev, currentUser: user, view: 'ADMIN_APP' }));
            } else {
                 if(user.role === 'ADMIN') {
                     alert("Admins must login via Admin Portal.");
                     return;
                 }
                setState(prev => ({ ...prev, currentUser: user, view: 'USER_APP' }));
            }
        },
        register: (name: string, email: string, mobile: string, pass: string, referral: string) => {
            if (state.users.find(u => u.email === email)) {
                alert("Email already exists");
                return;
            }
            const newUser: User = {
                id: Math.random().toString(36).substr(2, 9),
                uid: generateUID(),
                name, email, mobile, password: pass,
                balance: 0,
                promoCode: generateUID(),
                role: 'USER',
                isBlocked: false,
                totalBets: 0, totalWins: 0, totalLoss: 0
            };
            setState(prev => ({ ...prev, users: [...prev.users, newUser], currentUser: newUser, view: 'USER_APP' }));
        },
        logout: () => {
            const isAtAdminUrl = window.location.hash === '#admin';
            setState(prev => ({ ...prev, currentUser: null, view: isAtAdminUrl ? 'ADMIN_AUTH' : 'USER_AUTH' }));
        }
    };

    const gameActions = {
        placeBet: (mode: GameMode, amount: number, choice: BetChoice, type: 'COLOR' | 'NUMBER') => {
            if (!state.currentUser) return;
            if (state.games[mode].timeLeft <= 5) {
                alert("Period is locked!");
                return;
            }
            if (state.currentUser.balance < amount) {
                alert("Insufficient Balance");
                return;
            }

            const newBet: Bet = {
                id: Math.random().toString(36).substr(2, 9),
                userId: state.currentUser.id,
                gameMode: mode,
                periodId: state.games[mode].currentPeriodId,
                amount,
                type,
                choice,
                status: 'PENDING',
                winAmount: 0,
                timestamp: Date.now()
            };

            setState(prev => ({
                ...prev,
                bets: [newBet, ...prev.bets],
                users: prev.users.map(u => u.id === prev.currentUser!.id ? { ...u, balance: u.balance - amount, totalBets: u.totalBets + 1 } : u),
                currentUser: { ...prev.currentUser!, balance: prev.currentUser!.balance - amount, totalBets: prev.currentUser!.totalBets + 1 }
            }));
        }
    };

    const userActions = {
        requestDeposit: (amount: number, utr: string) => {
            if (!state.currentUser) return;
            const tx: Transaction = {
                id: Math.random().toString(36).substr(2, 9),
                userId: state.currentUser.id,
                userName: state.currentUser.name,
                type: 'DEPOSIT',
                amount,
                status: 'PENDING',
                date: new Date().toISOString(),
                utr
            };
            setState(prev => ({ ...prev, transactions: [tx, ...prev.transactions] }));
        },
        requestWithdraw: (amount: number, method: 'UPI'|'BANK', details: any) => {
            if (!state.currentUser) return;
            if (state.currentUser.balance < amount) {
                alert("Insufficient Balance");
                return;
            }
            const tx: Transaction = {
                id: Math.random().toString(36).substr(2, 9),
                userId: state.currentUser.id,
                userName: state.currentUser.name,
                type: 'WITHDRAWAL',
                amount,
                status: 'PENDING',
                date: new Date().toISOString(),
                method,
                details: JSON.stringify(details)
            };
            setState(prev => ({ 
                ...prev, 
                transactions: [tx, ...prev.transactions],
                users: prev.users.map(u => u.id === prev.currentUser!.id ? { ...u, balance: u.balance - amount } : u),
                currentUser: { ...prev.currentUser!, balance: prev.currentUser!.balance - amount }
            }));
        }
    };

    const adminActions = {
        updateBalance: (userId: string, amount: number) => {
            setState(prev => ({
                ...prev,
                users: prev.users.map(u => u.id === userId ? { ...u, balance: amount } : u)
            }));
        },
        toggleBlockUser: (userId: string) => {
            setState(prev => ({
                ...prev,
                users: prev.users.map(u => u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u)
            }));
        },
        setNextResult: (mode: GameMode, number: number) => {
            setManualResults(prev => ({ ...prev, [mode]: number }));
        },
        processTransaction: (id: string, approve: boolean) => {
            setState(prev => {
                const tx = prev.transactions.find(t => t.id === id);
                if (!tx || tx.status !== 'PENDING') return prev;

                const newStatus = approve ? 'APPROVED' : 'REJECTED';
                let updatedUsers = [...prev.users];

                if (tx.type === 'DEPOSIT' && approve) {
                    updatedUsers = updatedUsers.map(u => u.id === tx.userId ? { ...u, balance: u.balance + tx.amount } : u);
                } else if (tx.type === 'WITHDRAWAL' && !approve) {
                    updatedUsers = updatedUsers.map(u => u.id === tx.userId ? { ...u, balance: u.balance + tx.amount } : u);
                }

                const currentUser = updatedUsers.find(u => u.id === prev.currentUser?.id) || prev.currentUser;

                return {
                    ...prev,
                    users: updatedUsers,
                    currentUser,
                    transactions: prev.transactions.map(t => t.id === id ? { ...t, status: newStatus } : t)
                };
            });
        }
    };

    return (
        <GameContext.Provider value={{ ...state, authActions, gameActions, userActions, adminActions }}>
            {state.view === 'USER_AUTH' && <Auth isAdmin={false} />}
            {state.view === 'ADMIN_AUTH' && <Auth isAdmin={true} />}
            
            {state.view === 'USER_APP' && (
                <Layout>
                    <UserPanel />
                </Layout>
            )}
            
            {state.view === 'ADMIN_APP' && (
                <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4">
                     {/* Admin Header embedded directly for distinct look */}
                     <header className="flex justify-between items-center mb-6 bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <h1 className="text-xl font-bold text-indigo-400">Admin Console</h1>
                        <button onClick={() => authActions.logout()} className="text-sm text-red-400 font-bold hover:underline">Logout</button>
                     </header>
                    <AdminPanel />
                </div>
            )}
        </GameContext.Provider>
    );
}