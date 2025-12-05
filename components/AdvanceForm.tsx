
import React, { useState } from 'react';
import { Plus, Trash2, HandCoins } from 'lucide-react';
import { Advance, StaffMember } from '../types';

interface AdvanceFormProps {
  advances: Advance[];
  staffList: StaffMember[];
  onAdd: (date: string, amount: number, staffId: string, staffName: string, remarks: string) => void;
  onDelete: (id: string) => void;
}

export const AdvanceForm: React.FC<AdvanceFormProps> = ({ advances, staffList, onAdd, onDelete }) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [remarks, setRemarks] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!date || isNaN(numAmount) || numAmount <= 0 || !selectedStaffId) return;
    
    const staffMember = staffList.find(s => s.id === selectedStaffId);
    const staffName = staffMember ? staffMember.name : 'Unknown Staff';

    onAdd(date, numAmount, selectedStaffId, staffName, remarks);
    setAmount('');
    setSelectedStaffId('');
    setRemarks('');
  };

  const formatPKR = (val: number) => 
    new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <HandCoins className="w-5 h-5 text-orange-600" />
          Record Advance
        </h3>
        <p className="text-sm text-slate-500 mb-4 bg-orange-50 p-2 rounded border border-orange-100">
          Note: Advances are deducted from the global Staff Share (15%) and recorded on the individual's sheet.
        </p>
        
        {staffList.length === 0 ? (
          <div className="text-center p-4 bg-slate-50 rounded-lg text-slate-500 text-sm">
            Please add staff members in the "Staff" tab before recording advances.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
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
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Staff Member</label>
                <select
                  required
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                >
                  <option value="">Select Staff Member</option>
                  {staffList.map(staff => (
                    <option key={staff.id} value={staff.id}>{staff.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Reason for advance..."
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Save Advance
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold border-b">Date</th>
                <th className="p-4 font-semibold border-b">Staff</th>
                <th className="p-4 font-semibold border-b text-right">Amount</th>
                <th className="p-4 font-semibold border-b text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {advances.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    No advances recorded for this month.
                  </td>
                </tr>
              ) : (
                advances.map((adv) => (
                  <tr key={adv.id} className="hover:bg-slate-50">
                    <td className="p-4 text-slate-600 text-sm whitespace-nowrap">{adv.date}</td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{adv.staffName}</div>
                      {adv.remarks && <div className="text-xs text-slate-400">{adv.remarks}</div>}
                    </td>
                    <td className="p-4 text-right font-mono font-medium text-orange-600">
                      -{formatPKR(adv.amount)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => onDelete(adv.id)}
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
