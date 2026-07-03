import React from 'react';
import { Target } from 'lucide-react';

const MODEL_THEME = {
  ENGLISH:       { accent: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'English'  },
  DUTCH:         { accent: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Dutch'    },
  JAPANESE:      { accent: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', label: 'Japanese' },
  'SOLE-SOURCE': { accent: '#475569', bg: '#f8fafc', border: '#e2e8f0', label: 'Direct'   },
};

export default function MatrixTable({ currentModelType }) {
  const activeType = currentModelType || 'ENGLISH';
  const systems = [
    { id: 'ENGLISH',  name: 'English',  desc: 'Drives absolute bottom-floor pricing through real-time competitive bidding cycles.',        timelineReject: 'Over-extended processing times run counter to critical delivery mandates.' },
    { id: 'DUTCH',    name: 'Dutch',    desc: 'Accelerates speed-to-contract using high-to-low dropping target cost windows.',              timelineReject: 'Over-accelerated parameters drop price discovery resolution windows for standard times.' },
    { id: 'JAPANESE', name: 'Japanese', desc: 'Maintains anonymous sequential submission rounds to manage niche proprietary cohorts.',      timelineReject: 'Unnecessarily complex administrative constraints for standardized items.' },
  ];

  return (
    <div className="card-solid rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(37,99,235,0.08)' }}>
      <div className="px-5 py-4 flex items-center gap-2.5" style={{ borderBottom: '1px solid #dbeafe', background: '#f8fbff' }}>
        <Target size={14} className="text-blue-500" />
        <h4 className="text-xs font-bold text-slate-500 tracking-widest uppercase">Competitive Bidding Matrix Evaluation</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fbff' }}>
              {['Model', 'Status', 'Primary Matrix Justification'].map(h => (
                <th key={h} className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {systems.map((sys, i) => {
              const isSuggested = activeType === sys.id || (activeType === 'SOLE-SOURCE' && sys.id === 'ENGLISH');
              const theme = MODEL_THEME[sys.id];
              return (
                <tr key={sys.id}
                  style={{
                    borderBottom: i < systems.length - 1 ? '1px solid #f1f5f9' : 'none',
                    background: isSuggested ? theme.bg : '#fff',
                  }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: isSuggested ? theme.accent : '#cbd5e1' }} />
                      <span className="font-bold text-sm" style={{ color: isSuggested ? theme.accent : '#94a3b8' }}>
                        {sys.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {isSuggested ? <span className="badge-suggested">SUGGESTED</span> : <span className="badge-rejected">REJECTED</span>}
                  </td>
                  <td className="px-5 py-4 leading-relaxed" style={{ color: isSuggested ? '#334155' : '#94a3b8', fontStyle: isSuggested ? 'normal' : 'italic' }}>
                    {isSuggested ? sys.desc : sys.timelineReject}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}