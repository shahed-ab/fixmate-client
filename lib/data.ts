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
import {
  mockUsers,
  mockServices,
  mockBookings,
  mockPayments,
} from './mock-data';

const DELAY_MS = 300;

const delay = (ms = DELAY_MS) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const STORAGE_KEYS = {
  USERS: 'fixmate_mock_users',
  SERVICES: 'fixmate_mock_services',
  BOOKINGS: 'fixmate_mock_bookings',
  PAYMENTS: 'fixmate_mock_payments',
};

// In-memory cache
let inMemoryUsers: User[] = [...mockUsers];
let inMemoryServices: Service[] = [...mockServices];
let inMemoryBookings: Booking[] = [...mockBookings];
let inMemoryPayments: Payment[] = [...mockPayments];

// Helper to check client environment
const isClient = typeof window !== 'undefined';

function initStore() {
  if (!isClient) return;

  try {
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (storedUsers) {
      inMemoryUsers = JSON.parse(storedUsers);
    } else {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
    }

    const storedServices = localStorage.getItem(STORAGE_KEYS.SERVICES);
    if (storedServices) {
      inMemoryServices = JSON.parse(storedServices);
    } else {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(mockServices));
    }

    const storedBookings = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (storedBookings) {
      inMemoryBookings = JSON.parse(storedBookings);
    } else {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(mockBookings));
    }

    const storedPayments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (storedPayments) {
      inMemoryPayments = JSON.parse(storedPayments);
    } else {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(mockPayments));
    }
  } catch (err) {
    console.warn('FixMate localStorage init warning:', err);
  }
}

// Trigger initial load on module evaluation
if (isClient) {
  initStore();
}

function persistStore() {
  if (!isClient) return;
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(inMemoryUsers));
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(inMemoryServices));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(inMemoryBookings));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(inMemoryPayments));
  } catch (err) {
    console.warn('FixMate localStorage persist warning:', err);
  }
}

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
 * Get all bookings of a specific customer (or all if email omitted).
 * Calls Express GET /api/bookings/my with Authorization: Bearer <getAuthToken()>.
 */
