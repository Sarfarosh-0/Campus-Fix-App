import React, { useState } from 'react';
import { Shield, User, Mail, Lock, CheckCircle2, AlertTriangle, Sparkles, LogIn, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (email: string, role: 'reporter' | 'authority') => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [role, setRole] = useState<'reporter' | 'authority'>('authority');
  const [email, setEmail] = useState('authority@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Synchronize prefilled credentials when the role tab is changed
  const handleRoleChange = (selectedRole: 'reporter' | 'authority') => {
    setRole(selectedRole);
    setError(null);
    setSuccessMsg(null);
    if (selectedRole === 'reporter') {
      setEmail('reporter@example.com');
    } else {
      setEmail('authority@example.com');
    }
    setPassword('password123');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Authentication failed.');
      }

      const userData = await response.json();
      setSuccessMsg(`Welcome back! Authenticating secure ${userData.role === 'authority' ? 'Authority' : 'Reporter'} session...`);
      
      setTimeout(() => {
        onLoginSuccess(userData.email, userData.role);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Server connection failed. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccessMsg(`Initiating Google OAuth handshake...`);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: role === 'authority' ? 'authority@example.com' : 'reporter@example.com',
          password: 'password123'
        }),
      });

      if (!response.ok) {
        throw new Error('OAuth bypass failed.');
      }

      const userData = await response.json();
      setSuccessMsg(`Google OAuth successful! Simulating secure ${userData.role === 'authority' ? 'Authority' : 'Reporter'} entry...`);
      
      setTimeout(() => {
        onLoginSuccess(userData.email, userData.role);
      }, 700);
    } catch (err: any) {
      setError('Google OAuth Simulation failed. Try manual login.');
    }
  };

  const handleForgotPassword = () => {
    setError(null);
    setSuccessMsg('A password reset link has been broadcasted to your registered address.');
  };

  return (
    <div className="relative w-full min-h-[580px] flex items-center justify-center p-4 sm:p-6 select-none overflow-hidden rounded-3xl">
      {/* Ambient background blur circles */}
      <div className="absolute top-[10%] left-[10%] w-60 h-60 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[10%] right-[10%] w-72 h-72 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none"></div>

      {/* Glassmorphic Container Card */}
      <div className="w-full max-w-md glass-panel rounded-card p-6 sm:p-10 border border-white/25 dark:border-white/5 shadow-2xl relative z-10 backdrop-blur-xl">
        
        {/* Decorative Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 dark:bg-slate-900/40 border border-white/20 dark:border-white/5 text-[10px] tracking-widest uppercase font-bold text-purple-500 dark:text-purple-400 backdrop-blur-sm shadow-sm">
            <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
            <span>Campus Triage Station</span>
          </div>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-ink-primary tracking-tight select-none">
            Campus<span className="text-purple-500">Fix</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1.5 tracking-wide font-medium">
            Unified Infrastructure Management & Triage Portal
          </p>
        </div>

        {/* Dynamic State Feedback */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-btn bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5 animate-pulse backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-btn bg-critical-red/10 border border-critical-red/20 text-critical-red text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-critical-red" />
            <span>{error}</span>
          </div>
        )}

        {/* Role Selector Segment Switcher */}
        <div className="mb-6">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-2 text-center">
            Select Workspace Panel
          </label>
          <div className="grid grid-cols-2 bg-black/5 dark:bg-white/5 p-1 rounded-badge border border-white/10 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => handleRoleChange('authority')}
              className={`py-2 rounded-badge text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                role === 'authority'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-text-secondary hover:text-ink-primary'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Authority</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('reporter')}
              className={`py-2 rounded-badge text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                role === 'reporter'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-text-secondary hover:text-ink-primary'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Reporter</span>
            </button>
          </div>
        </div>

        {/* Interactive Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <input
                id="login-email"
                type="email"
                placeholder={role === 'authority' ? 'authority@example.com' : 'reporter@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-white/10 dark:bg-slate-900/20 border border-white/20 dark:border-white/5 rounded-btn text-sm pl-10 text-ink-primary focus:outline-none focus:border-purple-500/60 transition duration-300 backdrop-blur-sm font-medium"
              />
              <Mail className="w-4 h-4 text-text-secondary absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Password</label>
              <button 
                type="button" 
                onClick={handleForgotPassword}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-white/10 dark:bg-slate-900/20 border border-white/20 dark:border-white/5 rounded-btn text-sm pl-10 pr-10 text-ink-primary focus:outline-none focus:border-purple-500/60 transition duration-300 backdrop-blur-sm font-medium"
              />
              <Lock className="w-4 h-4 text-text-secondary absolute left-3 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-text-secondary hover:text-ink-primary focus:outline-none cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-btn shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer text-sm flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Secure Log In</span>
          </button>

          {/* Minimal Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/10 dark:border-white/5"></div>
            <span className="flex-shrink mx-3 text-text-secondary text-[9px] font-bold tracking-widest uppercase">or Login with</span>
            <div className="flex-grow border-t border-white/10 dark:border-white/5"></div>
          </div>

          {/* Social Sign-In (Instant Google Login Bypass) */}
          <button
            id="login-google"
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 bg-white/20 dark:bg-slate-900/20 hover:bg-white/30 dark:hover:bg-slate-900/40 border border-white/20 dark:border-white/5 text-ink-primary font-bold rounded-btn transition-all duration-300 cursor-pointer text-sm flex items-center justify-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.28 1.5-1.11 2.76-2.39 3.62v3h3.86c2.26-2.09 3.56-5.14 3.56-8.45z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.86-3c-1.08.72-2.45 1.16-4.1 1.16-3.15 0-5.81-2.13-6.76-5.01H1.31v3.1C3.29 21.26 7.37 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.24 14.24a7.15 7.15 0 0 1 0-4.48V6.66H1.31a12.01 12.01 0 0 0 0 10.68l3.93-3.1z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.96 1.19 15.24 0 12 0 7.37 0 3.29 2.74 1.31 6.66l3.93 3.1c.95-2.88 3.61-5.01 6.76-5.01z"
              />
            </svg>
            <span>Log In with Google</span>
          </button>
        </form>
      </div>
    </div>
  );
}
