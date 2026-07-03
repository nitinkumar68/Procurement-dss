import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LayoutDashboard, History, LogOut, User, ChevronDown, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PROVIDER_COLORS = {
  Google: '#EA4335', Microsoft: '#0078D4', Email: '#2563eb',
};

function AvatarBubble({ user, size = 'md' }) {
  const color = PROVIDER_COLORS[user?.provider] || '#2563eb';
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div className={`${dim} rounded-full flex items-center justify-center font-bold flex-shrink-0 select-none text-white`}
      style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)`, boxShadow: `0 2px 10px ${color}40` }}>
      {user?.avatar || <User size={14} />}
    </div>
  );
}

function DropdownPortal({ anchorRef, open, children }) {
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setCoords({ top: rect.bottom + 8 + window.scrollY, right: window.innerWidth - rect.right });
  }, [open]);
  if (!open) return null;
  return createPortal(
    <div style={{ position: 'absolute', top: coords.top, right: coords.right, width: 260, zIndex: 99999 }}>
      {children}
    </div>,
    document.body
  );
}

export default function Navbar({ setStep, currentStep, onSignOut }) {
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const btnRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target) &&
          btnRef.current  && !btnRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = () => { setDropdownOpen(false); signOut(); onSignOut(); };

  const NavBtn = ({ label, icon, isActive, onClick }) => (
    <button onClick={onClick} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
      style={isActive
        ? { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }
        : { color: '#64748b', border: '1px solid transparent' }}
      onMouseEnter={e => !isActive && (e.currentTarget.style.background = '#f8faff', e.currentTarget.style.color = '#2563eb')}
      onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = '#64748b')}
    >
      {icon} {label}
    </button>
  );

  return (
    <header className="card rounded-2xl mx-auto mt-4 max-w-5xl px-5 py-3 flex justify-between items-center"
      style={{ boxShadow: '0 4px 24px rgba(59,130,246,0.1), 0 1px 3px rgba(0,0,0,0.04)' }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setStep('wizard')}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white select-none btn-primary">
          P
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-bold text-sm text-slate-800 tracking-tight">ProcureSmart</span>
          <span className="text-[9px] font-semibold text-blue-500 tracking-widest uppercase">Decision Support System</span>
        </div>
      </div>

      <nav className="flex items-center gap-2">
        <NavBtn label="Dashboard" icon={<LayoutDashboard size={14} />}
          isActive={currentStep === 'wizard' || currentStep === 'summary'} onClick={() => setStep('wizard')} />
        <NavBtn label="History" icon={<History size={14} />}
          isActive={currentStep === 'history'} onClick={() => setStep('history')} />

        {/* Avatar button */}
        <button ref={btnRef} onClick={() => setDropdownOpen(o => !o)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ml-1"
          style={{ border: '1px solid #dbeafe', background: dropdownOpen ? '#eff6ff' : '#fff' }}>
          {user ? <AvatarBubble user={user} size="sm" /> : (
            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
              <User size={14} className="text-blue-400" />
            </div>
          )}
          {user && (
            <span className="text-xs font-semibold text-slate-700 max-w-[72px] truncate hidden sm:block">
              {user.name?.split(' ')[0]}
            </span>
          )}
          <ChevronDown size={12} className="text-slate-400 transition-transform duration-200"
            style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
        </button>

        {/* Portal dropdown */}
        <DropdownPortal anchorRef={btnRef} open={dropdownOpen}>
          <div ref={dropRef} className="card-solid rounded-2xl overflow-hidden animate-fade-in"
            style={{ boxShadow: '0 20px 60px rgba(37,99,235,0.15), 0 4px 12px rgba(0,0,0,0.08)' }}>
            {user && (
              <div className="px-4 py-4" style={{ borderBottom: '1px solid #dbeafe' }}>
                <div className="flex items-center gap-3">
                  <AvatarBubble user={user} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1 rounded-md px-2 py-0.5"
                      style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                      <Shield size={8} className="text-blue-500" />
                      <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">{user.provider} SSO</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="p-2 space-y-0.5">
              {[
                { label: 'Dashboard', icon: <LayoutDashboard size={13} />, action: () => { setDropdownOpen(false); setStep('wizard'); } },
                { label: 'Assessment History', icon: <History size={13} />, action: () => { setDropdownOpen(false); setStep('history'); } },
              ].map(item => (
                <button key={item.label} onClick={item.action}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 rounded-xl transition-all cursor-pointer text-left hover:bg-blue-50 hover:text-blue-700">
                  {item.icon} {item.label}
                </button>
              ))}
              <div className="my-1.5" style={{ height: 1, background: '#dbeafe' }} />
              <button onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer text-left group">
                <LogOut size={13} className="group-hover:translate-x-0.5 transition-transform" /> Sign Out
              </button>
            </div>
          </div>
        </DropdownPortal>
      </nav>
    </header>
  );
}