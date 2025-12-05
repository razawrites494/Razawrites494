import React, { useState } from 'react';
import { Plus, Trash2, Receipt } from 'lucide-react';
import { Expense } from '../types';

interface ExpenseFormProps {
  expenses: Expense[];
  onAdd: (date: string, amount: number, detail: string, remarks: string) => void;
  onDelete: (id: string) => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ expenses, onAdd, onDelete }) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<string>('');
  const [detail, setDetail] = useState('');
  const [remarks, setRemarks] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!date || isNaN(numAmount) || numAmount <= 0 || !detail) return;
    
    onAdd(date, numAmount, detail, remarks);
    setAmount('');
    setDetail('');
    setRemarks('');
  };

  const formatPKR = (val: number) => 
    new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-red-600" />
          Add Expense
        </h3>
        <p className="text-sm text-slate-500 mb-4 bg-red-50 p-2 rounded border border-red-100">
          Note: Expenses are deducted from the Staff Share (15%).
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Expense Detail</label>
              <input
                type="text"
                required
                placeholder="e.g., Tea, Cleaning Items"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Remarks (Optional)</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Save Expense
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold border-b">Date</th>
                <th className="p-4 font-semibold border-b">Detail</th>
                <th className="p-4 font-semibold border-b text-right">Amount</th>
                <th className="p-4 font-semibold border-b text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    No expenses recorded for this month.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="p-4 text-slate-600 text-sm whitespace-nowrap">{exp.date}</td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{exp.detail}</div>
                      {exp.remarks && <div className="text-xs text-slate-400">{exp.remarks}</div>}
                    </td>
                    <td className="p-4 text-right font-mono font-medium text-red-600">
                      -{formatPKR(exp.amount)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => onDelete(exp.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};