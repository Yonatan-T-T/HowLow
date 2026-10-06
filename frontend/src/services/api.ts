import axios from 'axios';
import type { 
  AuctionItem, 
  CreateAuctionPayload, 
  AuctionAnalytics, 
  ResolveAuctionResult, 
  User, 
  Bid 
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

// Interceptor to automatically attach X-User-Id header from current active user
apiClient.interceptors.request.use((config) => {
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
};
