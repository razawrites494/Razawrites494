
import React, { useState } from 'react';
import { Users, Plus, Trash2, FileText, X } from 'lucide-react';
import { StaffMember, Advance } from '../types';

interface StaffManagerProps {
  staffList: StaffMember[];
  advances: Advance[];
  perStaffShare: number;
  onAddStaff: (name: string) => void;
  onRemoveStaff: (id: string) => void;
  selectedMonth: string;
}

export const StaffManager: React.FC<StaffManagerProps> = ({ 
  staffList, 
  advances, 
  perStaffShare, 
  onAddStaff, 
  onRemoveStaff,
  selectedMonth
}) => {
  const [newStaffName, setNewStaffName] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;
    onAddStaff(newStaffName);
    setNewStaffName('');
  };

  const formatPKR = (val: number) => 
    new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(val);

  const selectedStaff = staffList.find(s => s.id === selectedStaffId);

  // Helper to get advances for a specific staff member
  const getStaffAdvances = (staffId: string) => advances.filter(a => a.staffId === staffId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Staff List Section */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Add Staff Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Manage Staff
          </h3>
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newStaffName}
              onChange={(e) => setNewStaffName(e.target.value)}
              placeholder="Enter staff name..."
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold border-b">Name</th>
                  <th className="p-4 font-semibold border-b text-right">Est. Share</th>
                  <th className="p-4 font-semibold border-b text-right">Advances</th>
                  <th className="p-4 font-semibold border-b text-right">Net Payable</th>
                  <th className="p-4 font-semibold border-b text-center">Sheet</th>
                  <th className="p-4 font-semibold border-b text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No staff members added.
                    </td>
                  </tr>
                ) : (
                  staffList.map((staff) => {
                    const myAdvances = getStaffAdvances(staff.id);
                    const totalAdvances = myAdvances.reduce((sum, a) => sum + a.amount, 0);
                    const netPayable = perStaffShare - totalAdvances;

                    return (
                      <tr key={staff.id} className="hover:bg-slate-50 group">
                        <td className="p-4 font-medium text-slate-800">{staff.name}</td>
                        <td className="p-4 text-right font-mono text-emerald-600">
                          {formatPKR(perStaffShare)}
                        </td>
                        <td className="p-4 text-right font-mono text-orange-600">
                          {totalAdvances > 0 ? `-${formatPKR(totalAdvances)}` : '-'}
                        </td>
                        <td className={`p-4 text-right font-mono font-bold ${netPayable < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                          {formatPKR(netPayable)}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedStaffId(staff.id)}
                            className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded text-xs font-medium transition-colors"
                          >
                            View Sheet
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => onRemoveStaff(staff.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                            title="Remove Staff"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Personal Sheet Detail View (Right Column) */}
      <div className="lg:col-span-1">
        {selectedStaff ? (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 sticky top-24 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
             {/* Sheet Header */}
            <div className="p-6 bg-slate-900 text-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                   <h2 className="text-xl font-bold">{selectedStaff.name}</h2>
                   <p className="text-slate-400 text-sm">Personal Ledger • {selectedMonth}</p>
                </div>
                <button 
                  onClick={() => setSelectedStaffId(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                 <div>
                    <p className="text-slate-400">Month Share</p>
                    <p className="text-emerald-400 font-mono font-semibold text-lg">{formatPKR(perStaffShare)}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-slate-400">Total Advances</p>
                    <p className="text-orange-400 font-mono font-semibold text-lg">
                      {formatPKR(getStaffAdvances(selectedStaff.id).reduce((sum, a) => sum + a.amount, 0))}
                    </p>
                 </div>
              </div>
            </div>
            
            {/* Transactions List */}
            <div className="flex-1 overflow-y-auto p-0 bg-slate-50">
               <div className="divide-y divide-slate-200">
                  {/* Credit Entry (Share) */}
                  <div className="p-4 bg-white border-l-4 border-emerald-500">
                     <div className="flex justify-between items-start">
                        <div>
                           <p className="font-semibold text-slate-800">Monthly Share Credit</p>
                           <p className="text-xs text-slate-500">{selectedMonth} Distribution</p>
                        </div>
                        <span className="font-mono text-emerald-600 font-medium">+{formatPKR(perStaffShare)}</span>
                     </div>
                  </div>

                  {/* Debit Entries (Advances) */}
                  {getStaffAdvances(selectedStaff.id).length > 0 ? (
                    getStaffAdvances(selectedStaff.id)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(adv => (
                      <div key={adv.id} className="p-4 bg-white border-l-4 border-orange-500 hover:bg-slate-50 transition-colors">
                         <div className="flex justify-between items-start">
                            <div>
                               <p className="font-semibold text-slate-800">Advance</p>
                               <p className="text-xs text-slate-500">{adv.date}</p>
                               {adv.remarks && <p className="text-xs text-slate-600 mt-1 italic">"{adv.remarks}"</p>}
                            </div>
                            <span className="font-mono text-orange-600 font-medium">-{formatPKR(adv.amount)}</span>
                         </div>
                      </div>
                    ))
                  ) : (
                     <div className="p-6 text-center text-slate-400 text-sm">
                        No advances taken this month.
                     </div>
                  )}
               </div>
            </div>

            {/* Footer Total */}
            <div className="p-4 bg-white border-t border-slate-200">
               <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Net Payable</span>
                  <span className={`text-xl font-bold font-mono ${
                    (perStaffShare - getStaffAdvances(selectedStaff.id).reduce((sum, a) => sum + a.amount, 0)) < 0 
                    ? 'text-red-600' 
                    : 'text-blue-600'
                  }`}>
                     {formatPKR(perStaffShare - getStaffAdvances(selectedStaff.id).reduce((sum, a) => sum + a.amount, 0))}
                  </span>
               </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 h-64 flex flex-col items-center justify-center text-slate-400 text-center p-6">
            <FileText className="w-10 h-10 mb-2 opacity-50" />
            <p className="font-medium">Select a staff member</p>
            <p className="text-sm">View personal ledger and details</p>
          </div>
        )}
      </div>
    </div>
  );
};
