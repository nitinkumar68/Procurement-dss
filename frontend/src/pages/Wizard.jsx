import React, { useState, useRef } from 'react';
import { Zap, ArrowLeft, Brain, Loader2, CheckCircle, PieChart } from 'lucide-react';

// ── These MUST be defined OUTSIDE the component ───────────────────────────────
// If defined inside, React treats them as new components on every render,
// causing the input to lose focus every time formData changes.
const Section = ({ title, desc, children }) => (
  <div className="space-y-2">
    <div>
      <p className="text-sm font-bold text-slate-800">{title}</p>
      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
    </div>
    {children}
  </div>
);

const RadioGroup = ({ options, value, onChange, cols }) => (
  <div className={`grid gap-2.5 ${cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : cols === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
    {options.map(opt => (
      <label key={opt.value || opt} className={`option-card ${value === (opt.value || opt) ? 'selected' : ''}`}>
        <input type="radio" checked={value === (opt.value || opt)} onChange={() => onChange(opt.value || opt)} className="sr-only" />
        <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          value === (opt.value || opt) ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
        }`}>
          {value === (opt.value || opt) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
        <span>{opt.label || opt}{opt.sub ? <span className="text-slate-400 ml-1">{opt.sub}</span> : ''}</span>
      </label>
    ))}
  </div>
);

// ── Currency formatter ────────────────────────────────────────────────────────
function formatToIndianWords(num) {
  if (!num || isNaN(num)) return '₹ 0';
  if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  if (num >= 100000)   return `₹ ${(num / 100000).toFixed(2).replace(/\.00$/, '')} L`;
  return `₹ ${new Intl.NumberFormat('en-IN').format(num)}`;
}

