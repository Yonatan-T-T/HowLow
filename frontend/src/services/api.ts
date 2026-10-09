import axios from 'axios';
import type { 
  AuctionItem, 
  CreateAuctionPayload, 
  AuctionAnalytics, 
  ResolveAuctionResult, 
  User, 
  Bid,
  AuthResponse,
  TestProfile
} from '../types/auction';

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5223/api';
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '');
const API_BASE_URL = cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
  },
});

// Interceptor to automatically attach X-User-Id and Authorization headers from current session
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('unique_low_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  const storedUser = localStorage.getItem('unique_low_user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user?.id) {
        config.headers['X-User-Id'] = user.id.toString();
      }
    } catch {
      // Ignore JSON parse errors
    }
  }
  return config;
});

export const api = {
  // Auctions
  getAuctions: async (status?: string): Promise<AuctionItem[]> => {
    const params = status && status !== 'All' ? { status } : {};
    const res = await apiClient.get<AuctionItem[]>('/auctions', { params });
    return res.data;
  },

  getAuctionById: async (id: number): Promise<AuctionItem> => {
    const res = await apiClient.get<AuctionItem>(`/auctions/${id}`);
    return res.data;
  },

  registerForAuction: async (id: number, userId?: number): Promise<{ success: boolean; message: string; balance: number }> => {
    const res = await apiClient.post(`/auctions/${id}/register`, { userId });
    return res.data;
  },

  placeBid: async (id: number, amount: number, userId?: number): Promise<{ success: boolean; message: string; bidId: number; amount: number; placedAt: string }> => {
    const res = await apiClient.post(`/auctions/${id}/bid`, { amount, userId });
    return res.data;
  },

  resolveAuction: async (id: number): Promise<ResolveAuctionResult> => {
    const res = await apiClient.post<ResolveAuctionResult>(`/auctions/${id}/resolve`);
    return res.data;
  },

  getMyBids: async (id: number, userId?: number): Promise<Bid[]> => {
    const params = userId ? { userId } : {};
    const res = await apiClient.get<Bid[]>(`/auctions/${id}/bids/me`, { params });
    return res.data;
  },

  // Admin
  createAuction: async (payload: CreateAuctionPayload): Promise<AuctionItem> => {
    const res = await apiClient.post<AuctionItem>('/admin/items', payload);
    return res.data;
  },

  getAuctionAnalytics: async (id: number): Promise<AuctionAnalytics> => {
    const res = await apiClient.get<AuctionAnalytics>(`/admin/auctions/${id}/analytics`);
    return res.data;
  },

  cancelAuction: async (id: number): Promise<{ message: string }> => {
    const res = await apiClient.post(`/admin/auctions/${id}/cancel`);
    return res.data;
  },

  // Users & Wallet
  getUsers: async (): Promise<User[]> => {
    const res = await apiClient.get<User[]>('/users');
    return res.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const res = await apiClient.get<User>(`/users/${id}`);
    return res.data;
  },

  depositFunds: async (userId: number, amount: number): Promise<{ success: boolean; message: string; balance: number }> => {
    const res = await apiClient.post(`/users/${userId}/deposit`, { amount });
    return res.data;
  },

  // Authentication & Test Profiles
  login: async (usernameOrEmail: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', { usernameOrEmail, password });
    return res.data;
  },

  register: async (username: string, email: string, phoneNumber: string, password: string, role?: string): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', { username, email, phoneNumber, password, role });
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },

  getTestProfiles: async (): Promise<TestProfile[]> => {
    const res = await apiClient.get<TestProfile[]>('/auth/test-profiles');
    return res.data;
  },

  // Telebirr Top-Up
  getAgentAccount: async (): Promise<import('../types/auction').AgentAccount> => {
    const res = await apiClient.get<import('../types/auction').AgentAccount>('/topup/agent-account');
    return res.data;
  },

  submitTopUpRequest: async (payload: import('../types/auction').CreateTopUpPayload): Promise<import('../types/auction').TopUpRequest> => {
    const res = await apiClient.post<import('../types/auction').TopUpRequest>('/topup/request', payload);
    return res.data;
  },

  getMyTopUpRequests: async (): Promise<import('../types/auction').TopUpRequest[]> => {
    const res = await apiClient.get<import('../types/auction').TopUpRequest[]>('/topup/my-requests');
    return res.data;
  },

  getAllTopUpRequestsAdmin: async (): Promise<import('../types/auction').TopUpRequest[]> => {
    const res = await apiClient.get<import('../types/auction').TopUpRequest[]>('/topup/admin/all');
    return res.data;
  },

  approveTopUpRequest: async (id: number): Promise<{ success: boolean; message: string; newBalance: number }> => {
    const res = await apiClient.post(`/topup/admin/${id}/approve`);
    return res.data;
  },

  rejectTopUpRequest: async (id: number, reason?: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.post(`/topup/admin/${id}/reject`, { reason });
    return res.data;
  },
};
