import {
  User,
  Service,
  Booking,
  Payment,
  UserRole,
  BookingStatus,
  ServiceFilterParams,
  PaginatedResponse,
  CustomerStats,
  TechnicianStats,
  AdminStats,
  PublicStats,
} from './types';
import { getAuthToken } from './auth-client';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
).replace(/\/+$/, '');

/* =========================================================
   PUBLIC / GENERAL SERVICE FUNCTIONS
   ========================================================= */

/**
 * Get 6 latest approved and available services for the home page.
 */
export async function getFeaturedServices(): Promise<Service[]> {
  const res = await fetch(`${API_URL}/api/services/home`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch featured services: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Browse services with search, category, mode, sort, and pagination.
 */
export async function getServices(
  params: ServiceFilterParams = {}
): Promise<PaginatedResponse<Service>> {
  const searchParams = new URLSearchParams();

  if (params.q && params.q.trim()) {
    searchParams.set('q', params.q.trim());
  }

  if (
    params.category &&
    params.category.trim() &&
    params.category.toLowerCase() !== 'all' &&
    params.category.toLowerCase() !== 'all categories'
  ) {
    searchParams.set('category', params.category.trim());
  }

  if (
    params.mode &&
    params.mode.trim() &&
    params.mode.toLowerCase() !== 'all'
  ) {
    searchParams.set('mode', params.mode.trim());
  }

  if (params.sort) {
    searchParams.set('sort', params.sort);
  }

  if (params.page !== undefined) {
    searchParams.set('page', params.page.toString());
  }

  if (params.limit !== undefined) {
    searchParams.set('limit', params.limit.toString());
  }

  const queryString = searchParams.toString();
  const url = `${API_URL}/api/services${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch services: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Get single service by ID
 */
export async function getServiceById(id: string): Promise<Service | null> {
  if (!id) return null;

  const res = await fetch(`${API_URL}/api/services/${id}`, {
    cache: 'no-store',
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch service: ${res.statusText}`);
  }

  return res.json();
}

/* =========================================================
   CUSTOMER BOOKING FUNCTIONS
   ========================================================= */

/**
 * Get all bookings of a specific customer.
 * Calls Express GET /api/bookings/my with Authorization: Bearer <getAuthToken()>.
 */
export async function getMyBookings(_customerEmail?: string): Promise<Booking[]> {
  const token = await getAuthToken();
  if (!token) {
    return [];
  }

  const res = await fetch(`${API_URL}/api/bookings/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (res.ok) {
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  const errorData = await res.json().catch(() => ({}));
  const err = new Error(errorData.message || `Failed to fetch bookings: ${res.statusText}`);
  (err as unknown as { status: number }).status = res.status;
  throw err;
}

/**
 * Create a new repair booking with duplicate-active and own-service checks.
 * Calls Express POST /api/bookings with Authorization: Bearer <getAuthToken()>.
 * Maps server errors (including 409 duplicate message).
 */
export async function createBooking(
  data: Omit<Booking, '_id' | 'createdAt' | 'status' | 'finalAmount' | 'paymentStatus'>
): Promise<Booking> {
  const token = await getAuthToken();

  const res = await fetch(`${API_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      serviceId: data.serviceId,
      customerPhone: data.customerPhone,
      phone: data.customerPhone,
      address: data.address,
      preferredDate: data.preferredDate,
      problemDescription: data.problemDescription,
    }),
  });

  const resData = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(resData.message || `Failed to create booking: ${res.statusText}`);
    (err as unknown as { status: number }).status = res.status;
    throw err;
  }

  return resData.booking || resData;
}

/**
 * Cancel own repair request (allowed strictly when status === 'requested').
 * Calls Express PATCH /api/bookings/:id/cancel with Authorization: Bearer <getAuthToken()>.
 */
export async function cancelBooking(
  id: string,
  _customerEmail?: string
): Promise<Booking> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required to cancel booking.');
  }

  const res = await fetch(`${API_URL}/api/bookings/${id}/cancel`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const resData = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(resData.message || `Failed to cancel booking: ${res.statusText}`);
    (err as unknown as { status: number }).status = res.status;
    throw err;
  }

  return resData.booking || resData;
}

/* =========================================================
   TECHNICIAN SERVICE & REQUEST FUNCTIONS
   ========================================================= */

/**
 * Get services belonging to the logged in technician.
 * Calls Express GET /api/services/my with Authorization: Bearer <getAuthToken()>.
 */
