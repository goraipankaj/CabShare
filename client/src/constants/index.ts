export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

export const VEHICLE_TYPES = [
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'auto', label: 'Auto' },
  { value: 'bike', label: 'Bike' },
] as const;

export const GENDER_PREFERENCES = [
  { value: 'any', label: 'Any' },
  { value: 'male_only', label: 'Male Only' },
  { value: 'female_only', label: 'Female Only' },
] as const;

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  ongoing: 'bg-primary-100 text-primary-700',
  completed: 'bg-slate-100 text-slate-700',
  cancelled: 'bg-red-100 text-red-700',
  rejected: 'bg-red-100 text-red-700',
};
