export type UserRole = 'passenger' | 'driver' | 'admin';

export interface Address {
  _id?: string;
  label?: string;
  address: string;
  lat: number;
  lng: number;
}

export interface EmergencyContact {
  _id?: string;
  name: string;
  phone: string;
  relation?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: { url: string; publicId?: string };
  gender?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  status: 'active' | 'suspended' | 'banned';
  savedAddresses: Address[];
  favoriteDrivers: string[];
  emergencyContacts: EmergencyContact[];
  ratingAverage: number;
  ratingCount: number;
  referralCode: string;
  isDriverProfileCreated?: boolean;
  createdAt: string;
}

export interface Vehicle {
  _id: string;
  driver: string;
  type: 'hatchback' | 'sedan' | 'suv' | 'auto' | 'bike';
  brand: string;
  model: string;
  color: string;
  registrationNumber: string;
  seatingCapacity: number;
  year?: number;
  verificationStatus: 'pending' | 'approved' | 'rejected';
}

export interface Driver {
  _id: string;
  user: string | User;
  licenseNumber: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  isAvailable: boolean;
  activeVehicle?: Vehicle;
  totalEarnings: number;
  totalTrips: number;
  ratingAverage: number;
  ratingCount: number;
}

export interface RideLocation {
  address: string;
  lat: number;
  lng: number;
}

export interface Ride {
  _id: string;
  driver: User;
  vehicle: Vehicle;
  source: RideLocation;
  destination: RideLocation;
  route?: { distanceKm?: number; durationMin?: number; polyline?: string };
  departureDate: string;
  departureTime: string;
  totalSeats: number;
  availableSeats: number;
  pricePerSeat: number;
  genderPreference: 'any' | 'male_only' | 'female_only';
  instantBooking: boolean;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
}

export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';

export interface Booking {
  _id: string;
  ride: Ride;
  passenger: User;
  driver: User;
  seatsBooked: number;
  totalFare: number;
  status: BookingStatus;
  paymentStatus: 'unpaid' | 'paid' | 'refunded' | 'partially_refunded';
  paymentMethod: 'upi' | 'card' | 'wallet' | 'cash';
  createdAt: string;
}

export interface Wallet {
  _id: string;
  user: string;
  balance: number;
  currency: string;
}

export interface Transaction {
  _id: string;
  type: 'credit' | 'debit';
  category: string;
  amount: number;
  balanceAfter: number;
  description?: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
