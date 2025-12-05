
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  Building2, 
  Users, 
  UserCheck, 
  CalendarDays,
  Sparkles,
  PieChart,
  Receipt,
  HandCoins,
  Calculator
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import ReactMarkdown from 'react-markdown';

import { 
  ShiftType, 
  Entry, 
  Expense, 
  Advance,
  StaffMember,
  GOVT_PERCENTAGE, 
  STAFF_PERCENTAGE, 
  FinancialStats 
} from './types';
import { EntryForm } from './components/EntryForm';
import { StatsCard } from './components/StatsCard';
import { HistoryTable } from './components/HistoryTable';
import { ExpenseForm } from './components/ExpenseForm';
import { AdvanceForm } from './components/AdvanceForm';
import { CashCalculator } from './components/CashCalculator';
import { StaffManager } from './components/StaffManager';
import { generateLabReport } from './services/geminiService';

const App = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'income' | 'expenses' | 'advances' | 'staff' | 'calculator'>('income');

  const [entries, setEntries] = useState<Entry[]>(() => {
    const saved = localStorage.getItem('lab_entries');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('lab_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [advances, setAdvances] = useState<Advance[]>(() => {
    const saved = localStorage.getItem('lab_advances');
    return saved ? JSON.parse(saved) : [];
  });

  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('lab_staff_list');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('lab_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('lab_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('lab_advances', JSON.stringify(advances));
  }, [advances]);

  useEffect(() => {
    localStorage.setItem('lab_staff_list', JSON.stringify(staffList));
  }, [staffList]);

  // --- Helpers ---
  const addEntry = (date: string, shift: ShiftType, amount: number) => {
    const newEntry: Entry = {
      id: crypto.randomUUID(),
      date,
      shift,
      amount,
      timestamp: Date.now(),
    };
    setEntries(prev => [...prev, newEntry]);
    setAiReport(null);
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    setAiReport(null);
  };

  const addExpense = (date: string, amount: number, detail: string, remarks: string) => {
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      date,
      amount,
      detail,
      remarks,
      timestamp: Date.now()
    };
    setExpenses(prev => [...prev, newExpense]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addAdvance = (date: string, amount: number, staffId: string, staffName: string, remarks: string) => {
    const newAdvance: Advance = {
      id: crypto.randomUUID(),
      date,
      amount,
      staffId,
      staffName,
      remarks,
      timestamp: Date.now()
    };
    setAdvances(prev => [...prev, newAdvance]);
  };

  const deleteAdvance = (id: string) => {
    setAdvances(prev => prev.filter(e => e.id !== id));
  };

  const addStaff = (name: string) => {
    const newStaff: StaffMember = {
      id: crypto.randomUUID(),
      name,
      joinedDate: new Date().toISOString()
    };
    setStaffList(prev => [...prev, newStaff]);
  };

  const removeStaff = (id: string) => {
    if (window.confirm('Are you sure? This will delete the staff member but keep their historical records.')) {
      setStaffList(prev => prev.filter(s => s.id !== id));
    }
  };

  const formatPKR = (val: number) => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(val);

  // --- Calculations ---
  const filteredEntries = useMemo(() => entries.filter(e => e.date.startsWith(selectedMonth)), [entries, selectedMonth]);
  const filteredExpenses = useMemo(() => expenses.filter(e => e.date.startsWith(selectedMonth)), [expenses, selectedMonth]);
  const filteredAdvances = useMemo(() => advances.filter(e => e.date.startsWith(selectedMonth)), [advances, selectedMonth]);

  const stats: FinancialStats = useMemo(() => {
    const totalRevenue = filteredEntries.reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalAdvances = filteredAdvances.reduce((sum, e) => sum + e.amount, 0);

    const grossStaffShare = totalRevenue * STAFF_PERCENTAGE;
    const netStaffShareTotal = grossStaffShare - totalExpenses - totalAdvances;
    
    // Protect against division by zero
    const count = staffList.length > 0 ? staffList.length : 1;

    // IMPORTANT: In this model, Total Advances are deducted from the POOL to find the distributable amount?
    // Wait, the prompt says "amount will be deducted from 15 % staff share".
    // Usually, advances are personal debts. 
    // If deducted from the *pool*, everyone pays for it. If deducted from *personal share*, it's different.
    // Prompt: "this amount will be deducted from 15 % staff share" -> This usually means from the collective pool in simple accounting, OR it means the share is calculated, then advance is deducted.
    // Prompt earlier: "more over a cash calculator...".
    // Let's stick to the previous logic: Net Pool = Gross 15% - Expenses - Advances.
    // Then Per Staff = Net Pool / N.
    // However, usually Advances are personal.
    // If I take an advance, MY payout is lower.
    // Let's refine the "Per Staff Share" calculation.
    // If advances are deducted from the *Gross Pool*, then they are already accounted for.
    // BUT, if I want a "Personal Sheet", usually:
    // Share = (Gross 15% - Shared Expenses) / N
    // Net Pay = Share - Personal Advance.
    // Let's change the logic to be fairer and more standard for "Personal Sheets".
    // Revised Logic:
    // 1. Gross Pool = 15% of Revenue.
    // 2. Distributable Pool = Gross Pool - Shared Expenses (NOT Advances).
    // 3. Base Share Per Person = Distributable Pool / N.
    // 4. Personal Net Pay = Base Share Per Person - Personal Advances.
    
    // Let's recalculate based on this fairer model which supports "Personal Sheets" better.
    
    const distributablePoolAfterExpenses = grossStaffShare - totalExpenses;
    const baseSharePerStaff = distributablePoolAfterExpenses / count;

    // We will use these new values for the UI.
    // However, to keep types consistent with previous prompts without breaking changes:
    // We will store the "Base Share" in `perStaffShare`.
    
    return {
      totalRevenue,
      govtShare: totalRevenue * GOVT_PERCENTAGE,
      grossStaffShare,
      totalExpenses,
      totalAdvances, // This is just the sum of all advances
      netStaffShareTotal: distributablePoolAfterExpenses, // Pool available to divide (before personal advances)
      perStaffShare: baseSharePerStaff,
      staffCount: count
    };
  }, [filteredEntries, filteredExpenses, filteredAdvances, staffList.length]);

  const chartData = useMemo(() => {
    const days: Record<string, number> = {};
    filteredEntries.forEach(e => {
      const day = parseInt(e.date.split('-')[2]).toString(); 
      days[day] = (days[day] || 0) + e.amount;
    });

    return Object.keys(days).sort((a,b) => parseInt(a) - parseInt(b)).map(day => ({
      name: `Day ${day}`,
      amount: days[day]
    }));
  }, [filteredEntries]);

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    const report = await generateLabReport(filteredEntries, stats, selectedMonth);
    setAiReport(report);
    setIsGeneratingReport(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">LabCash Tracker</h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Staff Count Display (Read Only) */}
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1 px-3 border border-slate-200" title="Active Staff Members">
              <Users className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Staff:</span>
              <span className="text-sm font-bold text-slate-700">{staffList.length}</span>
            </div>

            {/* Month Picker */}
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1 border border-slate-200">
              <CalendarDays className="w-4 h-4 text-slate-500 ml-2" />
              <input 
                type="month" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer p-1"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="Total Revenue" 
            value={stats.totalRevenue} 
            icon={Wallet}
            colorClass="bg-blue-500"
          />
          <StatsCard 
            title="Govt Share (85%)" 
            value={stats.govtShare} 
            icon={Building2}
            colorClass="bg-emerald-500"
          />
          <StatsCard 
            title="Pool After Expenses" 
            value={stats.netStaffShareTotal}
            subValue={`Gross 15% - ${formatPKR(stats.totalExpenses)} Exp`}
            icon={Users}
            colorClass="bg-violet-500"
          />
          <StatsCard 
            title={`Base Share / Person`} 
            value={stats.perStaffShare} 
            subValue="Before personal advances"
            icon={UserCheck}
            colorClass="bg-amber-500"
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Input and History */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tabs */}
            <div className="flex p-1 bg-white rounded-xl border border-slate-200 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('income')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap
                  ${activeTab === 'income' ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Wallet className="w-4 h-4" /> Income
              </button>
              <button
                onClick={() => setActiveTab('expenses')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap
                  ${activeTab === 'expenses' ? 'bg-red-50 text-red-700 shadow-sm ring-1 ring-red-200' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Receipt className="w-4 h-4" /> Expenses
              </button>
              <button
                onClick={() => setActiveTab('advances')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap
                  ${activeTab === 'advances' ? 'bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-200' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <HandCoins className="w-4 h-4" /> Advances
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap
                  ${activeTab === 'staff' ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Users className="w-4 h-4" /> Staff
              </button>
              <button
                onClick={() => setActiveTab('calculator')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap
                  ${activeTab === 'calculator' ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Calculator className="w-4 h-4" /> Calculator
              </button>
            </div>

            {/* Tab Content */}
            <div className="transition-all duration-300">
              {activeTab === 'income' && (
                <div className="space-y-8">
                  <EntryForm onAddEntry={addEntry} />
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-slate-800">Daily Shifts & Revenue</h2>
                    </div>
                    <HistoryTable entries={filteredEntries} onDelete={deleteEntry} />
                  </div>
                </div>
              )}

              {activeTab === 'expenses' && (
                <ExpenseForm 
                  expenses={filteredExpenses} 
                  onAdd={addExpense} 
                  onDelete={deleteExpense} 
                />
              )}

              {activeTab === 'advances' && (
                <AdvanceForm 
                  advances={filteredAdvances} 
                  staffList={staffList}
                  onAdd={addAdvance} 
                  onDelete={deleteAdvance} 
                />
              )}

              {activeTab === 'staff' && (
                <StaffManager 
                  staffList={staffList}
                  advances={filteredAdvances}
                  perStaffShare={stats.perStaffShare}
                  onAddStaff={addStaff}
                  onRemoveStaff={removeStaff}
                  selectedMonth={selectedMonth}
                />
              )}

              {activeTab === 'calculator' && (
                <CashCalculator />
              )}
            </div>
          </div>

          {/* Right Column: Analytics & Reports */}
          <div className="space-y-8">
            
            {/* Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                 <PieChart className="w-5 h-5 text-slate-500" />
                 Revenue Trend
               </h3>
               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <Tooltip 
                        formatter={(value: number) => [formatPKR(value), 'Revenue']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{fill: '#f1f5f9'}}
                      />
                      <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* AI Report Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  AI Performance Report
                </h3>
              </div>
              
              {!aiReport && (
                <div className="text-center py-6">
                  <p className="text-sm text-indigo-700 mb-4">
                    Generate a detailed analysis of this month's shifts and revenue distribution using Gemini AI.
                  </p>
                  <button
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport || filteredEntries.length === 0}
                    className={`
                      px-4 py-2 rounded-lg font-medium text-white shadow-md transition-all
                      ${isGeneratingReport || filteredEntries.length === 0 
                        ? 'bg-indigo-300 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'}
                    `}
                  >
                    {isGeneratingReport ? 'Analyzing...' : 'Generate Analysis'}
                  </button>
                </div>
              )}

              {aiReport && (
                <div className="prose prose-sm prose-indigo max-w-none bg-white/50 p-4 rounded-lg">
                  <ReactMarkdown>{aiReport}</ReactMarkdown>
                  <button 
                    onClick={() => setAiReport(null)}
                    className="mt-4 text-xs font-medium text-indigo-500 hover:text-indigo-700 underline"
                  >
                    Close Report
                  </button>
                </div>
              )}
            </div>

            {/* Staff Summary */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h3 className="text-md font-semibold text-slate-800 mb-4">Staff Pool Calculation</h3>
               <ul className="space-y-3 text-sm text-slate-600">
                 <li className="flex justify-between border-b border-slate-100 pb-2">
                   <span>Gross Staff Pool (15%)</span>
                   <span className="font-mono font-medium text-slate-800">{formatPKR(stats.grossStaffShare)}</span>
                 </li>
                 <li className="flex justify-between border-b border-slate-100 pb-2 text-red-600">
                   <span>Shared Expenses</span>
                   <span className="font-mono font-medium">-{formatPKR(stats.totalExpenses)}</span>
                 </li>
                 <li className="flex justify-between pt-2">
                   <span className="font-bold text-slate-800">Distributable Pool</span>
                   <span className="font-mono font-bold text-blue-600">{formatPKR(stats.netStaffShareTotal)}</span>
                 </li>
                 <li className="flex justify-between pt-2 border-t border-slate-100">
                   <span>Base Share Per Person</span>
                   <span className="font-mono font-bold text-slate-800">{formatPKR(stats.perStaffShare)}</span>
                 </li>
                 <li className="flex justify-between pt-1 text-xs text-orange-600 italic">
                    <span>* Individual advances are deducted from personal shares.</span>
                 </li>
               </ul>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
