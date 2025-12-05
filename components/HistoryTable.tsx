import React, { useMemo } from 'react';
import { Trash2, Calendar } from 'lucide-react';
import { Entry, ShiftType } from '../types';

interface HistoryTableProps {
  entries: Entry[];
  onDelete: (id: string) => void;
}

const formatPKR = (amount: number) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0
  }).format(amount);
};

const shiftOrder: Record<ShiftType, number> = {
  [ShiftType.MORNING]: 1,
  [ShiftType.EVENING]: 2,
  [ShiftType.NIGHT]: 3,
};

export const HistoryTable: React.FC<HistoryTableProps> = ({ entries, onDelete }) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500">
        No entries found for this period. Add cash entry above.
      </div>
    );
  }

  // Group by Date for daily summation
  const groupedData = useMemo(() => {
    const groups: Record<string, { total: number; items: Entry[] }> = {};
    
    entries.forEach(entry => {
      if (!groups[entry.date]) {
        groups[entry.date] = { total: 0, items: [] };
      }
      groups[entry.date].items.push(entry);
      groups[entry.date].total += entry.amount;
    });

    return groups;
  }, [entries]);

  // Sort dates descending
  const sortedDates = Object.keys(groupedData).sort((a, b) => b.localeCompare(a));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold border-b border-slate-200">Date / Shift</th>
              <th className="p-4 font-semibold border-b border-slate-200 text-right">Amount (PKR)</th>
              <th className="p-4 font-semibold border-b border-slate-200 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedDates.map((date) => {
              const { total, items } = groupedData[date];
              // Sort items by shift order
              const sortedItems = [...items].sort((a, b) => shiftOrder[a.shift] - shiftOrder[b.shift]);
              
              return (
                <React.Fragment key={date}>
                  {/* Daily Summary Header */}
                  <tr className="bg-slate-50/80">
                    <td className="p-4 text-slate-800 font-bold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      <span className="text-xs font-normal text-slate-500 ml-2 uppercase tracking-wide">Daily Total</span>
                    </td>
                    <td className="p-4 text-slate-900 font-bold text-right text-lg">
                      {formatPKR(total)}
                    </td>
                    <td className="p-4"></td>
                  </tr>

                  {/* Shift Rows */}
                  {sortedItems.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors bg-white">
                      <td className="p-4 pl-8">
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full min-w-[80px] text-center
                          ${entry.shift === ShiftType.MORNING ? 'bg-amber-100 text-amber-700' : 
                            entry.shift === ShiftType.EVENING ? 'bg-orange-100 text-orange-700' : 
                            'bg-indigo-100 text-indigo-700'}`}>
                          {entry.shift}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 font-mono text-right">
                        {formatPKR(entry.amount)}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => onDelete(entry.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};