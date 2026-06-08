import React from 'react';
import { Shield, ArrowRight } from 'lucide-react';

export default function Login({ onAuthSuccess }) {
  const handleSubmission = (e) => {
    e.preventDefault();
    onAuthSuccess();
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-600 mb-3">
            <Shield size={24} />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-1">Procurement Portal Access Engine</p>
        </div>

        <form onSubmit={handleSubmission} className="space-y-4">
          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl shadow-xs transition-all text-sm group">
            <span>Sign in with Copilot Active Directory</span>
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="relative flex py-2 items-center text-xs text-gray-400 uppercase tracking-wider">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-3">Or Sign In</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Corporate Email</label>
            <input required type="email" placeholder="name@enterprise.com" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Password</label>
            <input required type="password" placeholder="••••••••" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
          </div>

          <button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all mt-2 shadow-xs">
            Login Button
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-gray-400 border-t border-gray-100 pt-4">
          <Shield size={12} />
          <span>Secured by corporate Azure Active Directory policy.</span>
        </div>
      </div>
    </div>
  );
}