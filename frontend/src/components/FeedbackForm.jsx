import React, { useState } from 'react';

export default function FeedbackForm() {
  const [rating, setRating] = useState(0);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-xs p-6">
      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">Application Feedback Engine</h4>
      <p className="text-xs text-gray-400 mb-4">Was this procurement assessment strategy useful?</p>
      
      <div className="flex gap-1.5 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button 
            key={star} 
            onClick={() => setRating(star)}
            className={`text-xl transition-colors ${star <= rating ? 'text-amber-400' : 'text-gray-200'}`}
          >
            ★
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-semibold text-gray-500 uppercase">Comments / Edge Cases:</label>
        <textarea rows={3} placeholder="Provide additional project context here..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
        <button onClick={() => alert('Operational review notes saved successfully.')} className="bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-xs">
          Submit Feedback
        </button>
      </div>
    </div>
  );
}