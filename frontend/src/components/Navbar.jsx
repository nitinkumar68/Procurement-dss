import React from 'react';
import { LayoutDashboard, History, User } from 'lucide-react';

export default function Navbar({ setStep }) {
  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4 flex justify-between items-center max-w-5xl mx-auto mt-4 rounded-xl shadow-xs">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep('wizard')}>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm tracking-wider">P</div>
        <span className="font-bold text-lg tracking-tight text-gray-900">
          ProcureSmart <span className="text-blue-600 text-xs font-semibold px-1.5 py-0.5 bg-blue-50 rounded border border-blue-100 ml-1">DSS</span>
        </span>
      </div>
      <nav className="flex items-center gap-6 text-sm font-medium text-gray-500">
        <button className="flex items-center gap-1.5 text-blue-600 font-semibold"><LayoutDashboard size={16} /> Dashboard</button>
        <button className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"><History size={16} /> History</button>
        <button className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"><User size={16} /></button>
      </nav>
    </header>
  );
}