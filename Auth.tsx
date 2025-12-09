import React, { useState, useContext } from 'react';
import { GameContext } from '../App';
import { User, Lock, Mail, Phone, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface AuthProps {
    isAdmin: boolean;
}

export const Auth: React.FC<AuthProps> = ({ isAdmin }) => {
    const context = useContext(GameContext);
    const [isLogin, setIsLogin] = useState(true);
    
    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [referral, setReferral] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) {
            context?.authActions.login(email, password, isAdmin);
        } else {
            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }
            context?.authActions.register(name, email, mobile, password, referral);
        }
    };

    // Force login mode for Admin
    if (isAdmin && !isLogin) setIsLogin(true);

    return (
        <div className={`min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden ${isAdmin ? 'bg-slate-950' : 'bg-slate-900'}`}>
             {/* Background Effects */}
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                 <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] ${isAdmin ? 'bg-red-900/10' : 'bg-indigo-600/20'}`}></div>
                 <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] ${isAdmin ? 'bg-orange-900/10' : 'bg-purple-600/20'}`}></div>
             </div>

            <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-700 shadow-2xl relative z-10 animate-fade-in">
                <div className="text-center mb-8">
                    {isAdmin ? (
                        <div className="w-16 h-16 bg-gradient-to-tr from-red-600 to-orange-600 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-red-500/30 mb-4">
                            <Lock className="text-white" size={32} />
                        </div>
                    ) : (
                        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
                            <span className="text-2xl font-bold text-white">CB</span>
                        </div>
                    )}
                    
                    <h1 className="text-2xl font-bold text-white mb-1">
                        {isAdmin ? 'Admin Portal' : (isLogin ? 'Welcome Back' : 'Create Account')}
                    </h1>
                    <p className="text-slate-400 text-sm">
                        {isAdmin ? 'Restricted Access Area' : (isLogin ? 'Enter your details to access your account' : 'Join the winning team today')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && !isAdmin && (
                        <>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Username" 
                                    required
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="tel" 
                                    placeholder="Mobile Number" 
                                    required
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                    value={mobile}
                                    onChange={e => setMobile(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            required
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Password" 
                            required
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-10 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {!isLogin && !isAdmin && (
                         <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="password" 
                                placeholder="Confirm Password" 
                                required
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    )}
                    
                    {!isLogin && !isAdmin && (
                         <div className="relative">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Referral Code (Optional)" 
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                value={referral}
                                onChange={e => setReferral(e.target.value)}
                            />
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className={`w-full text-white font-bold py-3.5 rounded-xl shadow-lg transition-all transform active:scale-95 ${isAdmin ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-red-500/30' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/30'}`}
                    >
                        {isLogin ? 'Login Now' : 'Create Account'}
                    </button>
                </form>
                
                {!isAdmin && (
                    <div className="mt-6 flex flex-col items-center gap-4">
                        <p className="text-slate-400 text-sm">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button 
                                onClick={() => setIsLogin(!isLogin)} 
                                className="text-indigo-400 hover:text-indigo-300 font-bold ml-1"
                            >
                                {isLogin ? 'Sign Up' : 'Login'}
                            </button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};