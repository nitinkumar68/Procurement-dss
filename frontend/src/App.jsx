import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Wizard from './pages/Wizard';
import Summary from './pages/Summary';

export default function App() {
  const [step, setStep] = useState('login'); // Global routing: 'login' | 'wizard' | 'summary'
  const [results, setResults] = useState(null);
  const [formData, setFormData] = useState({
    supplierDensity: 'Broad Market Tier',
    allocationTimeline: 'Standard Processing Window',
    materialClassification: 'Commodity Goods',
    projectCapitalAllocation: 30000000,
    pricingMatrixStatus: 'Fixed Initial List Price'
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans antialiased">
      {step !== 'login' && <Navbar setStep={setStep} />}
      
      <main className="max-w-5xl mx-auto p-4 md:p-6">
        {step === 'login' && (
          <Login onAuthSuccess={() => setStep('wizard')} />
        )}
        
        {step === 'wizard' && (
          <Wizard 
            formData={formData} 
            setFormData={setFormData} 
            setResults={setResults} 
            setStep={setStep} 
          />
        )}
        
        {step === 'summary' && (
          <Summary 
            results={results} 
            setStep={setStep} 
          />
        )}
      </main>
    </div>
  );
}