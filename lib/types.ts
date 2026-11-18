export type UserRole = 'customer' | 'technician' | 'admin';

export type ServiceCategory =
  | 'Smartphone'
  | 'Laptop & PC'
  | 'AC'
  | 'Refrigerator'
  | 'TV'
  | 'Washing Machine'
  | 'Electrical';

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  'Smartphone',
  'Laptop & PC',
  'AC',
  'Refrigerator',
  'TV',
  'Washing Machine',
  'Electrical',
];

export type ServiceMode = 'Home Visit' | 'Shop Drop-off';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type BookingStatus =
  | 'requested'
  | 'accepted'
  | 'rejected'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'paid';

/**
 * User schema - matches PLAN.md Section 3
 */
export interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  phone?: string;
  area?: string;
  bio?: string;
  createdAt: string;
}

/**
 * Service schema - matches PLAN.md Section 3
 */
export interface Service {
  _id: string;
  title: string;
  category: ServiceCategory;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: ServiceMode;
  serviceArea: string;
  technicianName: string;
  technicianEmail: string;
  approvalStatus: ApprovalStatus;
  isAvailable: boolean;
  createdAt: string;
}

/**
 * Booking schema - matches PLAN.md Section 3
 */
export interface Booking {
  _id: string;
  serviceId: string;
  serviceTitle: string;
  serviceImage: string;
  category: string;
  basePrice: number;
  technicianName: string;
  technicianEmail: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  preferredDate: string;
  problemDescription: string;
  status: BookingStatus;
  finalAmount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

/**
 * Payment schema - matches PLAN.md Section 3
 */
export interface Payment {
  _id: string;
  bookingId: string;
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  technicianName: string;
  technicianEmail: string;
  amount: number;
  currency: string; // 'usd'
  transactionId: string;
  stripeSessionId: string;
  paymentStatus: string; // 'paid'
  paidAt: string;
}

export interface ServiceFilterParams {
  q?: string;
  category?: string;
  mode?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export interface CustomerStats {
  totalRequests: number;
  activeJobs: number;
  completedJobs: number;
  totalSpent: number;
  chartData: { month: string; requests: number; spent: number }[];
}

export interface TechnicianStats {
  totalServices: number;
  approvedServices: number;
  pendingRequests: number;
  completedJobs: number;
  totalEarnings: number;
  chartData: { month: string; jobs: number; earnings: number }[];
}

export interface AdminStats {
  totalUsers: number;
  totalTechnicians: number;
  totalCustomers: number;
  pendingServices: number;
  totalBookings: number;
  totalRevenue: number;
  chartData: { month: string; revenue: number; bookings: number }[];
}

export interface PublicStats {
  totalServices: number;
  completedRepairs: number;
  expertTechnicians: number;
  happyCustomers: number;
  satisfactionRate: number;
}