// ── LOADING PHASES (constant, outside component) ──────────────────────────────
const LOADING_PHASES = [
  { text: 'Copilot is analysing procurement parameters…' },
  { text: 'Running rule-engine model selection…' },
  { text: 'Generating AI strategic justification…' },
  { text: 'Finalising recommendation…' },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function Wizard({ formData, setFormData, setResults, setStep }) {
  const [loading,      setLoading]      = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const phaseRef = useRef(null);

  const calculateStrategy = async () => {
    setLoading(true);
    setLoadingPhase(0);

    let phase = 0;
    phaseRef.current = setInterval(() => {
      phase = Math.min(phase + 1, LOADING_PHASES.length - 1);
      setLoadingPhase(phase);
    }, 900);

    const clearPhase = () => { clearInterval(phaseRef.current); phaseRef.current = null; };

    try {
      const response = await fetch('http://localhost:5000/api/assessment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      clearPhase();
      if (!response.ok) throw new Error('Offline');
      const data = await response.json();
      if (data.success) { setResults(data.data); setStep('summary'); return; }
    } catch {
      clearPhase();
      let modelType = 'ENGLISH', model = 'ENGLISH REVERSE AUCTION (WITH RANK-BASED VISIBILITY)', fit = 94, reason = '';
      const budgetText = formatToIndianWords(formData.projectCapitalAllocation);

      if (formData.supplierDensity === 'Single Vendor') {
        modelType = 'SOLE-SOURCE'; model = 'DIRECT SOLE-SOURCE PROCUREMENT NEGOTIATION'; fit = 98;
        reason = `With only a single qualified vendor available in the market for this contract, competitive bidding models are mathematically invalid. The system recommends launching a transparent direct negotiation leveraging the full ${budgetText} budget allocation profile.`;
      } else if (formData.allocationTimeline === 'Urgent / Emergency Needs') {
        modelType = 'DUTCH'; model = 'DUTCH REVERSE AUCTION (ACCELERATED SETTLEMENT)'; fit = 89;
        reason = `Because your operational delivery horizon is critically urgent (< 1 week), the system recommends a Dutch Reverse Auction framework ticking down sequentially to force immediate closure to protect timeline velocity for your ${budgetText} allocation.`;
      } else if (formData.materialClassification === 'Highly Specialized / Proprietary Equipment') {
        modelType = 'JAPANESE'; model = 'JAPANESE REVERSE AUCTION (SEALED MULTI-STAGE COHORT)'; fit = 85;
        reason = `This project involves highly specialized, proprietary equipment. The Japanese auction protocol keeps supplier cohorts anonymous through declining target pricing rounds, ensuring compliance for your ${budgetText} budget.`;
      } else {
        reason = `Given the ${budgetText} allocation budget, standard 1-month timeline, and broad market availability, the system validates an English Reverse Auction. Enforcing strict Rank-Only visibility prevents supplier bid-shadowing.`;
      }

      const resultObj = { recommendedModel: model, modelType, allocationFit: fit, justification: reason, ...formData };
      setResults(resultObj);
      try {
        const stored = JSON.parse(localStorage.getItem('ps_assessments') || '[]');
        stored.unshift({ ...formData, ...resultObj, id: Date.now(), created_at: new Date().toISOString() });
        localStorage.setItem('ps_assessments', JSON.stringify(stored.slice(0, 100)));
      } catch (_) {}
      setStep('summary');
    } finally { setLoading(false); setLoadingPhase(0); }
  };

  return (
    <div className="mt-4 animate-fade-in">

      {/* ── Copilot Loading Overlay ─────────────────────────────────────── */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(240,246,255,0.88)', backdropFilter: 'blur(8px)' }}>
          <div className="card-solid rounded-3xl p-8 max-w-sm w-full mx-4 text-center animate-fade-in"
            style={{ boxShadow: '0 24px 80px rgba(37,99,235,0.18)', border: '1px solid #bfdbfe' }}>
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute w-20 h-20 rounded-full border-2 border-blue-200 animate-ping opacity-30" />
              <div className="absolute w-16 h-16 rounded-full border-2 border-blue-300 animate-ping opacity-40"
                style={{ animationDelay: '0.3s' }} />
              <div className="w-12 h-12 rounded-2xl btn-primary flex items-center justify-center">
                <Brain size={22} className="text-white" />
              </div>
            </div>
            <p className="text-sm font-black text-slate-800 tracking-tight mb-1">Copilot is Working</p>
            <p className="text-xs font-semibold text-blue-600 mb-5">ProcureSmart AI Engine</p>
            <div className="space-y-2 text-left">
              {LOADING_PHASES.map((ph, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-500"
                  style={{
                    background: i === loadingPhase ? '#eff6ff' : i < loadingPhase ? '#f0fdf4' : '#f8fafc',
                    border: `1px solid ${i === loadingPhase ? '#bfdbfe' : i < loadingPhase ? '#bbf7d0' : '#e2e8f0'}`,
                    opacity: i > loadingPhase ? 0.4 : 1,
                  }}>
                  {i < loadingPhase
                    ? <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                    : i === loadingPhase
                    ? <Loader2 size={14} className="text-blue-500 flex-shrink-0 animate-spin" />
                    : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0" />}
                  <span className={`text-[11px] font-semibold ${
                    i < loadingPhase ? 'text-green-700' : i === loadingPhase ? 'text-blue-700' : 'text-slate-400'
                  }`}>{ph.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="card-solid rounded-3xl p-6 md:p-8"
        style={{ boxShadow: '0 8px 40px rgba(37,99,235,0.1), 0 2px 8px rgba(0,0,0,0.05)' }}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-7 gap-3"
          style={{ borderBottom: '1px solid #dbeafe' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center btn-primary">
              <Zap size={17} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">NEW PROCUREMENT ASSESSMENT</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Configure parameters for AI-powered strategy evaluation</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
            style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <span className="text-slate-500">Step</span>
            <span className="font-bold text-blue-600">2 of 6</span>
            <div className="flex gap-1 ml-1">
              {[0,1,2,3,4,5].map(i => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${i === 0 ? 'w-4 bg-blue-500' : 'w-1.5 bg-blue-100'}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-7">

          {/* Q1 — Supplier Density */}
          <Section title="Q1. Supplier Density" desc="How many qualified vendors are available for this item?">
            <RadioGroup cols={3} value={formData.supplierDensity}
              onChange={v => setFormData(prev => ({ ...prev, supplierDensity: v }))}
              options={[
                { value: 'Single Vendor',    label: 'Single Vendor',    sub: '(1)' },
                { value: 'Limited Tier',     label: 'Limited Tier',     sub: '(2–5 Vendors)' },
                { value: 'Broad Market Tier',label: 'Broad Market Tier',sub: '(6+ Vendors)' },
              ]} />
          </Section>
          <div className="ps-divider" />

          {/* Q2 — Allocation Timeline */}
          <Section title="Q2. Allocation Timeline" desc="What is your drop-dead operational delivery horizon?">
            <RadioGroup cols={3} value={formData.allocationTimeline}
              onChange={v => setFormData(prev => ({ ...prev, allocationTimeline: v }))}
              options={[
                { value: 'Urgent / Emergency Needs',    label: 'Urgent / Emergency',  sub: '(< 1 Week)' },
                { value: 'Standard Processing Window',   label: 'Standard Window',     sub: '(1 Month)' },
                { value: 'Long-Term Strategic Sourcing', label: 'Long-Term Strategic', sub: '(6+ Months)' },
              ]} />
          </Section>
          <div className="ps-divider" />

          {/* Q3 — Material Classification */}
          <Section title="Q3. Material Classification" desc="Select the exact type of item being purchased in bulk:">
            <RadioGroup cols={2} value={formData.materialClassification}
              onChange={v => setFormData(prev => ({ ...prev, materialClassification: v }))}
              options={[
                { value: 'Commodity Goods',                            label: 'Commodity Goods (Standardized / Mass Produced)' },
                { value: 'Highly Specialized / Proprietary Equipment', label: 'Highly Specialized / Proprietary Equipment' },
              ]} />
          </Section>
          <div className="ps-divider" />

          {/* Q4 — Budget + Q5 — Pricing Matrix (side by side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">

            {/* Q4 — Budget */}
            <Section title="Q4. Project Capital Allocation" desc="Input the gross estimated value or budget cap:">
              <div className="relative">
                <span style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  color: '#3b82f6', fontWeight: 700, fontSize: '15px',
                  lineHeight: 1, pointerEvents: 'none', userSelect: 'none', zIndex: 1,
                }}>₹</span>
                <input
                  id="budget-input"
                  type="number"
                  value={formData.projectCapitalAllocation}
                  onChange={e => setFormData(prev => ({ ...prev, projectCapitalAllocation: Number(e.target.value) }))}
                  className="ps-input pr-32"
                  style={{ paddingLeft: '34px' }}
                />
                <span className="absolute right-3 text-[10px] font-bold text-blue-600 font-mono-ps px-2 py-0.5 rounded-md"
                  style={{
                    top: '50%', transform: 'translateY(-50%)',
                    background: '#eff6ff', border: '1px solid #bfdbfe', whiteSpace: 'nowrap',
                  }}>
                  {formatToIndianWords(formData.projectCapitalAllocation)}
                </span>
              </div>
            </Section>

            {/* Q5 — Pricing Matrix */}
            <Section title="Q5. Pricing Matrix Status" desc="What is the baseline structural nature of the price?">
              <RadioGroup cols={2} value={formData.pricingMatrixStatus}
                onChange={v => setFormData(prev => ({ ...prev, pricingMatrixStatus: v }))}
                options={[
                  { value: 'Fixed Initial List Price',            label: 'Fixed Initial List Price' },
                  { value: 'Open / Fluctuating Market Spot Rate', label: 'Open / Fluctuating Market Spot Rate' },
                ]} />
            </Section>
          </div>
          <div className="ps-divider" />

          {/* Q6 — SOB Share of Business */}
          <Section title="Q6. SOB Share of Business" desc="What is the intended business share distribution among awarded suppliers?">
            <div className="flex items-start gap-2.5 mb-3 px-4 py-3 rounded-xl"
              style={{ background: '#f0f6ff', border: '1px solid #bfdbfe' }}>
              <PieChart size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-blue-700 leading-relaxed">
                SOB defines how contract volume is distributed if multiple suppliers are awarded. Single-source contracts = 100%.
              </p>
            </div>
            <RadioGroup cols={4} value={formData.sobShareOfBusiness}
              onChange={v => setFormData(prev => ({ ...prev, sobShareOfBusiness: v }))}
              options={[
                { value: '100%',         label: '100%',         sub: '(Single Source)' },
                { value: '70% / 30%',    label: '70/30',        sub: '(Primary/Backup)' },
                { value: '60% / 40%',    label: '60/40',        sub: '(Split Award)' },
                { value: '50% / 50%',    label: '50/50',        sub: '(Dual Source)' },
                { value: '40% / 30% / 30%', label: '40/30/30', sub: '(Multi-Source)' },
                { value: 'Custom',       label: 'Custom Split',  sub: '' },
              ]} />
            {formData.sobShareOfBusiness === 'Custom' && (
              <div className="mt-2.5">
                <input
                  type="text"
                  placeholder="e.g. 50% Vendor A, 30% Vendor B, 20% Vendor C"
                  value={formData.sobCustomValue || ''}
                  onChange={e => setFormData(prev => ({ ...prev, sobCustomValue: e.target.value }))}
                  className="ps-input text-xs"
                />
              </div>
            )}
          </Section>

        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-8 pt-6" style={{ borderTop: '1px solid #dbeafe' }}>
          <button onClick={() => setStep('login')}
            className="btn-ghost flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl">
            <ArrowLeft size={14} /> Previous Step
          </button>
          <button onClick={calculateStrategy} disabled={loading}
            className="btn-primary flex items-center gap-2 text-xs font-bold px-6 py-2.5 rounded-xl tracking-wide uppercase">
            <Zap size={13} fill="white" /> Calculate Strategy
          </button>
        </div>
      </div>
    </div>
  );
}