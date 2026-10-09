export type AuctionStatus = 'Active' | 'Closed' | 'Cancelled' | 'NoWinner';

export interface User {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  balance: number;
  role: 'Admin' | 'User';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user?: User;
}

export interface TestProfile {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: 'Admin' | 'User';
  balance: number;
}

export interface AgentAccount {
  receiverPhoneNumber: string;
  receiverName: string;
}

export interface TopUpRequest {
  id: number;
  userId: number;
  username: string;
  userEmail: string;
  senderPhoneNumber: string;
  receiverPhoneNumber: string;
  receiverName: string;
  amount: number;
  transactionNumber: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  adminNotes?: string | null;
}

export interface CreateTopUpPayload {
  amount: number;
  receiverPhoneNumber: string;
  receiverName: string;
  transactionNumber: string;
  senderPhoneNumber?: string;
}

export interface AuctionItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  registrationFee: number;
  retailValue: number;
  endTime: string;
  status: AuctionStatus;
  winnerUserId?: number | null;
  winnerUsername?: string | null;
  winningBidAmount?: number | null;
  totalRegistrations: number;
  totalBids: number;
  isUserRegistered: boolean;
  userBidsCount: number;
  createdAt: string;
}

export interface CreateAuctionPayload {
  title: string;
  description: string;
  imageUrl: string;
  registrationFee: number;
  retailValue: number;
  endTime: string;
}

export interface Bid {
  id: number;
  auctionItemId: number;
  userId: number;
  amount: number;
  placedAt: string;
  isUniqueAfterResolution?: boolean | null;
  isWinner: boolean;
}

export interface BidGroupAnalytics {
  amount: number;
  count: number;
  isUnique: boolean;
  isWinning: boolean;
  bidderUsernames: string[];
}

export interface AuctionAnalytics {
  auctionId: number;
  title: string;
  status: AuctionStatus;
  retailValue: number;
  registrationFee: number;
  endTime: string;
  totalRegistrations: number;
  totalBids: number;
  uniqueBidsCount: number;
  duplicateBidsCount: number;
  winningBidAmount?: number | null;
  winnerUsername?: string | null;
  bidDistribution: BidGroupAnalytics[];
}

export interface ResolveAuctionResult {
  auctionId: number;
  title: string;
  status: AuctionStatus;
  lowestUniqueBidFound: boolean;
  winnerUserId?: number | null;
  winnerUsername?: string | null;
  winningBidAmount?: number | null;
  retailValue: number;
  savingsAmount?: number | null;
  savingsPercent?: number | null;
  totalBids: number;
  uniqueBidsCount: number;
  duplicateBidsCount: number;
  message: string;
}
