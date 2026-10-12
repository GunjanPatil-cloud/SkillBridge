export type UserRole = 'buyer' | 'seller';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  activeRole: UserRole;
  isAdmin: boolean;
  createdAt: string;
}

export interface SellerProfile {
  id: string;
  userId: string;
  collegeName: string;
  graduationYear: number;
  major: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  isOnboarded: boolean;
  isPromoted: boolean;
  subscriptionTier: 'free' | 'premium';
  totalOrdersCompleted: number;
  averageRating: number;
  ratingCount: number;
  createdAt: string;
}

export interface Gig {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerCollege: string;
  sellerRating: number;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  deliveryDays: number;
  revisions: number;
  tags: string[];
  coverImage: string;
  isPublished: boolean;
  isPromoted: boolean;
  impressions: number;
  clicks: number;
  createdAt: string;
}

export interface Project {
  id: string;
  buyerId: string;
  buyerName: string;
  title: string;
  description: string;
  categoryId: string;
  budget: number;
  deadlineDays: number;
  requiredSkills: string[];
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  proposalCount: number;
  createdAt: string;
}

export interface Proposal {
  id: string;
  projectId: string;
  sellerId: string;
  sellerName: string;
  sellerCollege: string;
  sellerRating: number;
  isPromotedSeller: boolean;
  bidAmount: number;
  deliveryDays: number;
  coverLetter: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export type OrderStatus = 'in_progress' | 'delivered' | 'completed' | 'disputed' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  gigId?: string;
  projectId?: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  title: string;
  amount: number;
  requirements: string;
  deliveryDays: number;
  status: OrderStatus;
  deliveryNote?: string;
  deliveryAttachmentUrl?: string;
  deliveredAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  sellerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  listingLimit: number;
  promotedBadge: boolean;
  searchBoost: string;
  proposalBoost: boolean;
  analytics: string;
}

export interface SellerSubscription {
  id: string;
  sellerId: string;
  planId: 'free_student' | 'premium_monthly' | 'premium_yearly';
  planName: string;
  status: 'active' | 'cancelled' | 'expired';
  billingPeriod: 'monthly' | 'yearly';
  price: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  razorpaySubscriptionId?: string;
  razorpayPaymentId?: string;
}

export interface SecurityCheckItem {
  id: number;
  name: string;
  status: 'passed' | 'failed' | 'in_progress';
  evidence: string;
}

export interface AutomationLogItem {
  id: string;
  eventType: string;
  payload: any;
  dispatchedAt: string;
  status: 'delivered' | 'simulated';
  statusCode: number;
}
