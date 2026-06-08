import React from 'react';
import { LayoutDashboard, FileText, Sparkles } from 'lucide-react';
import MatrixTable from '../components/MatrixTable';
import FeedbackForm from '../components/FeedbackForm';

export default function Summary({ results, setStep }) {
  return (
    <div className="space-y-6 mt-4">
      {/* Title Execution Deck */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs p-5 flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-800 font-bold text-sm tracking-tight">
          <LayoutDashboard size={16} className="text-blue-600" />
          <h3>STRATEGY EVALUATION SUMMARY</h3>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-1.5 border border-gray-200 bg-gray-50 text-gray-600 hover:text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shadow-2xs">
          <FileText size={14} /> Export PDF
        </button>
      </div>

      {/* Main Core Recommendation Block */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs p-6 relative overflow-hidden">
        <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Recommended Model</p>
        <h2 className="text-lg md:text-xl font-extrabold text-blue-900 tracking-tight mt-1 flex items-center gap-2">
          <Sparkles size={18} className="text-blue-600 fill-blue-500" />
          {results?.recommendedModel}
        </h2>
        <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1 text-xs">
          <span className="font-medium text-blue-600">System Logic Weight:</span>
          <span className="font-extrabold text-blue-700">{results?.allocationFit}% Allocation Fit</span>
        </div>
      </div>

      {/* Structured Copilot Insights Card Block */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-800 pb-3">
          <Sparkles size={14} className="text-blue-400" />
          <span>AI Strategic Justification <span className="text-[10px] font-normal lowercase text-slate-500 italic">(Powered by Microsoft Copilot)</span></span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-mono">
          "{results?.justification}"
        </p>
      </div>

      {/* Matrix Breakdown Evaluation Element Component */}
      <MatrixTable />

      {/* System Feedback Collection Widgets */}
      <FeedbackForm />

      {/* Return Workflow Controller Reset */}
      <div className="pt-2 flex justify-start">
        <button onClick={() => setStep('wizard')} className="text-xs font-medium text-blue-600 hover:underline">
          ← Execute Alternative Assessment Setup
        </button>
      </div>
    </div>
  );
}