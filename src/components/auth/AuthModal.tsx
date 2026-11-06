// src/components/auth/AuthModal.tsx
// Enchanted Garden themed login & sign-up modal for Supabase Auth (Email + Google OAuth)
import React, { useState } from 'react';
import { Sparkles, Mail, Lock, X, LogIn, UserPlus, CheckCircle, AlertTriangle } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, isSupabaseConfigured } from '../../services/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        setSuccessMsg('Account created! Check your email for confirmation, or sign in now.');
        setIsSignUp(false);
      } else {
        await signInWithEmail(email, password);
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google sign-in failed.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B2252]/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#FFFDF9] rounded-[32px] border-2 border-[#EADBBF] shadow-storybook p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FAF5EE] hover:bg-[#F2E8D8] text-[#5C4033] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#E7DCFF] border-2 border-[#B196F5] flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-7 h-7 text-[#6C3FE0]" />
          </div>
          <h3 className="text-2xl font-display font-bold text-[#3B2252]">
            {isSignUp ? 'Create your Petal sanctuary' : 'Welcome back to Petal'}
          </h3>
          <p className="text-sm font-body text-[#6C538C]">
            {isSignUp
              ? 'Save notes, sync garden blooms, and access lectures from any device.'
              : 'Sign in to sync your study decks, visuals, and garden blooms.'}
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="p-3.5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] flex items-start gap-2 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
            <div>
              <strong>Supabase keys not detected in environment:</strong> Add <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to your <code className="bg-amber-100 px-1 rounded">.env</code> to enable live cloud sync.
            </div>
          </div>
        )}

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-[#FFF5F5] border border-[#FEB2B2] text-xs text-[#9B2C2C] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#C53030] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#065F46] flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-display font-bold uppercase tracking-wider text-[#855627]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#855627] absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#EADBBF] text-sm text-[#3B2252] placeholder-[#A89CAE] focus:outline-none focus:border-[#B196F5] shadow-2xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-display font-bold uppercase tracking-wider text-[#855627]">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#855627] absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#EADBBF] text-sm text-[#3B2252] placeholder-[#A89CAE] focus:outline-none focus:border-[#B196F5] shadow-2xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-storybook min-h-[44px] bg-[#6C3FE0] hover:bg-[#5B21B6] text-white font-display font-bold text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{loading ? 'Connecting...' : isSignUp ? 'Create Sanctuary Account' : 'Sign In to Petal'}</span>
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#EADBBF]/60" />
          <span className="text-xs font-display font-bold uppercase tracking-wider text-[#A89CAE]">Or</span>
          <div className="flex-1 h-px bg-[#EADBBF]/60" />
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full min-h-[44px] rounded-2xl bg-white hover:bg-[#FAF6F0] border border-[#EADBBF] text-[#3B2252] font-display font-bold text-sm flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Toggle Mode */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="text-xs font-display font-bold text-[#6C3FE0] hover:text-[#5B21B6] transition-colors cursor-pointer"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
};
