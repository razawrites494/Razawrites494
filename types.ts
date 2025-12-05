
export enum ShiftType {
  MORNING = 'Morning',
  EVENING = 'Evening',
  NIGHT = 'Night'
}

export interface Entry {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  shift: ShiftType;
  amount: number;
  timestamp: number;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  detail: string;
  remarks: string;
  timestamp: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role?: string;
  joinedDate: string;
}

export interface Advance {
  id: string;
  staffId: string; // ID of the staff member
  date: string;
  amount: number;
  staffName: string; // Keep name for display fallback
  remarks: string;
  timestamp: number;
}

export interface FinancialStats {
  totalRevenue: number;
  govtShare: number; // 85%
  
  // Staff calculations
  grossStaffShare: number; // 15%
  totalExpenses: number;
  totalAdvances: number;
  netStaffShareTotal: number; // 15% - expenses - advances
  perStaffShare: number; // net / staffCount
  staffCount: number;
}

export const DEFAULT_STAFF_COUNT = 15;
export const GOVT_PERCENTAGE = 0.85;
export const STAFF_PERCENTAGE = 0.15;
