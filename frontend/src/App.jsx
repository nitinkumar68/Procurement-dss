import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Wizard from './pages/Wizard';
import Summary from './pages/Summary';
import HistoryPage from './pages/HistoryPage';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user } = useAuth();
  const [step, setStep] = useState('login');
  const [results, setResults] = useState(null);
  const [formData, setFormData] = useState({
    supplierDensity: 'Broad Market Tier',
    allocationTimeline: 'Standard Processing Window',
    materialClassification: 'Commodity Goods',
    projectCapitalAllocation: 30000000,
    pricingMatrixStatus: 'Fixed Initial List Price',
    sobShareOfBusiness: '100%',
    sobCustomValue: '',
  });

  useEffect(() => {
    if (user && step === 'login') setStep('wizard');
  }, [user]);

  const handleSignOut = () => {
    setStep('login');
    setResults(null);
  };

  const isAuthenticated = !!user;

  return (
    <>
      {/* ── Animated background ── */}
      <div className="ps-bg">
        <div className="ps-orb ps-orb-1" />
        <div className="ps-orb ps-orb-2" />
        <div className="ps-orb ps-orb-3" />
        <div className="ps-orb ps-orb-4" />
        <div className="ps-grid" />
      </div>

      {/* ── App content ── */}
      <div className="ps-content min-h-screen pb-12">
        {isAuthenticated && step !== 'login' && (
          <Navbar setStep={setStep} currentStep={step} onSignOut={handleSignOut} />
        )}
        <main className="max-w-5xl mx-auto p-4 md:p-6">
          {!isAuthenticated || step === 'login' ? (
            <Login onAuthSuccess={() => setStep('wizard')} />
          ) : (
            <>
              {step === 'wizard'  && <Wizard formData={formData} setFormData={setFormData} setResults={setResults} setStep={setStep} />}
              {step === 'summary' && <Summary results={results} setStep={setStep} />}
              {step === 'history' && <HistoryPage setStep={setStep} />}
            </>
          )}
        </main>
      </div>
    </>
  );
}