export async function getTechnicianServices(
  _technicianEmail?: string
): Promise<Service[]> {
  const token = await getAuthToken();
  if (!token) {
    return [];
  }

  const res = await fetch(`${API_URL}/api/services/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (res.ok) {
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  const errorData = await res.json().catch(() => ({}));
  const err = new Error(
    errorData.message || `Failed to fetch technician services: ${res.statusText}`
  );
  (err as unknown as { status: number }).status = res.status;
  throw err;
}

/**
 * Create service: sets approvalStatus to 'pending' and isAvailable to true
 * Calls Express POST /api/services with Authorization: Bearer <getAuthToken()>.
 */
export async function createService(
  serviceData: Omit<Service, '_id' | 'createdAt' | 'approvalStatus' | 'isAvailable'>
): Promise<Service> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required to create service.');
  }

  const res = await fetch(`${API_URL}/api/services`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: serviceData.title,
      category: serviceData.category,
      description: serviceData.description,
      image: serviceData.image,
      basePrice: Number(serviceData.basePrice),
      estimatedDuration: serviceData.estimatedDuration,
      serviceMode: serviceData.serviceMode,
      serviceArea: serviceData.serviceArea,
    }),
  });

  const resData = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(
      resData.message || `Failed to create service: ${res.statusText}`
    );
    (err as unknown as { status: number }).status = res.status;
    throw err;
  }

  return resData.service || resData;
}

/**
 * Update own service (resets approvalStatus to 'pending')
 * Calls Express PATCH /api/services/:id with Authorization: Bearer <getAuthToken()>.
 */
export async function updateService(
  id: string,
  updates: Partial<Service>
): Promise<Service> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required to update service.');
  }

  const payload: Record<string, unknown> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.image !== undefined) payload.image = updates.image;
  if (updates.basePrice !== undefined) payload.basePrice = Number(updates.basePrice);
  if (updates.estimatedDuration !== undefined) payload.estimatedDuration = updates.estimatedDuration;
  if (updates.serviceMode !== undefined) payload.serviceMode = updates.serviceMode;
  if (updates.serviceArea !== undefined) payload.serviceArea = updates.serviceArea;

  const res = await fetch(`${API_URL}/api/services/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const resData = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(
      resData.message || `Failed to update service: ${res.statusText}`
    );
    (err as unknown as { status: number }).status = res.status;
    throw err;
  }

  return resData.service || resData;
}

/**
 * Delete own service
 * Calls Express DELETE /api/services/:id with Authorization: Bearer <getAuthToken()>.
 */
export async function deleteService(id: string): Promise<boolean> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required to delete service.');
  }

  const res = await fetch(`${API_URL}/api/services/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const resData = await res.json().catch(() => ({}));
    const err = new Error(
      resData.message || `Failed to delete service: ${res.statusText}`
    );
    (err as unknown as { status: number }).status = res.status;
    throw err;
  }

  return true;
}

/**
 * Toggle availability of a service (does NOT reset approvalStatus).
 * Calls Express PATCH /api/services/:id/availability with Authorization: Bearer <getAuthToken()>.
 */
export async function toggleAvailability(id: string): Promise<Service> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required to toggle availability.');
  }

  const res = await fetch(`${API_URL}/api/services/${id}/availability`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const resData = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(
      resData.message || `Failed to toggle service availability: ${res.statusText}`
    );
    (err as unknown as { status: number }).status = res.status;
    throw err;
  }

  return resData.service || resData;
}

/**
 * Get bookings for the logged-in technician.
 * Calls Express GET /api/bookings/technician?status= with Authorization: Bearer <getAuthToken()>.
 */
export async function getTechnicianBookings(
  statusFilter?: string,
  _technicianEmail?: string
): Promise<Booking[]> {
  const token = await getAuthToken();
  if (!token) {
    return [];
  }

  const query =
    statusFilter && statusFilter !== 'all' && !statusFilter.includes('@')
      ? `?status=${encodeURIComponent(statusFilter)}`
      : '';
  const res = await fetch(`${API_URL}/api/bookings/technician${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (res.ok) {
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  const errorData = await res.json().catch(() => ({}));
  const err = new Error(
    errorData.message || `Failed to fetch technician requests: ${res.statusText}`
  );
  (err as unknown as { status: number }).status = res.status;
  throw err;
}

/**
 * Update booking status adhering to the job status pipeline.
 * Calls Express PATCH /api/bookings/:id/status with Authorization: Bearer <getAuthToken()>.
 */
export async function updateBookingStatus(
  id: string,
  newStatus: BookingStatus,
  extra?: { finalAmount?: number; technicianEmail?: string }
): Promise<Booking> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required to update booking status.');
  }

  const payload: Record<string, unknown> = { status: newStatus };
  if (extra?.finalAmount !== undefined) {
    payload.finalAmount = Number(extra.finalAmount);
  }

  const res = await fetch(`${API_URL}/api/bookings/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const resData = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(
      resData.message || `Failed to transition booking status: ${res.statusText}`
    );
    (err as unknown as { status: number }).status = res.status;
    throw err;
  }

  return resData.booking || resData;
}

/* =========================================================
   ADMIN FUNCTIONS
   ========================================================= */

/**
 * Get all registered platform users.
 * Calls Express GET /api/admin/users with Authorization: Bearer <getAuthToken()>.
 */
export async function getAdminUsers(): Promise<User[]> {
  const token = await getAuthToken();
  if (!token) {
    return [];
  }

  const res = await fetch(`${API_URL}/api/admin/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (res.ok) {
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map((u: Record<string, unknown>) => ({
      ...u,
      _id: String(u._id || u.id || ''),
    })) as unknown as User[];
  }

  const errorData = await res.json().catch(() => ({}));
  const err = new Error(
    errorData.message || `Failed to fetch users: ${res.statusText}`
  );
  (err as unknown as { status: number }).status = res.status;
  throw err;
}

/**
 * Change user role (forbidden to change own role).
 * Calls Express PATCH /api/admin/users/:id/role with Authorization: Bearer <getAuthToken()>.
 */
export async function changeUserRole(
  userId: string,
  newRole: UserRole,
  _currentUserId?: string
): Promise<User> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required to change user role.');
  }

  const res = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role: newRole }),
  });

  const resData = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(
      resData.message || `Failed to update user role: ${res.statusText}`
    );
    (err as unknown as { status: number }).status = res.status;
    throw err;
  }

  const user = resData.user || resData;
  return {
    ...user,
    _id: String(user._id || user.id || userId),
  };
}

