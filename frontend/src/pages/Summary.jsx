import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileDown, Sparkles, TrendingUp, CheckCircle2,
         IndianRupee, Clock, Package, Users, Bot, Zap } from 'lucide-react';
import { jsPDF } from 'jspdf';
import MatrixTable from '../components/MatrixTable';
import FeedbackForm from '../components/FeedbackForm';

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatIndianCurrencyUI(num) {
  if (!num) return '₹0';
  const n = Number(num);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2).replace(/\.00$/, '')} L`;
  return `₹${new Intl.NumberFormat('en-IN').format(n)}`;
}

const MODEL_COLORS = {
  ENGLISH:       { accent: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', glow: 'rgba(37,99,235,0.12)' },
  DUTCH:         { accent: '#d97706', bg: '#fffbeb', border: '#fde68a', glow: 'rgba(217,119,6,0.12)' },
  JAPANESE:      { accent: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', glow: 'rgba(124,58,237,0.12)' },
  'SOLE-SOURCE': { accent: '#475569', bg: '#f8fafc', border: '#e2e8f0', glow: 'rgba(71,85,105,0.1)' },
};

// ── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(text, speed = 18) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!text) return;
    setDisplayed('');
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text]);

  return { displayed, done };
}

// ── PDF export ────────────────────────────────────────────────────────────────
function downloadSummaryPDF(results) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW  = doc.internal.pageSize.getWidth();
  const pageH  = doc.internal.pageSize.getHeight();
  const margin = 15;
  const cW     = pageW - margin * 2;
  let y        = margin;

  // Header stripe
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageW, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7); doc.setFont('helvetica', 'bold');
  doc.text('PROCURESMART DSS  —  AI STRATEGY EVALUATION SUMMARY', margin, 6.5);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageW - margin, 6.5, { align: 'right' });
  y = 20;

  // Title block
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, cW, 24, 3, 3, 'F');
  doc.setTextColor(30, 64, 175); doc.setFontSize(15); doc.setFont('helvetica', 'bold');
  doc.text('ProcureSmart DSS', margin + 6, y + 9);
  doc.setFontSize(8.5); doc.setTextColor(100, 116, 139); doc.setFont('helvetica', 'normal');
  doc.text('Procurement Strategy Evaluation — AI-Generated Report', margin + 6, y + 16);
  y += 32;

  // Recommended model hero
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(margin, y, cW, 30, 3, 3, 'F');
  doc.setDrawColor(191, 219, 254); doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, cW, 30, 3, 3, 'S');
  doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(100, 116, 139);
  doc.text('RECOMMENDED PROCUREMENT MODEL', margin + 5, y + 8);
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 64, 175);
  doc.text(doc.splitTextToSize(results?.recommendedModel || '—', cW - 60)[0], margin + 5, y + 17);
  // Fit badge
  doc.setFillColor(30, 64, 175);
  doc.roundedRect(pageW - margin - 40, y + 9, 38, 13, 2, 2, 'F');
  doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
  doc.text(`FIT: ${results?.allocationFit || 0}%`, pageW - margin - 21, y + 17, { align: 'center' });
  y += 38;

  // AI Justification
  if (results?.justification) {
    doc.setFillColor(240, 246, 255);
    const lines   = doc.splitTextToSize(`"${results.justification}"`, cW - 10);
    const shown   = lines.slice(0, 5);
    const blockH  = shown.length * 5 + 14;
    doc.roundedRect(margin, y, cW, blockH, 2, 2, 'F');
    doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 64, 175);
    doc.text('AI STRATEGIC JUSTIFICATION  (Powered by OpenAI)', margin + 5, y + 8);
    doc.setFont('helvetica', 'italic'); doc.setTextColor(71, 85, 105); doc.setFontSize(7.5);
    doc.text(shown, margin + 5, y + 14);
    y += blockH + 6;
  }

  // Footer
  doc.setFillColor(248, 250, 252); doc.rect(0, pageH - 8, pageW, 8, 'F');
  doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.3); doc.line(0, pageH - 8, pageW, pageH - 8);
  doc.setFontSize(6.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(148, 163, 184);
  doc.text('ProcureSmart DSS  —  Procurement Decision Support System', margin, pageH - 3.5);
  doc.text('Page 1 of 1', pageW - margin, pageH - 3.5, { align: 'right' });

  doc.save(`ProcureSmart_Summary_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Summary({ results, setStep }) {
  const fit        = results?.allocationFit || 0;
  const [pdfLoading, setPdfLoading] = useState(false);
  const modelType  = results?.modelType || 'ENGLISH';
  const theme      = MODEL_COLORS[modelType] || MODEL_COLORS.ENGLISH;
  const justText   = results?.justification || '';

  // Typewriter for the justification paragraph
  const { displayed: justDisplayed, done: justDone } = useTypewriter(justText, 14);

  const handleExport = () => {
    setPdfLoading(true);
    setTimeout(() => { downloadSummaryPDF(results); setPdfLoading(false); }, 80);
  };

  return (
    <div className="space-y-5 mt-4 animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="card-solid rounded-2xl p-4 flex flex-wrap justify-between items-center gap-3"
        style={{ boxShadow: '0 4px 20px rgba(37,99,235,0.08)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center btn-primary">
            <LayoutDashboard size={15} className="text-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 tracking-widest uppercase">Strategy Evaluation Summary</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">AI-powered procurement model recommendation</p>
          </div>
        </div>
        <button onClick={handleExport} disabled={pdfLoading}
          className="btn-primary flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl disabled:opacity-50">
          <FileDown size={13} />
          {pdfLoading ? 'Generating…' : 'Export PDF'}
        </button>
      </div>

      {/* ── Recommended model hero ───────────────────────────────────────── */}
      <div className="card-solid rounded-3xl p-7 relative overflow-hidden"
        style={{ boxShadow: `0 12px 40px ${theme.glow}`, border: `1px solid ${theme.border}` }}>
        {/* Accent glow orb */}
        <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full opacity-25 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${theme.border}, transparent 70%)` }} />

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: theme.accent }} />
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Recommended Model</p>
          </div>

          <h2 className="text-xl md:text-2xl font-black tracking-tight leading-tight mb-5"
            style={{ color: theme.accent }}>
            {results?.recommendedModel}
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {/* Fit badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl"
              style={{ background: theme.bg, border: `1px solid ${theme.border}` }}>
              <TrendingUp size={14} style={{ color: theme.accent }} />
              <span className="text-xs font-semibold text-slate-500">Allocation Fit:</span>
              <span className="text-sm font-black" style={{ color: theme.accent }}>{fit}%</span>
            </div>

            {/* Progress bar */}
            <div className="flex-1 min-w-[140px] flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full overflow-hidden"
                style={{ background: theme.bg, border: `1px solid ${theme.border}` }}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${fit}%`,
                    background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent}bb)`,
                    boxShadow: `0 0 10px ${theme.accent}55`,
                  }} />
              </div>
              <span className="text-xs font-bold" style={{ color: theme.accent }}>{fit}%</span>
            </div>

            {/* Verified badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <CheckCircle2 size={13} className="text-green-500" />
              <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── AI Justification ─────────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid #bfdbfe', boxShadow: '0 4px 20px rgba(37,99,235,0.07)' }}>

        {/* Header bar */}
        <div className="px-6 py-3.5 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', borderBottom: '1px solid #bfdbfe' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-widest uppercase">AI Strategic Justification</p>
              <p className="text-[9px] text-blue-200 mt-0.5">Powered by OpenAI · ProcureSmart Copilot</p>
            </div>
          </div>
          {/* Live / Static badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15">
            <div className={`w-1.5 h-1.5 rounded-full ${justDone ? 'bg-green-300' : 'bg-yellow-300 animate-pulse'}`} />
            <span className="text-[9px] font-bold text-white/90 uppercase tracking-widest">
              {justDone ? 'AI Generated' : 'Generating…'}
            </span>
          </div>
        </div>

        {/* Justification text with typewriter */}
        <div className="px-6 py-5" style={{ background: '#f8fbff' }}>
          <p className="text-sm text-slate-600 leading-relaxed font-mono-ps">
            &ldquo;{justDisplayed}{!justDone && (
              <span className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5 align-middle animate-pulse" />
            )}&rdquo;
          </p>
        </div>

        {/* Footer attribution */}
        <div className="px-6 py-2.5 flex items-center gap-2"
          style={{ background: '#f0f6ff', borderTop: '1px solid #dbeafe' }}>
          <Zap size={10} className="text-blue-400" />
          <span className="text-[9px] text-blue-400 font-semibold tracking-widest uppercase">
            Generated by OpenAI gpt-4o-mini · ProcureSmart Decision Engine
          </span>
        </div>
      </div>

      <MatrixTable currentModelType={results?.modelType} />
      <FeedbackForm recommendedModel={results?.recommendedModel} />

      <div className="pt-1 flex justify-start">
        <button onClick={() => setStep('wizard')}
          className="text-xs font-semibold text-blue-500 hover:text-blue-700 transition-colors cursor-pointer flex items-center gap-1.5">
          ← Execute Alternative Assessment Setup
        </button>
      </div>
    </div>
  );
}