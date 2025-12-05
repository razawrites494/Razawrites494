import React, { useState, useEffect } from 'react';
import { Calculator, RotateCcw } from 'lucide-react';

export const CashCalculator: React.FC = () => {
  const denominations = [5000, 1000, 500, 100, 50, 20, 10];
  const [counts, setCounts] = useState<Record<number, string>>({});
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const newTotal = denominations.reduce((sum, denom) => {
      const count = parseInt(counts[denom] || '0', 10);
      return sum + (isNaN(count) ? 0 : count * denom);
    }, 0);
    setTotal(newTotal);
  }, [counts]);

  const handleChange = (denom: number, value: string) => {
    // Allow empty string for backspace
    if (value === '' || /^\d+$/.test(value)) {
      setCounts(prev => ({ ...prev, [denom]: value }));
    }
  };

  const handleReset = () => {
    setCounts({});
  };

  const formatPKR = (val: number) => 
    new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-600" />
          Cash Calculator
        </h3>
        <button 
          onClick={handleReset}
          className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      <div className="space-y-3">
        {denominations.map(denom => (
          <div key={denom} className="flex items-center gap-4">
            <div className="w-24 font-mono font-bold text-slate-700 text-right">
              {denom} <span className="text-slate-400 text-xs font-normal">PKR</span>
            </div>
            <div className="text-slate-400">×</div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={counts[denom] || ''}
              onChange={(e) => handleChange(denom, e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-right font-mono"
            />
            <div className="w-32 text-right font-mono font-medium text-slate-600">
              {formatPKR((parseInt(counts[denom] || '0', 10) || 0) * denom)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t-2 border-slate-100 flex items-center justify-between">
        <span className="text-lg font-bold text-slate-700">Total Cash</span>
        <span className="text-2xl font-bold text-emerald-600">{formatPKR(total)}</span>
      </div>
    </div>
  );
};