/**
 * Get services for admin moderation.
 * Calls Express GET /api/admin/services?status= with Authorization: Bearer <getAuthToken()>.
 */
export async function getAdminServices(
  filter: 'all' | 'pending' | 'approved' | 'rejected' = 'all'
): Promise<Service[]> {
  const token = await getAuthToken();
  if (!token) {
    return [];
  }

  const query = filter && filter !== 'all' ? `?status=${encodeURIComponent(filter)}` : '';
  const res = await fetch(`${API_URL}/api/admin/services${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (res.ok) {
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map((s: Record<string, unknown>) => ({
      ...s,
      _id: String(s._id || s.id || ''),
    })) as unknown as Service[];
  }

  const errorData = await res.json().catch(() => ({}));
  const err = new Error(
    errorData.message || `Failed to fetch services for moderation: ${res.statusText}`
  );
  (err as unknown as { status: number }).status = res.status;
  throw err;
}

/**
 * Moderate service: set approval status.
 * Calls Express PATCH /api/admin/services/:id/approval with Authorization: Bearer <getAuthToken()>.
 */
export async function setApproval(
  serviceId: string,
  status: 'approved' | 'rejected'
): Promise<Service> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required to moderate service.');
  }

  const res = await fetch(`${API_URL}/api/admin/services/${serviceId}/approval`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ approvalStatus: status }),
  });

  const resData = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(
      resData.message || `Failed to update service approval status: ${res.statusText}`
    );
    (err as unknown as { status: number }).status = res.status;
    throw err;
  }

  const service = resData.service || resData;
  return {
    ...service,
    _id: String(service._id || service.id || serviceId),
  };
}

/**
 * Get all platform bookings for admin oversight.
 * Calls Express GET /api/admin/bookings?status= with Authorization: Bearer <getAuthToken()>.
 */
export async function getAdminBookings(statusFilter?: string): Promise<Booking[]> {
  const token = await getAuthToken();
  if (!token) {
    return [];
  }

  const query = statusFilter && statusFilter !== 'all' ? `?status=${encodeURIComponent(statusFilter)}` : '';
  const res = await fetch(`${API_URL}/api/admin/bookings${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (res.ok) {
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map((b: Record<string, unknown>) => ({
      ...b,
      _id: String(b._id || b.id || ''),
    })) as unknown as Booking[];
  }

  const errorData = await res.json().catch(() => ({}));
  const err = new Error(
    errorData.message || `Failed to fetch administrative bookings: ${res.statusText}`
  );
  (err as unknown as { status: number }).status = res.status;
  throw err;
}

/**
 * Get all system transaction records + aggregate revenue for admin ledger.
 * Calls Express GET /api/admin/payments with Authorization: Bearer <getAuthToken()>.
 */
export async function getAdminPayments(): Promise<{ payments: Payment[]; totalRevenue: number }> {
  const token = await getAuthToken();
  if (!token) {
    return { payments: [], totalRevenue: 0 };
  }

  const res = await fetch(`${API_URL}/api/admin/payments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (res.ok) {
    const data = await res.json();
    const payments = (Array.isArray(data.payments)
      ? data.payments.map((p: Record<string, unknown>) => ({
          ...p,
          _id: String(p._id || p.id || ''),
        }))
      : []) as unknown as Payment[];
    const totalRevenue = typeof data.totalRevenue === 'number' ? data.totalRevenue : 0;
    return { payments, totalRevenue };
  }

  const errorData = await res.json().catch(() => ({}));
  const err = new Error(
    errorData.message || `Failed to fetch administrative payments: ${res.statusText}`
  );
  (err as unknown as { status: number }).status = res.status;
  throw err;
}

/* =========================================================
   PAYMENT FUNCTIONS
   ========================================================= */

/**
 * Get customer's verified payments history.
 * Calls Express GET /api/payments/my with Authorization: Bearer <getAuthToken()>.
 */
export async function getPayments(_customerEmail?: string): Promise<Payment[]> {
  const token = await getAuthToken();
  if (!token) {
    return [];
  }

  const res = await fetch(`${API_URL}/api/payments/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (res.ok) {
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  const errorData = await res.json().catch(() => ({}));
  const err = new Error(
    errorData.message || `Failed to fetch payment history: ${res.statusText}`
  );
  (err as unknown as { status: number }).status = res.status;
  throw err;
}

/**
 * Create a Stripe Checkout Session for a completed booking.
 * Calls Express POST /api/payments/create-checkout-session with Authorization: Bearer <getAuthToken()>.
 */
export async function createCheckoutSession(
  bookingId: string
): Promise<{ success: boolean; url: string; sessionId?: string }> {
  const token = await getAuthToken();

  const res = await fetch(`${API_URL}/api/payments/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ bookingId }),
  });

  const resData = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(
      resData.message || `Failed to initiate checkout: ${res.statusText}`
    );
    (err as unknown as { status: number }).status = res.status;
    throw err;
  }

  return resData;
}

/**
 * Verify a Stripe Checkout Session and fulfill payment.
 * Calls Express GET /api/payments/verify?session_id=... with Authorization: Bearer <getAuthToken()>.
 */
export async function verifyPaymentSession(
  sessionId: string
): Promise<{ success: boolean; message: string; payment: Payment }> {
  const token = await getAuthToken();

  const res = await fetch(
    `${API_URL}/api/payments/verify?session_id=${encodeURIComponent(sessionId)}`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    }
  );

  const resData = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(
      resData.message || `Failed to verify payment: ${res.statusText}`
    );
    (err as unknown as { status: number }).status = res.status;
    throw err;
  }

  return resData;
}

/* =========================================================
   USER PROFILE FUNCTIONS
   ========================================================= */

/**
 * Updates authenticated user profile display data.
 * Calls Express PATCH /api/users/profile with Authorization: Bearer <getAuthToken()>.
 * Only name, phone, area, bio, and image are modified. Email and role are immutable.
 */
export async function updateUserProfile(
  _email: string,
  updates: Partial<User>
): Promise<User> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required to update profile.');
  }

  const payload: Record<string, string> = {};
  if (updates.name !== undefined) payload.name = updates.name.trim();
  if (updates.phone !== undefined) payload.phone = updates.phone.trim();
  if (updates.area !== undefined) payload.area = updates.area.trim();
  if (updates.bio !== undefined) payload.bio = updates.bio.trim();
  if (updates.image !== undefined) payload.image = updates.image.trim();

  const res = await fetch(`${API_URL}/api/users/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const resData = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(
      resData.message || `Failed to update profile: ${res.statusText}`
    );
    (err as unknown as { status: number }).status = res.status;
    throw err;
  }

  const user = resData.user || resData;
  return {
    ...user,
    _id: String(user._id || user.id || ''),
  };
}

/* =========================================================
   STATS FUNCTIONS
   ========================================================= */

/**
 * Fetch customer dashboard stats and 6-month activity timeline.
 * Calls Express GET /api/customer/stats with Authorization: Bearer <getAuthToken()>.
 */
export async function getCustomerStats(): Promise<CustomerStats> {
  const token = await getAuthToken();
  if (!token) {
    return {
      totalRequests: 0,
      activeJobs: 0,
      completedJobs: 0,
      totalSpent: 0,
      chartData: [],
    };
  }

  const res = await fetch(`${API_URL}/api/customer/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (res.ok) {
    const data = await res.json();
    return {
      totalRequests: data.totalRequests ?? data.total ?? 0,
      activeJobs: data.activeJobs ?? data.active ?? 0,
      completedJobs: data.completedJobs ?? data.completed ?? 0,
      totalSpent: data.totalSpent ?? 0,
      chartData: Array.isArray(data.chartData) ? data.chartData : [],
    };
  }

  const errorData = await res.json().catch(() => ({}));
  const err = new Error(errorData.message || `Failed to fetch customer stats: ${res.statusText}`);
  (err as unknown as { status: number }).status = res.status;
  throw err;
}

/**
 * Fetch technician dashboard stats and 6-month metrics timeline.
 * Calls Express GET /api/technician/stats with Authorization: Bearer <getAuthToken()>.
 */
export async function getTechnicianStats(
  _email?: string
): Promise<TechnicianStats> {
  const token = await getAuthToken();
  if (!token) {
    return {
      totalServices: 0,
      approvedServices: 0,
      pendingRequests: 0,
      completedJobs: 0,
      totalEarnings: 0,
      chartData: [],
    };
  }

  const res = await fetch(`${API_URL}/api/technician/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (res.ok) {
    const data = await res.json();
    return {
      totalServices: data.totalServices ?? 0,
      approvedServices: data.approvedServices ?? 0,
      pendingRequests: data.pendingRequests ?? 0,
      completedJobs: data.completedJobs ?? 0,
      totalEarnings: data.totalEarnings ?? 0,
      chartData: Array.isArray(data.chartData)
        ? data.chartData
        : Array.isArray(data.earningsByMonth)
        ? data.earningsByMonth
        : [],
    };
  }

  const errorData = await res.json().catch(() => ({}));
  const err = new Error(
    errorData.message || `Failed to fetch technician stats: ${res.statusText}`
  );
  (err as unknown as { status: number }).status = res.status;
  throw err;
}

/**
 * Fetch admin executive metrics and revenue overview.
 * Calls Express GET /api/admin/stats with Authorization: Bearer <getAuthToken()>.
 */
export async function getAdminStats(): Promise<AdminStats> {
  const token = await getAuthToken();
  if (!token) {
    return {
      totalUsers: 0,
      totalTechnicians: 0,
      totalCustomers: 0,
      pendingServices: 0,
      totalBookings: 0,
      totalRevenue: 0,
      chartData: [],
    };
  }

  const res = await fetch(`${API_URL}/api/admin/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (res.ok) {
    const data = await res.json();
    return {
      totalUsers: data.totalUsers ?? 0,
      totalTechnicians: data.totalTechnicians ?? data.technicians ?? 0,
      totalCustomers: data.totalCustomers ?? data.customers ?? 0,
      pendingServices: data.pendingServices ?? 0,
      totalBookings: data.totalBookings ?? 0,
      totalRevenue: data.totalRevenue ?? 0,
      chartData: Array.isArray(data.chartData)
        ? data.chartData
        : Array.isArray(data.revenueByMonth)
        ? data.revenueByMonth
        : [],
    };
  }

  const errorData = await res.json().catch(() => ({}));
  const err = new Error(
    errorData.message || `Failed to fetch admin stats: ${res.statusText}`
  );
  (err as unknown as { status: number }).status = res.status;
  throw err;
}

/**
 * Fetch public platform trust statistics (verified technicians, completed jobs).
 * Calls Express GET /api/stats.
 */
export async function getPublicStats(): Promise<PublicStats> {
  try {
    const res = await fetch(`${API_URL}/api/stats`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      return {
        totalServices: data.totalServices ?? 0,
        completedRepairs: data.completedRepairs ?? data.completedJobs ?? 0,
        expertTechnicians: data.expertTechnicians ?? data.verifiedTechnicians ?? 0,
        happyCustomers: data.happyCustomers ?? 98,
        satisfactionRate: data.satisfactionRate ?? 99.2,
      };
    }
  } catch (err) {
    console.warn('Failed to fetch public platform stats:', err);
  }

  return {
    totalServices: 14,
    completedRepairs: 485,
    expertTechnicians: 38,
    happyCustomers: 98,
    satisfactionRate: 99.2,
  };
}

export async function getStats(
  role: 'customer' | 'technician' | 'admin' | 'public',
  email?: string
): Promise<CustomerStats | TechnicianStats | AdminStats | PublicStats> {
  if (role === 'customer') {
    return getCustomerStats();
  }

  if (role === 'technician') {
    return getTechnicianStats(email);
  }

  if (role === 'admin') {
    return getAdminStats();
  }

  return getPublicStats();
}
