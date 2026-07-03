import React, { useState } from 'react';
import { CheckCircle, Loader, Star } from 'lucide-react';

function saveLocally(entry) {
  try {
    const existing = JSON.parse(localStorage.getItem('ps_feedback') || '[]');
    existing.unshift({ ...entry, id: Date.now(), created_at: new Date().toISOString() });
    localStorage.setItem('ps_feedback', JSON.stringify(existing.slice(0, 100)));
  } catch (_) {}
}

export default function FeedbackForm({ recommendedModel }) {
  const [rating,   setRating]   = useState(0);
  const [hovered,  setHovered]  = useState(0);
  const [comments, setComments] = useState('');
  const [status,   setStatus]   = useState('idle');

  const handleSubmit = async () => {
    if (rating === 0) return alert('Please select a star rating.');
    setStatus('loading');
    const entry = { rating, comments, recommendedModel: recommendedModel || '' };
    try {
      const res = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry),
      });
      if ((await res.json()).success) { saveLocally(entry); setStatus('success'); return; }
    } catch (_) {}
    saveLocally(entry);
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <div className="card-solid rounded-2xl p-6 flex items-center gap-4"
        style={{ border: '1px solid #bbf7d0', background: '#f0fdf4' }}>
        <CheckCircle size={28} className="text-green-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-green-800">Feedback Submitted</p>
          <p className="text-xs text-green-600 mt-0.5">Your rating has been saved. Thank you for your input!</p>
        </div>
      </div>
    );
  }

  const starLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div className="card-solid rounded-2xl p-6" style={{ boxShadow: '0 4px 20px rgba(37,99,235,0.07)' }}>
      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Application Feedback Engine</h4>
      <p className="text-xs text-slate-400 mb-5">Was this procurement assessment strategy useful?</p>

      <div className="flex items-center gap-2 mb-2">
        {[1,2,3,4,5].map(star => (
          <button key={star} type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-all duration-150 cursor-pointer"
            style={{ transform: (hovered || rating) >= star ? 'scale(1.2)' : 'scale(1)' }}>
            <Star size={24} fill={(hovered || rating) >= star ? '#f59e0b' : 'transparent'}
              style={{ color: (hovered || rating) >= star ? '#f59e0b' : '#cbd5e1' }} />
          </button>
        ))}
        {(hovered || rating) > 0 && (
          <span className="text-xs font-semibold text-amber-500 ml-2">{starLabels[(hovered || rating) - 1]}</span>
        )}
      </div>

      <div className="space-y-3 mt-5">
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Comments / Edge Cases</label>
        <textarea rows={3} value={comments} onChange={e => setComments(e.target.value)}
          placeholder="Provide additional project context here..."
          className="ps-input resize-none" style={{ minHeight: '80px' }} />
        <button type="button" onClick={handleSubmit} disabled={status === 'loading'}
          className="btn-ghost flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50">
          {status === 'loading' && <Loader size={12} className="animate-spin" />}
          {status === 'loading' ? 'Saving…' : 'Submit Feedback'}
        </button>
      </div>
    </div>
  );
}