export async function getMyBookings(customerEmail?: string): Promise<Booking[]> {
  const token = await getAuthToken();

  if (token) {
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

  // Fallback to in-memory if no token is available
  await delay();
  if (!customerEmail) {
    return [...inMemoryBookings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  return inMemoryBookings
    .filter((b) => b.customerEmail.toLowerCase() === customerEmail.toLowerCase())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

  const created = resData.booking || resData;
  if (created) {
    inMemoryBookings.unshift(created);
    persistStore();
  }

  return created;
}

/**
 * Cancel own repair request (allowed strictly when status === 'requested').
 * Calls Express PATCH /api/bookings/:id/cancel with Authorization: Bearer <getAuthToken()>.
 */
export async function cancelBooking(
  id: string,
  customerEmail?: string
): Promise<Booking> {
  const token = await getAuthToken();

  if (token) {
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

    const updated = resData.booking || resData;
    const idx = inMemoryBookings.findIndex((b) => b._id === id);
    if (idx !== -1 && updated) {
      inMemoryBookings[idx] = updated;
      persistStore();
    }

    return updated;
  }

  // Fallback to in-memory if no token is available
  await delay();

  const bookingIndex = inMemoryBookings.findIndex((b) => b._id === id);
  if (bookingIndex === -1) {
    throw new Error('Booking not found.');
  }

  const booking = inMemoryBookings[bookingIndex];

  if (customerEmail && booking.customerEmail.toLowerCase() !== customerEmail.toLowerCase()) {
    throw new Error('You can only cancel your own bookings.');
  }

  if (booking.status !== 'requested') {
    throw new Error('Only bookings with status "requested" can be cancelled.');
  }

  const updatedBooking: Booking = {
    ...booking,
    status: 'cancelled',
  };

  inMemoryBookings[bookingIndex] = updatedBooking;
  persistStore();

  return { ...updatedBooking };
}

/* =========================================================
   TECHNICIAN SERVICE & REQUEST FUNCTIONS
   ========================================================= */

/**
 * Get services belonging to a technician
 * Calls Express GET /api/services/my with Authorization: Bearer <getAuthToken()>.
 */
export async function getTechnicianServices(
  technicianEmail?: string
): Promise<Service[]> {
  const token = await getAuthToken();

  if (token) {
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

  await delay();
  if (!technicianEmail) {
    return [...inMemoryServices];
  }
  return inMemoryServices
    .filter((s) => s.technicianEmail.toLowerCase() === technicianEmail.toLowerCase())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Create service: sets approvalStatus to 'pending' and isAvailable to true
 * Calls Express POST /api/services with Authorization: Bearer <getAuthToken()>.
 */
export async function createService(
  serviceData: Omit<Service, '_id' | 'createdAt' | 'approvalStatus' | 'isAvailable'>
): Promise<Service> {
  const token = await getAuthToken();

  if (token) {
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

    const created = resData.service || resData;
    if (created) {
      inMemoryServices.unshift(created);
      persistStore();
    }
    return created;
  }

  await delay();

  const newService: Service = {
    ...serviceData,
    _id: `srv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    approvalStatus: 'pending',
    isAvailable: true,
    createdAt: new Date().toISOString(),
  };

  inMemoryServices.unshift(newService);
  persistStore();

  return { ...newService };
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

  if (token) {
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

    const updated = resData.service || resData;
    const index = inMemoryServices.findIndex((s) => s._id === id);
    if (index !== -1 && updated) {
      inMemoryServices[index] = updated;
      persistStore();
    }
    return updated;
  }

  await delay();

  const index = inMemoryServices.findIndex((s) => s._id === id);
  if (index === -1) {
    throw new Error('Service not found.');
  }

  const updated: Service = {
    ...inMemoryServices[index],
    ...updates,
    approvalStatus: 'pending', // Reverts to pending on edit per requirements
  };

  inMemoryServices[index] = updated;
  persistStore();

  return { ...updated };
}

/**
 * Delete service
 * Calls Express DELETE /api/services/:id with Authorization: Bearer <getAuthToken()>.
 */
export async function deleteService(id: string): Promise<boolean> {
  const token = await getAuthToken();

  if (token) {
    const res = await fetch(`${API_URL}/api/services/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = new Error(
        resData.message || `Failed to delete service: ${res.statusText}`
      );
      (err as unknown as { status: number }).status = res.status;
      throw err;
    }

    const index = inMemoryServices.findIndex((s) => s._id === id);
    if (index !== -1) {
      inMemoryServices.splice(index, 1);
      persistStore();
    }
    return true;
  }

  await delay();

  const index = inMemoryServices.findIndex((s) => s._id === id);
  if (index === -1) {
    throw new Error('Service not found.');
  }

  inMemoryServices.splice(index, 1);
  persistStore();

  return true;
}

/**
 * Toggle availability of a service (must NOT reset approvalStatus)
 * Calls Express PATCH /api/services/:id/availability with Authorization: Bearer <getAuthToken()>.
 */
export async function toggleAvailability(id: string): Promise<Service> {
  const token = await getAuthToken();

  if (token) {
    const res = await fetch(`${API_URL}/api/services/${id}/availability`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = new Error(
        resData.message || `Failed to toggle availability: ${res.statusText}`
      );
      (err as unknown as { status: number }).status = res.status;
      throw err;
    }

    const updated = resData.service || resData;
    const index = inMemoryServices.findIndex((s) => s._id === id);
    if (index !== -1 && updated) {
      inMemoryServices[index] = updated;
      persistStore();
    }
    return updated;
  }

  await delay();

  const index = inMemoryServices.findIndex((s) => s._id === id);
  if (index === -1) {
    throw new Error('Service not found.');
  }

  const existing = inMemoryServices[index];
  const updated: Service = {
    ...existing,
    isAvailable: !existing.isAvailable,
  };

  inMemoryServices[index] = updated;
  persistStore();

  return { ...updated };
}

/**
 * Get bookings assigned to a technician
 * Calls Express GET /api/bookings/technician with Authorization: Bearer <getAuthToken()>.
 */
export async function getTechnicianBookings(
  technicianEmail?: string,
  statusFilter?: string
): Promise<Booking[]> {
  const token = await getAuthToken();

  if (token) {
    const query = new URLSearchParams();
    if (statusFilter && statusFilter !== 'all') {
      query.set('status', statusFilter);
    }
    const queryString = query.toString();
    const url = `${API_URL}/api/bookings/technician${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url, {
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

  await delay();
  let list = inMemoryBookings;
  if (technicianEmail) {
    list = list.filter(
      (b) => b.technicianEmail.toLowerCase() === technicianEmail.toLowerCase()
    );
  }
  if (statusFilter && statusFilter !== 'all') {
    list = list.filter((b) => b.status === statusFilter);
  }
  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Status Pipeline transitions map:
 * - requested -> accepted | rejected: technician
 * - requested -> cancelled: customer
 * - accepted -> in-progress: technician
 * - in-progress -> completed: technician (finalAmount > 0 required)
 * - rejected / cancelled / completed: final states (completed only changes paymentStatus)
 *
 * Calls Express PATCH /api/bookings/:id/status with Authorization: Bearer <getAuthToken()>.
 */
export async function updateBookingStatus(
  id: string,
  nextStatus: BookingStatus,
  options?: {
    finalAmount?: number;
    technicianEmail?: string;
    customerEmail?: string;
  }
): Promise<Booking> {
  const token = await getAuthToken();

  if (token) {
    const payload: { status: string; finalAmount?: number } = {
      status: nextStatus,
    };
    if (options?.finalAmount !== undefined) {
      payload.finalAmount = Number(options.finalAmount);
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
        resData.message || `Failed to update job status: ${res.statusText}`
      );
      (err as unknown as { status: number }).status = res.status;
      throw err;
    }

    const updated = resData.booking || resData;
    const index = inMemoryBookings.findIndex((b) => b._id === id);
    if (index !== -1 && updated) {
      inMemoryBookings[index] = updated;
      persistStore();
    }
    return updated;
  }

  await delay();

  const index = inMemoryBookings.findIndex((b) => b._id === id);
  if (index === -1) {
    throw new Error('Booking not found.');
  }

  const booking = inMemoryBookings[index];
  const current = booking.status;

  // Strict Pipeline Transitions Validation
  const validTransitions: Record<BookingStatus, BookingStatus[]> = {
    requested: ['accepted', 'rejected', 'cancelled'],
    accepted: ['in-progress'],
    'in-progress': ['completed'],
    completed: [],
    rejected: [],
    cancelled: [],
  };

  if (!validTransitions[current]?.includes(nextStatus)) {
    throw new Error(
      `Invalid status transition from "${current}" to "${nextStatus}".`
    );
  }

  // Authorization checks
  if (nextStatus === 'cancelled') {
    if (
      options?.customerEmail &&
      booking.customerEmail.toLowerCase() !== options.customerEmail.toLowerCase()
    ) {
      throw new Error('Only the customer who requested this booking can cancel it.');
    }
  } else {
    // Technician actions: accepted, rejected, in-progress, completed
    if (
      options?.technicianEmail &&
      booking.technicianEmail.toLowerCase() !== options.technicianEmail.toLowerCase()
    ) {
      throw new Error('Only the assigned technician can update this job.');
    }
  }

  // Completion requirement: finalAmount > 0
  let finalAmount = booking.finalAmount;
  if (nextStatus === 'completed') {
    if (options?.finalAmount !== undefined) {
      if (typeof options.finalAmount !== 'number' || options.finalAmount <= 0) {
        throw new Error('Final amount must be a positive number.');
      }
      finalAmount = options.finalAmount;
    } else if (finalAmount <= 0) {
      finalAmount = booking.basePrice;
    }
  }

  const updated: Booking = {
    ...booking,
    status: nextStatus,
    finalAmount,
  };

  inMemoryBookings[index] = updated;
  persistStore();

  return { ...updated };
}

/* =========================================================
   ADMIN FUNCTIONS
   ========================================================= */

/**
 * Get all registered platform users
 */
export async function getAdminUsers(): Promise<User[]> {
  await delay();
  return [...inMemoryUsers].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Change user role (forbidden to change own role)
 */
export async function changeUserRole(
  userId: string,
  newRole: UserRole,
  currentUserId?: string
): Promise<User> {
  await delay();

  if (currentUserId && userId === currentUserId) {
    throw new Error('You cannot change your own administrative role.');
  }

  const index = inMemoryUsers.findIndex((u) => u._id === userId);
  if (index === -1) {
    throw new Error('User not found.');
  }

  const updated: User = {
    ...inMemoryUsers[index],
    role: newRole,
  };

  inMemoryUsers[index] = updated;
  persistStore();

  return { ...updated };
}

/**
 * Get services for admin moderation
 */
export async function getAdminServices(
  filter: 'all' | 'pending' | 'approved' | 'rejected' = 'all'
): Promise<Service[]> {
  await delay();

  let list = [...inMemoryServices];
  if (filter !== 'all') {
    list = list.filter((s) => s.approvalStatus === filter);
  }

  // Pending first, then newest
  return list.sort((a, b) => {
    if (a.approvalStatus === 'pending' && b.approvalStatus !== 'pending') return -1;
    if (a.approvalStatus !== 'pending' && b.approvalStatus === 'pending') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/**
 * Moderate service: set approval status
 */
export async function setApproval(
  serviceId: string,
  status: 'approved' | 'rejected'
): Promise<Service> {
  await delay();

  const index = inMemoryServices.findIndex((s) => s._id === serviceId);
  if (index === -1) {
    throw new Error('Service not found.');
  }

  const updated: Service = {
    ...inMemoryServices[index],
    approvalStatus: status,
  };

  inMemoryServices[index] = updated;
  persistStore();

  return { ...updated };
}

/**
 * Get all platform bookings for admin monitoring
 */
export async function getAdminBookings(statusFilter?: string): Promise<Booking[]> {
  await delay();

  let list = [...inMemoryBookings];
  if (statusFilter && statusFilter !== 'all') {
    list = list.filter((b) => b.status === statusFilter);
  }

  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/* =========================================================
   PAYMENT FUNCTIONS
   ========================================================= */

/**
 * Get payments (for customer history or admin all transactions).
 * Calls Express GET /api/payments/my with Authorization: Bearer <getAuthToken()>.
 */
export async function getPayments(customerEmail?: string): Promise<Payment[]> {
  const token = await getAuthToken();

  if (token) {
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
    if (res.status === 403 && !customerEmail) {
      // In case admin or other caller accesses it before I6
      return [...inMemoryPayments].sort(
        (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
      );
    }
    const err = new Error(errorData.message || `Failed to fetch payment history: ${res.statusText}`);
    (err as unknown as { status: number }).status = res.status;
    throw err;
  }

  // Fallback to in-memory if no token
  await delay();

  if (!customerEmail) {
    return [...inMemoryPayments].sort(
      (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
    );
  }

  return inMemoryPayments
    .filter((p) => p.customerEmail.toLowerCase() === customerEmail.toLowerCase())
    .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
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

/**
 * Mock Pay Now for Phase 1 frontend testing
 * (replaced by Stripe Checkout in Phase 3)
 */
export async function mockPayBooking(bookingId: string): Promise<Payment> {
  await delay();

  const index = inMemoryBookings.findIndex((b) => b._id === bookingId);
  if (index === -1) {
    throw new Error('Booking not found.');
  }

  const booking = inMemoryBookings[index];
  if (booking.status !== 'completed') {
    throw new Error('Payment can only be processed for completed repairs.');
  }

  if (booking.paymentStatus === 'paid') {
    throw new Error('This booking is already paid.');
  }

  // Update booking paymentStatus
  booking.paymentStatus = 'paid';
  inMemoryBookings[index] = { ...booking };

  const newPayment: Payment = {
    _id: `pmt_${Date.now()}`,
    bookingId: booking._id,
    serviceTitle: booking.serviceTitle,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    technicianName: booking.technicianName,
    technicianEmail: booking.technicianEmail,
    amount: booking.finalAmount,
    currency: 'usd',
    transactionId: `txn_mock_${Math.random().toString(36).substring(2, 11)}`,
    stripeSessionId: `cs_mock_${Math.random().toString(36).substring(2, 16)}`,
    paymentStatus: 'paid',
    paidAt: new Date().toISOString(),
  };

  inMemoryPayments.unshift(newPayment);
  persistStore();

  return { ...newPayment };
}

/* =========================================================
   USER PROFILE
   ========================================================= */

export async function updateUserProfile(
  email: string,
  updates: Partial<User>
): Promise<User> {
  await delay();

  const index = inMemoryUsers.findIndex(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (index === -1) {
    throw new Error('User not found.');
  }

  // Email and role are immutable via profile update
  const sanitized = { ...updates };
  delete sanitized.email;
  delete sanitized.role;
  delete sanitized._id;

  const updated: User = {
    ...inMemoryUsers[index],
    ...sanitized,
  };

  inMemoryUsers[index] = updated;
  persistStore();

  return { ...updated };
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

  if (token) {
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

  // Fallback to in-memory if no token
  await delay();
  const totalRequests = inMemoryBookings.length;
  const activeJobs = inMemoryBookings.filter((b) =>
    ['requested', 'accepted', 'in-progress'].includes(b.status)
  ).length;
  const completedJobs = inMemoryBookings.filter((b) => b.status === 'completed').length;
  const totalSpent = inMemoryPayments.reduce((sum, p) => sum + p.amount, 0);

  const chartData = [
    { month: 'Oct', requests: 1, spent: 75 },
    { month: 'Nov', requests: 2, spent: 155 },
    { month: 'Dec', requests: 1, spent: 90 },
    { month: 'Jan', requests: 3, spent: 220 },
    { month: 'Feb', requests: Math.max(1, totalRequests), spent: Math.max(50, totalSpent) },
  ];

  return {
    totalRequests,
    activeJobs,
    completedJobs,
    totalSpent,
    chartData,
  };
}

/**
 * Fetch technician dashboard stats and 6-month metrics timeline.
 * Calls Express GET /api/technician/stats with Authorization: Bearer <getAuthToken()>.
 */
export async function getTechnicianStats(
  email?: string
): Promise<TechnicianStats> {
  const token = await getAuthToken();

  if (token) {
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

  await delay();
  const techServices = email
    ? inMemoryServices.filter(
        (s) => s.technicianEmail.toLowerCase() === email.toLowerCase()
      )
    : inMemoryServices;

  const techBookings = email
    ? inMemoryBookings.filter(
        (b) => b.technicianEmail.toLowerCase() === email.toLowerCase()
      )
    : inMemoryBookings;

  const totalServices = techServices.length;
  const approvedServices = techServices.filter(
    (s) => s.approvalStatus === 'approved'
  ).length;
  const pendingRequests = techBookings.filter(
    (b) => b.status === 'requested'
  ).length;
  const completedJobs = techBookings.filter(
    (b) => b.status === 'completed'
  ).length;
  const totalEarnings = techBookings
    .filter((b) => b.status === 'completed' && b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.finalAmount, 0);

  const chartData = [
    { month: 'Oct', jobs: 3, earnings: 340 },
    { month: 'Nov', jobs: 5, earnings: 580 },
    { month: 'Dec', jobs: 4, earnings: 490 },
    { month: 'Jan', jobs: 6, earnings: 720 },
    {
      month: 'Feb',
      jobs: Math.max(2, completedJobs),
      earnings: Math.max(195, totalEarnings),
    },
  ];

  return {
    totalServices,
    approvedServices,
    pendingRequests,
    completedJobs,
    totalEarnings,
    chartData,
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

  await delay();

  if (role === 'admin') {
    const totalUsers = inMemoryUsers.length;
    const totalTechnicians = inMemoryUsers.filter((u) => u.role === 'technician').length;
    const totalCustomers = inMemoryUsers.filter((u) => u.role === 'customer').length;
    const pendingServices = inMemoryServices.filter(
      (s) => s.approvalStatus === 'pending'
    ).length;
    const totalBookings = inMemoryBookings.length;
    const totalRevenue = inMemoryPayments.reduce((sum, p) => sum + p.amount, 0);

    const chartData = [
      { month: 'Oct', revenue: 1450, bookings: 12 },
      { month: 'Nov', revenue: 2180, bookings: 18 },
      { month: 'Dec', revenue: 1950, bookings: 16 },
      { month: 'Jan', revenue: 2890, bookings: 24 },
      { month: 'Feb', revenue: Math.max(1200, totalRevenue), bookings: Math.max(9, totalBookings) },
    ];

    return {
      totalUsers,
      totalTechnicians,
      totalCustomers,
      pendingServices,
      totalBookings,
      totalRevenue,
      chartData,
    } as AdminStats;
  }

  // public stats
  return {
    totalServices: inMemoryServices.filter((s) => s.approvalStatus === 'approved').length,
    completedRepairs: 480 + inMemoryBookings.filter((b) => b.status === 'completed').length,
    expertTechnicians: 35 + inMemoryUsers.filter((u) => u.role === 'technician').length,
    happyCustomers: 98,
    satisfactionRate: 99.2,
  } as PublicStats;
}
