import React from 'react';

export default function MatrixTable() {
  const systems = [
    { name: 'English', status: 'SUGGESTED', badge: 'bg-green-50 border-green-200 text-green-700', desc: 'Drives absolute bottom-floor pricing.' },
    { name: 'Dutch', status: 'REJECTED', badge: 'bg-red-50 border-red-100 text-red-600', desc: 'Over-accelerated for a 1-month timeline.' },
    { name: 'Japanese', status: 'REJECTED', badge: 'bg-red-50 border-red-100 text-red-600', desc: 'Unnecessarily complex for standard items.' }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <h4 className="text-xs font-bold text-gray-500 tracking-wider uppercase">Competitive Bidding Matrix Evaluation</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 uppercase font-semibold bg-gray-50/20">
              <th className="p-4 pl-6">Model</th>
              <th className="p-4">Status</th>
              <th className="p-4 pr-6">Primary Core Advantage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {systems.map((sys) => (
              <tr key={sys.name} className={sys.status === 'REJECTED' ? 'bg-gray-50/10' : ''}>
                <td className={`p-4 pl-6 font-bold ${sys.status === 'SUGGESTED' ? 'text-blue-900' : 'text-gray-400'}`}>{sys.name}</td>
                <td className="p-4">
                  <span className={`border font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase ${sys.badge}`}>
                    {sys.status}
                  </span>
                </td>
                <td className={`p-4 pr-6 ${sys.status === 'SUGGESTED' ? 'text-gray-600' : 'text-gray-400'}`}>{sys.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}