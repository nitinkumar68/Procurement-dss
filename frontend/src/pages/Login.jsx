import React, { useState } from 'react';
import { Shield, ArrowRight, Mail, Lock, Eye, EyeOff, Loader, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ── Microsoft SSO only ────────────────────────────────────────────────────────
const MICROSOFT_PROVIDER = {
  id: 'microsoft', label: 'Continue with Microsoft',
  icon: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
      <rect x="1"  y="1"  width="10" height="10" fill="#F25022"/>
      <rect x="13" y="1"  width="10" height="10" fill="#7FBA00"/>
      <rect x="1"  y="13" width="10" height="10" fill="#00A4EF"/>
      <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
    </svg>
  ),
  mockUser: () => ({ name: 'Microsoft User', email: 'user@outlook.com', provider: 'Microsoft', avatar: 'M' }),
};

function simulateSSO(provider) {
  return new Promise(resolve => setTimeout(() => resolve(provider.mockUser()), 1800));
}

export default function Login({ onAuthSuccess }) {
  const { signIn } = useAuth();
  const [mode, setMode]               = useState('main');
  const [ssoLoading, setSsoLoading]   = useState(false);
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError]             = useState('');

  const handleMicrosoftSSO = async () => {
    setSsoLoading(true); setError('');
    try {
      const userData = await simulateSSO(MICROSOFT_PROVIDER);
      signIn(userData); onAuthSuccess();
    } catch { setError('Microsoft SSO authentication failed.'); setSsoLoading(false); }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault(); setError(''); setFormLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const name     = email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    signIn({ name, email, provider: 'Email', avatar: initials });
    setFormLoading(false); onAuthSuccess();
  };

  const anyLoading = ssoLoading || formLoading;

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8">
      <div className="relative w-full max-w-md animate-fade-in">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 pulse-blue btn-primary">
            <Zap size={28} className="text-white" fill="white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Procure<span className="gradient-text">Smart</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">Procurement Decision Support System</p>
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            {['AI-Powered', 'Enterprise SSO', 'Real-time Analytics'].map(tag => (
              <span key={tag} className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full text-blue-600"
                style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="card-solid rounded-3xl p-8 animate-fade-in-d1"
          style={{ boxShadow: '0 20px 60px rgba(37,99,235,0.12), 0 4px 16px rgba(0,0,0,0.06)' }}>

          {mode === 'main' && (
            <>
              <div className="text-center mb-7">
                <h2 className="text-lg font-bold text-slate-800">Sign in to your account</h2>
                <p className="text-xs text-slate-400 mt-1">Choose your authentication method</p>
              </div>

              {/* Microsoft SSO */}
              <button onClick={handleMicrosoftSSO} disabled={anyLoading}
                className="w-full flex items-center justify-center gap-3 text-slate-700 font-semibold py-3.5 px-4 rounded-2xl text-sm cursor-pointer disabled:opacity-50 transition-all duration-200 active:scale-[0.99] mb-6"
                style={{ background: '#f8faff', border: '1.5px solid #dbeafe' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#93c5fd'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f8faff'; e.currentTarget.style.borderColor = '#dbeafe'; }}>
                {ssoLoading ? <Loader size={16} className="animate-spin text-blue-600" /> : MICROSOFT_PROVIDER.icon}
                {ssoLoading ? 'Authenticating…' : MICROSOFT_PROVIDER.label}
              </button>

              {/* Divider */}
              <div className="relative flex py-2 items-center text-[10px] text-slate-400 uppercase tracking-widest mb-5">
                <div className="flex-grow h-px bg-blue-100" />
                <span className="flex-shrink mx-3">or use email</span>
                <div className="flex-grow h-px bg-blue-100" />
              </div>

              <button onClick={() => setMode('email')} disabled={anyLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 font-semibold py-3 px-4 rounded-2xl text-sm">
                <Mail size={15} /> Sign in with Email &amp; Password
              </button>
            </>
          )}

          {mode === 'email' && (
            <>
              <button onClick={() => { setMode('main'); setError(''); }}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 mb-6 transition-colors cursor-pointer">
                ← Back to sign-in options
              </button>
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">Email Sign In</h2>
                <p className="text-xs text-slate-400 mt-1">Enter your corporate credentials</p>
              </div>
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Corporate Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" />
                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="name@enterprise.com" className="ps-input pl-9" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" />
                    <input required type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" className="ps-input pl-9 pr-10" />
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors">
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs text-red-600"
                    style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                    <AlertCircle size={13} /> {error}
                  </div>
                )}
                <button type="submit" disabled={anyLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2 font-semibold py-3 px-4 rounded-2xl text-sm mt-2">
                  {formLoading ? <><Loader size={14} className="animate-spin" /> Signing In…</> : <>Sign In <ArrowRight size={15} /></>}
                </button>
              </form>
            </>
          )}

          {error && mode === 'main' && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs text-red-600 mt-4"
              style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              <AlertCircle size={13} /> {error}
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <Shield size={10} />
          <span>Secured by Microsoft Azure Active Directory SSO</span>
        </div>
      </div>
    </div>
  );
}