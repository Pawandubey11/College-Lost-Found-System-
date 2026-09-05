export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'student' | 'staff' | 'admin';
  department?: string | null;
  phone_number?: string | null;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon_name: string;
}

export interface Location {
  id: number;
  campus_zone: string;
  building_name: string;
  floor_level?: string;
  description?: string;
}

export interface Item {
  id: number;
  report_type: 'LOST' | 'FOUND';
  title: string;
  category_id: number;
  location_id: number;
  description: string;
  incident_date: string;
  incident_time?: string;
  primary_color: string;
  brand?: string;
  distinguishing_features?: string;
  hidden_details?: string;
  status: 'ACTIVE' | 'POSSIBLE_MATCH' | 'CLAIM_PENDING' | 'RETURNED' | 'CLOSED' | 'EXPIRED' | 'REJECTED';
  reporter_id: number;
  image_url?: string;
  created_at: string;
  category_name?: string;
  category_icon?: string;
  campus_zone?: string;
  building_name?: string;
  floor_level?: string;
  reporter_name?: string;
  reporter_role?: string;
  reporter_department?: string;
}

export interface Claim {
  id: number;
  item_id: number;
  claimant_id: number;
  verification_answers_json: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  admin_notes?: string;
  created_at: string;
  item_title?: string;
  report_type?: 'LOST' | 'FOUND';
  image_url?: string;
  primary_color?: string;
  category_name?: string;
  building_name?: string;
  reporter_name?: string;
  claimant_name?: string;
  claimant_email?: string;
  claimant_phone?: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'MATCH' | 'CLAIM_UPDATE' | 'MODERATION' | 'SYSTEM';
  reference_id?: number;
  is_read: number;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  activeLost: number;
  activeFound: number;
  returnedCount: number;
  pendingClaims: number;
  matchesCount: number;
  recoveryRate: number;
}

const API_BASE = '/api';

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If sending JSON body, set Content-Type
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred during API request.');
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: any) => fetchAPI<{ message: string; token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => fetchAPI<{ message: string; token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => fetchAPI<{ message: string }>('/auth/logout', { method: 'POST' }),
  getMe: () => fetchAPI<{ user: User }>('/auth/me'),
  updateProfile: (body: any) => fetchAPI<{ message: string; user: User }>('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Master
  getCategories: () => fetchAPI<{ categories: Category[] }>('/master/categories'),
  getLocations: () => fetchAPI<{ locations: Location[] }>('/master/locations'),

  // Items
  getItems: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI<{ items: Item[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(`/items${query ? `?${query}` : ''}`);
  },
  getItemById: (id: number) => fetchAPI<{ item: Item; matches: any[] }>(`/items/${id}`),
  createReport: (formData: FormData) => fetchAPI<{ message: string; itemId: number; matchesDetected: number }>('/items/report', { method: 'POST', body: formData }),
  getMyReports: () => fetchAPI<{ reports: Item[] }>('/items/my-reports'),
  updateItemStatus: (id: number, status: string) => fetchAPI<{ message: string }>(`/items/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Claims
  submitClaim: (itemId: number, answers: any) => fetchAPI<{ message: string; claimId: number }>(`/claims/item/${itemId}`, { method: 'POST', body: JSON.stringify({ verification_answers: answers }) }),
  getMyClaims: () => fetchAPI<{ claims: Claim[] }>('/claims/my-claims'),
  getReceivedClaims: () => fetchAPI<{ claims: Claim[] }>('/claims/received'),
  processClaimDecision: (claimId: number, decision: 'APPROVED' | 'REJECTED', notes?: string) => fetchAPI<{ message: string }>(`/claims/${claimId}/decision`, { method: 'PUT', body: JSON.stringify({ decision, admin_notes: notes }) }),

  // Notifications
  getNotifications: () => fetchAPI<{ notifications: NotificationItem[]; unreadCount: number }>('/notifications'),
  markNotificationAsRead: (id: number) => fetchAPI<{ message: string }>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsAsRead: () => fetchAPI<{ message: string }>('/notifications/read-all', { method: 'PUT' }),

  // Admin
  getAdminStats: () => fetchAPI<{ stats: AdminStats; hotspots: { building_name: string; item_count: number }[] }>('/admin/stats'),
  getAdminUsers: () => fetchAPI<{ users: User[] }>('/admin/users'),
  updateUserRole: (userId: number, role: string) => fetchAPI<{ message: string }>(`/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  getAdminReports: () => fetchAPI<{ reports: Item[] }>('/admin/reports'),
  getAdminClaims: () => fetchAPI<{ claims: Claim[] }>('/admin/claims'),
  getAdminAuditLogs: () => fetchAPI<{ logs: any[] }>('/admin/audit'),
};
