import React, { useEffect, useState } from 'react';
import {
  History, Sparkles, Star, MessageSquare, ArrowLeft,
  RefreshCw, Database, HardDrive, FileDown, Clock,
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// ── Model accent colours (white/blue light-mode palette) ─────────────────────
const MODEL_META = {
  ENGLISH:      { accent: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'ENGLISH'     },
  DUTCH:        { accent: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'DUTCH'       },
  JAPANESE:     { accent: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', label: 'JAPANESE'    },
  'SOLE-SOURCE':{ accent: '#475569', bg: '#f8fafc', border: '#e2e8f0', label: 'SOLE-SOURCE' },
};

function getModelKey(model = '') {
  if (model.includes('DUTCH'))                                    return 'DUTCH';
  if (model.includes('JAPANESE'))                                 return 'JAPANESE';
  if (model.includes('SOLE-SOURCE') || model.includes('DIRECT')) return 'SOLE-SOURCE';
  return 'ENGLISH';
}

function formatIndianCurrency(num) {
  if (!num) return 'Rs 0';
  const n = Number(num);
  if (n >= 10000000) return `Rs ${(n / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  if (n >= 100000)   return `Rs ${(n / 100000).toFixed(2).replace(/\.00$/, '')} L`;
  return `Rs ${new Intl.NumberFormat('en-IN').format(n)}`;
}

function formatIndianCurrencyUI(num) {
  if (!num) return '₹0';
  const n = Number(num);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2).replace(/\.00$/, '')} L`;
  return `₹${new Intl.NumberFormat('en-IN').format(n)}`;
}

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function getLocalFeedback()    { try { return JSON.parse(localStorage.getItem('ps_feedback')    || '[]'); } catch { return []; } }
function getLocalAssessments() { try { return JSON.parse(localStorage.getItem('ps_assessments') || '[]'); } catch { return []; } }

// ── PDF generator (unchanged logic, kept intact) ──────────────────────────────
function downloadPDF(assessments, feedbacks) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = margin;

  const checkPage = (needed = 10) => {
    if (y + needed > pageH - margin) { doc.addPage(); y = margin; drawHeader(); }
  };
  const drawHeader = () => {
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageW, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7); doc.setFont('helvetica', 'bold');
    doc.text('PROCURESMART DSS  —  CONFIDENTIAL REPORT', margin, 6.5);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageW - margin, 6.5, { align: 'right' });
    doc.setTextColor(30, 41, 59);
  };

  drawHeader();
  y = 20;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentW, 28, 3, 3, 'F');
  doc.setTextColor(30, 64, 175); doc.setFontSize(18); doc.setFont('helvetica', 'bold');
  doc.text('ProcureSmart DSS', margin + 6, y + 10);
  doc.setFontSize(9); doc.setTextColor(100, 116, 139); doc.setFont('helvetica', 'normal');
  doc.text('Assessment History & Feedback Report', margin + 6, y + 17);
  doc.setFontSize(7.5);
  doc.text(`Exported: ${new Date().toLocaleString('en-IN')}`, margin + 6, y + 23);

  const boxX = pageW - margin - 50;
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(boxX, y + 2, 50, 24, 2, 2, 'F');
  doc.setFontSize(7); doc.setTextColor(30, 64, 175); doc.setFont('helvetica', 'bold');
  doc.text('SUMMARY', boxX + 4, y + 9);
  doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 41, 59);
  doc.text(`Assessments:   ${assessments.length}`, boxX + 4, y + 14.5);
  doc.text(`Feedback Items: ${feedbacks.length}`, boxX + 4, y + 19.5);
  y += 36;

  if (assessments.length > 0) {
    checkPage(14);
    doc.setFillColor(30, 64, 175);
    doc.roundedRect(margin, y, contentW, 9, 2, 2, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.text('PROCUREMENT ASSESSMENTS', margin + 4, y + 6);
    y += 13;

    const rowColors = { ENGLISH:[239,246,255], DUTCH:[255,251,235], JAPANESE:[250,245,255], 'SOLE-SOURCE':[248,250,252] };
    const accentColors = { ENGLISH:[30,64,175], DUTCH:[180,83,9], JAPANESE:[109,40,217], 'SOLE-SOURCE':[71,85,105] };

    assessments.forEach((a, i) => {
      const model = a.recommended_model || a.recommendedModel || '—';
      const budget = a.project_capital_allocation || a.projectCapitalAllocation;
      const suppliers = a.supplier_density || a.supplierDensity || '—';
      const timeline = a.allocation_timeline || a.allocationTimeline || '—';
      const material = a.material_classification || a.materialClassification || '—';
      const fit = a.allocation_fit_percentage || a.allocationFit || '—';
      const justif = a.ai_justification || a.justification || '';
      const date = formatDate(a.created_at);
      const modelKey = getModelKey(model);
      const cardH = justif ? 54 : 38;
      checkPage(cardH + 4);

      doc.setFillColor(...(rowColors[modelKey] || [248,250,252]));
      doc.roundedRect(margin, y, contentW, cardH, 2, 2, 'F');
      doc.setFillColor(...(accentColors[modelKey] || [71,85,105]));
      doc.roundedRect(margin, y, 3, cardH, 1, 1, 'F');
      doc.setFillColor(...(accentColors[modelKey] || [71,85,105]));
      doc.circle(margin + 10, y + 7, 4, 'F');
      doc.setTextColor(255,255,255); doc.setFontSize(7); doc.setFont('helvetica','bold');
      doc.text(String(i + 1), margin + 10, y + 9, { align: 'center' });
      doc.setTextColor(...(accentColors[modelKey] || [71,85,105]));
      doc.setFontSize(8.5);
      doc.text(doc.splitTextToSize(model, contentW - 60)[0], margin + 17, y + 8);
      doc.setFontSize(6.5); doc.setFont('helvetica','normal'); doc.setTextColor(100,116,139);
      doc.text(date, pageW - margin - 2, y + 8, { align: 'right' });
      doc.setFillColor(...(accentColors[modelKey] || [71,85,105]));
      doc.roundedRect(pageW - margin - 28, y + 11, 26, 7, 2, 2, 'F');
      doc.setTextColor(255,255,255); doc.setFontSize(6.5); doc.setFont('helvetica','bold');
      doc.text(`FIT: ${fit}%`, pageW - margin - 15, y + 16, { align: 'center' });
      const col1 = margin + 6, col2 = margin + contentW / 2 + 2;
      const row1 = y + 18, row2 = y + 26;
      doc.setFontSize(6.5); doc.setFont('helvetica','bold'); doc.setTextColor(100,116,139);
      ['BUDGET','SUPPLIERS','TIMELINE','MATERIAL'].forEach((lbl, li) => {
        doc.text(lbl, li < 2 ? (li === 0 ? col1 : col2) : (li === 2 ? col1 : col2), li < 2 ? row1 : row2);
      });
      doc.setFont('helvetica','normal'); doc.setTextColor(15,23,42); doc.setFontSize(7.5);
      doc.text(formatIndianCurrency(budget), col1, row1 + 4.5);
      doc.text(String(suppliers), col2, row1 + 4.5);
      doc.text(String(timeline), col1, row2 + 4.5);
      doc.text(doc.splitTextToSize(String(material), contentW / 2 - 8)[0], col2, row2 + 4.5);
      if (justif) {
        const jY = y + 37;
        doc.setDrawColor(226,232,240); doc.setLineWidth(0.2);
        doc.line(margin + 5, jY, pageW - margin - 5, jY);
        doc.setFontSize(6.5); doc.setFont('helvetica','italic'); doc.setTextColor(100,116,139);
        doc.text(doc.splitTextToSize(`"${justif}"`, contentW - 10).slice(0, 2), margin + 5, jY + 4);
      }
      y += cardH + 4;
    });
  }

  if (feedbacks.length > 0) {
    checkPage(20); y += 4;
    doc.setFillColor(180, 83, 9);
    doc.roundedRect(margin, y, contentW, 9, 2, 2, 'F');
    doc.setTextColor(255,255,255); doc.setFontSize(9); doc.setFont('helvetica','bold');
    doc.text('USER FEEDBACK LOG', margin + 4, y + 6);
    y += 13;
    feedbacks.forEach((f, i) => {
      const rating = f.rating || 0, comments = f.comments || '';
      const modelStr = f.recommended_model || f.recommendedModel || '';
      const cardH = comments ? 32 : 22;
      checkPage(cardH + 4);
      doc.setFillColor(255,253,247); doc.roundedRect(margin, y, contentW, cardH, 2, 2, 'F');
      doc.setFillColor(180,83,9); doc.roundedRect(margin, y, 3, cardH, 1, 1, 'F');
      doc.circle(margin + 10, y + 7, 4, 'F');
      doc.setTextColor(255,255,255); doc.setFontSize(7); doc.setFont('helvetica','bold');
      doc.text(String(i + 1), margin + 10, y + 9, { align: 'center' });
      // Draw star rating as filled/outline circles (jsPDF default font can't render ★/☆)
      const starStartX = margin + 18;
      const starY      = y + 7;
      const starR      = 2.2;
      const starGap    = 5.5;
      for (let s = 0; s < 5; s++) {
        const cx = starStartX + s * starGap;
        if (s < rating) {
          doc.setFillColor(245, 158, 11);
          doc.circle(cx, starY, starR, 'F');
        } else {
          doc.setDrawColor(203, 213, 225);
          doc.setLineWidth(0.4);
          doc.circle(cx, starY, starR, 'S');
        }
      }
      doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(30,41,59);
      doc.text(`${rating}/5`, margin + 50, y + 9);
      doc.setFontSize(6.5); doc.setFont('helvetica','normal'); doc.setTextColor(100,116,139);
      doc.text(formatDate(f.created_at), pageW - margin - 2, y + 9, { align: 'right' });
      if (modelStr) {
        doc.setFontSize(6.5); doc.setFont('helvetica','bold'); doc.setTextColor(100,116,139);
        doc.text('Model: ', margin + 6, y + 16);
        doc.setFont('helvetica','normal'); doc.setTextColor(30,41,59);
        doc.text(doc.splitTextToSize(modelStr, contentW - 24)[0], margin + 18, y + 16);
      }
      if (comments) {
        const cY = y + (modelStr ? 20 : 14);
        doc.setFontSize(6.5); doc.setFont('helvetica','italic'); doc.setTextColor(71,85,105);
        doc.text(doc.splitTextToSize(`"${comments}"`, contentW - 10).slice(0, 2), margin + 6, cY);
      }
      y += cardH + 4;
    });
  }

  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(248,250,252); doc.rect(0, pageH - 8, pageW, 8, 'F');
    doc.setDrawColor(226,232,240); doc.setLineWidth(0.3); doc.line(0, pageH - 8, pageW, pageH - 8);
    doc.setFontSize(6.5); doc.setFont('helvetica','normal'); doc.setTextColor(148,163,184);
    doc.text('ProcureSmart DSS  —  Procurement Decision Support System', margin, pageH - 3.5);
    doc.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 3.5, { align: 'right' });
  }

  doc.save(`ProcureSmart_History_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ── HISTORY PAGE COMPONENT ────────────────────────────────────────────────────
export default function HistoryPage({ setStep }) {
  const [assessments, setAssessments] = useState([]);
  const [feedbacks,   setFeedbacks]   = useState([]);
  const [activeTab,   setActiveTab]   = useState('assessments');
  const [loading,     setLoading]     = useState(true);
  const [dbOnline,    setDbOnline]    = useState(false);
  const [pdfLoading,  setPdfLoading]  = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    let aData = [], fData = [], online = false;
    try {
      const [aRes, fRes] = await Promise.all([
        fetch('http://localhost:5000/api/history'),
        fetch('http://localhost:5000/api/feedback'),
      ]);
      const a = await aRes.json(), f = await fRes.json();
      if (a.success) { aData = a.data; online = true; }
      if (f.success) { fData = f.data; }
    } catch (_) {}
    setDbOnline(online);
    setAssessments(online ? aData : getLocalAssessments());
    setFeedbacks(online ? fData : getLocalFeedback());
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDownloadPDF = () => {
    setPdfLoading(true);
    setTimeout(() => { downloadPDF(assessments, feedbacks); setPdfLoading(false); }, 100);
  };

  // ── Assessment card (white/blue light theme) ────────────────────────────────
  const AssessmentCard = ({ a, idx }) => {
    const key       = getModelKey(a.recommended_model || a.recommendedModel || '');
    const meta      = MODEL_META[key];
    const model     = a.recommended_model || a.recommendedModel || '—';
    const budget    = a.project_capital_allocation || a.projectCapitalAllocation;
    const suppliers = a.supplier_density || a.supplierDensity;
    const timeline  = a.allocation_timeline || a.allocationTimeline;
    const fit       = a.allocation_fit_percentage || a.allocationFit;
    const justif    = a.ai_justification || a.justification;

    return (
      <div key={a.id || idx}
        className="rounded-2xl p-4 transition-all duration-200 cursor-default"
        style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.1)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: meta.accent }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: meta.accent }}>{model}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono-ps">
            <Clock size={10} /> {formatDate(a.created_at)}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {[
            { label: 'Budget',    value: formatIndianCurrencyUI(budget), bold: true },
            { label: 'Suppliers', value: suppliers },
            { label: 'Timeline',  value: timeline },
            { label: 'Fit Score', value: `${fit}%`, color: meta.accent },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
              <p className={`text-xs font-${stat.bold ? 'bold' : 'semibold'} text-slate-700`}
                style={stat.color ? { color: stat.color } : {}}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
        {justif && (
          <p className="text-[11px] text-slate-500 leading-relaxed italic font-mono-ps pt-3"
            style={{ borderTop: `1px solid ${meta.border}` }}>
            "{justif}"
          </p>
        )}
      </div>
    );
  };

  // ── Feedback card (white/blue light theme) ───────────────────────────────────
  const FeedbackCard = ({ f, idx }) => (
    <div key={f.id || idx}
      className="rounded-2xl p-4 transition-all duration-200 cursor-default"
      style={{ background: '#fff', border: '1px solid #e2e8f0' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-1.5">
          {[1,2,3,4,5].map(s => (
            <Star key={s} size={15} fill={s <= f.rating ? '#f59e0b' : 'transparent'}
              style={{ color: s <= f.rating ? '#f59e0b' : '#e2e8f0' }} />
          ))}
          <span className="ml-1 text-xs font-bold text-slate-500">{f.rating}/5</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono-ps">
          <Clock size={10} /> {formatDate(f.created_at)}
        </div>
      </div>
      {(f.recommended_model || f.recommendedModel) && (
        <p className="text-[10px] text-slate-500 mb-2">
          <span className="font-semibold">Model assessed: </span>
          {f.recommended_model || f.recommendedModel}
        </p>
      )}
      {f.comments ? (
        <div className="flex items-start gap-2 rounded-xl p-3 mt-1"
          style={{ background: '#f8fbff', border: '1px solid #dbeafe' }}>
          <MessageSquare size={11} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">{f.comments}</p>
        </div>
      ) : (

        <p className="text-xs text-slate-400 italic">No comments provided.</p>
      )}
    </div>
  );

  const GhostBtn = ({ onClick, children, disabled }) => (
    <button onClick={onClick} disabled={disabled} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-40">
      {children}
    </button>
  );

  return (
    <div className="space-y-5 mt-4 animate-fade-in">
      <div className="card-solid rounded-2xl p-4 flex flex-wrap justify-between items-center gap-3"
        style={{ boxShadow: '0 4px 20px rgba(37,99,235,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-600">
            <History size={17} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">Assessment History &amp; Feedback Log</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">All stored procurement evaluations and feedback</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading || loading || (assessments.length === 0 && feedbacks.length === 0)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40"
          >
            <FileDown size={13} />
            {pdfLoading ? 'Generating…' : 'Download PDF'}
          </button>
          <GhostBtn onClick={fetchAll}><RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh</GhostBtn>
          <GhostBtn onClick={() => setStep('wizard')}><ArrowLeft size={13} /> Back</GhostBtn>
        </div>
      </div>

      <div className="rounded-2xl px-5 py-3 flex items-center gap-3 text-xs"
        style={dbOnline
          ? { background: '#f0f6ff', border: '1px solid #bfdbfe' }
          : { background: '#fffbeb', border: '1px solid #fde68a' }}>
        {dbOnline ? (
          <>
            <Database size={14} className="text-blue-500 flex-shrink-0" />
            <div className="text-slate-600">
              <span className="font-semibold text-slate-700">PostgreSQL: </span>
              <span className="font-mono-ps text-blue-600">postgresql://localhost:5432/procuresmart</span>
              <span className="mx-2 text-slate-300">·</span>
              <span className="font-semibold text-slate-700">Tables: </span>
              <span className="font-mono-ps text-amber-600">assessments</span>
              <span className="mx-1 text-slate-300">&amp;</span>
              <span className="font-mono-ps text-green-600">feedback</span>
            </div>
          </>
        ) : (
          <>
            <HardDrive size={14} className="text-amber-500 flex-shrink-0" />
            <div className="text-amber-800">
              <span className="font-semibold">Offline Mode — </span>
              data saved to <span className="font-mono-ps font-bold">localStorage</span>.
              Start PostgreSQL on port 5432 to use the database.
            </div>
          </>
        )}
      </div>

      <div className="card-solid rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 4px 20px rgba(37,99,235,0.08)' }}>
        <div className="flex" style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fbff' }}>
          {[
            { id: 'assessments', label: 'Assessments', icon: <Sparkles size={13} />, count: assessments.length, activeColor: '#2563eb', activeBg: '#eff6ff' },
            { id: 'feedback',    label: 'Feedback',    icon: <Star size={13} />,     count: feedbacks.length,   activeColor: '#d97706', activeBg: '#fffbeb' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-5 py-3.5 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
              style={{
                color: activeTab === tab.id ? tab.activeColor : '#94a3b8',
                borderBottom: activeTab === tab.id ? `2px solid ${tab.activeColor}` : '2px solid transparent',
                background: activeTab === tab.id ? tab.activeBg : 'transparent',
              }}>
              {tab.icon} {tab.label}
              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-black"
                style={{
                  background: activeTab === tab.id ? `${tab.activeColor}22` : '#f1f5f9',
                  color: activeTab === tab.id ? tab.activeColor : '#94a3b8',
                }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="p-5">
          {loading && (
            <div className="flex items-center justify-center py-14 text-slate-400 text-xs gap-2">
              <RefreshCw size={14} className="animate-spin text-blue-400" /> Loading records from storage…
            </div>
          )}
          {!loading && activeTab === 'assessments' && (
            assessments.length === 0
              ? <div className="text-center py-14 text-slate-400 text-xs">No assessments yet. Run your first assessment to see it here.</div>
              : <div className="space-y-3">{assessments.map((a, i) => <AssessmentCard key={a.id || i} a={a} idx={i} />)}</div>
          )}
          {!loading && activeTab === 'feedback' && (
            feedbacks.length === 0
              ? <div className="text-center py-14 text-slate-400 text-xs">No feedback yet. Submit feedback from a results page to see it here.</div>
              : <div className="space-y-3">{feedbacks.map((f, i) => <FeedbackCard key={f.id || i} f={f} idx={i} />)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
