import {
  User,
  SellerProfile,
  Gig,
  Project,
  Proposal,
  Order,
  Review,
  SubscriptionPlan,
  SellerSubscription,
  SecurityCheckItem,
  AutomationLogItem,
} from '../types';

let currentToken: string | null = localStorage.getItem('skillbridge_auth_token');

export function setAuthToken(token: string | null) {
  currentToken = token;
  if (token) {
    localStorage.setItem('skillbridge_auth_token', token);
  } else {
    localStorage.removeItem('skillbridge_auth_token');
  }
}

export function getAuthToken(): string | null {
  return currentToken;
}

const NETLIFY_FUNCTIONS_BASE = '/.netlify/functions';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (currentToken) {
    headers.set('Authorization', `Bearer ${currentToken}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `HTTP ${response.status}: Request failed`;
    const err = new Error(errorMsg) as any;
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data as T;
}

export const api = {
  // Auth & Roles
  async getMe() {
    return request<{
      user: User;
      sellerProfile: SellerProfile | null;
      subscription: SellerSubscription | null;
      availableRoles: string[];
    }>(`${NETLIFY_FUNCTIONS_BASE}/auth-me`);
  },

  async authenticateFirebase(data: { uid?: string; idToken?: string; email?: string; fullName?: string; avatarUrl?: string; initialRole?: 'buyer' | 'seller'; collegeName?: string }) {
    const res = await request<{
      success: boolean;
      user: User;
      sellerProfile: SellerProfile | null;
      subscription: SellerSubscription | null;
      token: string;
    }>(`${NETLIFY_FUNCTIONS_BASE}/auth-login`, {
      method: 'POST',
      body: JSON.stringify({ action: 'firebase', ...data }),
    });
    setAuthToken(res.token);
    return res;
  },

  async logout() {
    setAuthToken(null);
    try {
      await request(`${NETLIFY_FUNCTIONS_BASE}/auth-me`, { method: 'POST' });
    } catch {
      // ignore
    }
  },

  async switchRole(targetRole: 'buyer' | 'seller') {
    return request<{ success: boolean; activeRole: 'buyer' | 'seller'; user: User }>(
      `${NETLIFY_FUNCTIONS_BASE}/auth-switch-role`,
      {
        method: 'POST',
        body: JSON.stringify({ targetRole }),
      }
    );
  },

  // Seller Onboarding & Profile
  async onboardSeller(data: {
    collegeName: string;
    graduationYear: number;
    major: string;
    bio: string;
    skills: string[];
    hourlyRate: number;
    portfolioUrl?: string;
    githubUrl?: string;
    linkedinUrl?: string;
  }) {
    return request<{
      success: boolean;
      message: string;
      sellerProfile: SellerProfile;
      user: User;
    }>(`${NETLIFY_FUNCTIONS_BASE}/sellers-onboard`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateSellerProfile(data: Partial<SellerProfile>) {
    return request<{ success: boolean; sellerProfile: SellerProfile }>(
      `${NETLIFY_FUNCTIONS_BASE}/sellers-profile`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  async updateUserProfile(data: {
    fullName?: string;
    email?: string;
    avatarUrl?: string;
    collegeName?: string;
    graduationYear?: number;
    major?: string;
    bio?: string;
    hourlyRate?: number;
    skills?: string[];
    portfolioUrl?: string;
    githubUrl?: string;
    linkedinUrl?: string;
  }) {
    return request<{
      success: boolean;
      message: string;
      user: User;
      sellerProfile: SellerProfile | null;
      subscription: SellerSubscription | null;
    }>(`${NETLIFY_FUNCTIONS_BASE}/users-profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getSellers(params?: { search?: string; skill?: string; sort?: string }) {
    const q = new URLSearchParams(params as any).toString();
    return request<{ sellers: (SellerProfile & { fullName: string; avatarUrl: string })[] }>(
      `${NETLIFY_FUNCTIONS_BASE}/sellers${q ? '?' + q : ''}`
    );
  },

  async getSellerById(id: string) {
    return request<{
      seller: SellerProfile & { fullName: string; avatarUrl: string };
      gigs: Gig[];
      reviews: Review[];
    }>(`${NETLIFY_FUNCTIONS_BASE}/sellers/${id}`);
  },

  // Gigs
  async getGigs(params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    deliveryDays?: number;
    sort?: string;
  }) {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') q.append(k, String(v));
      });
    }
    return request<{ gigs: Gig[] }>(
      `${NETLIFY_FUNCTIONS_BASE}/gigs${q.toString() ? '?' + q.toString() : ''}`
    );
  },

  async getGigById(id: string) {
    return request<{ gig: Gig; reviews: Review[] }>(`${NETLIFY_FUNCTIONS_BASE}/gigs/${id}`);
  },

  async createGig(data: Partial<Gig>) {
    return request<{ success: boolean; gig: Gig }>(
      `${NETLIFY_FUNCTIONS_BASE}/gigs-create`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  async updateGig(id: string, data: Partial<Gig>) {
    return request<{ success: boolean; gig: Gig }>(
      `${NETLIFY_FUNCTIONS_BASE}/gigs/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  async deleteGig(id: string) {
    return request<{ success: boolean; message: string }>(
      `${NETLIFY_FUNCTIONS_BASE}/gigs/${id}`,
      {
        method: 'DELETE',
      }
    );
  },

  // Projects & Bidding
  async getProjects() {
    return request<{ projects: Project[] }>(`${NETLIFY_FUNCTIONS_BASE}/projects-list`);
  },

  async createProject(data: {
    title: string;
    description: string;
    categoryId: string;
    budget: number;
    deadlineDays: number;
    requiredSkills: string[];
  }) {
    return request<{ success: boolean; project: Project }>(
      `${NETLIFY_FUNCTIONS_BASE}/projects-create`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  async getProjectProposals(projectId: string) {
    return request<{ proposals: Proposal[] }>(
      `${NETLIFY_FUNCTIONS_BASE}/projects/${projectId}/proposals`
    );
  },

  async submitProposal(
    projectId: string,
    data: { bidAmount: number; deliveryDays: number; coverLetter: string }
  ) {
    return request<{ success: boolean; proposal: Proposal }>(
      `${NETLIFY_FUNCTIONS_BASE}/projects/${projectId}/proposals`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  async acceptProposal(projectId: string, proposalId: string) {
    return request<{ success: boolean; order: Order }>(
      `${NETLIFY_FUNCTIONS_BASE}/projects/${projectId}/accept-proposal`,
      {
        method: 'POST',
        body: JSON.stringify({ proposalId }),
      }
    );
  },

  // Orders
  async getOrders(role?: 'buyer' | 'seller') {
    const q = role ? `?role=${role}` : '';
    return request<{ orders: Order[] }>(
      `${NETLIFY_FUNCTIONS_BASE}/orders${q}`
    );
  },

  async getOrderById(id: string) {
    return request<{ order: Order; review?: Review }>(
      `${NETLIFY_FUNCTIONS_BASE}/orders/${id}`
    );
  },

  async createOrder(data: { gigId: string; requirements: string }) {
    return request<{ success: boolean; order: Order }>(
      `${NETLIFY_FUNCTIONS_BASE}/orders-create`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  async deliverOrder(id: string, data: { deliveryNote: string; attachmentUrl?: string }) {
    return request<{ success: boolean; order: Order }>(
      `${NETLIFY_FUNCTIONS_BASE}/orders/${id}/deliver`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  async updateOrderStatus(id: string, status: string) {
    return request<{ success: boolean; order: Order }>(
      `${NETLIFY_FUNCTIONS_BASE}/orders/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
  },

  // Reviews
  async submitReview(orderId: string, data: { rating: number; comment: string }) {
    return request<{ success: boolean; review: Review; averageRating: number }>(
      `${NETLIFY_FUNCTIONS_BASE}/orders/${orderId}/review`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  // Subscriptions & Razorpay
  async getSubscriptionPlans() {
    return request<{
      plans: SubscriptionPlan[];
      fairRankingPolicy: { disclaimer: string; factors: string[] };
    }>(`${NETLIFY_FUNCTIONS_BASE}/subscriptions-plans`);
  },

  async getCurrentSubscription() {
    return request<{
      subscription: SellerSubscription | null;
      history: any[];
    }>(`${NETLIFY_FUNCTIONS_BASE}/subscriptions-current`);
  },

  async createSubscriptionOrder(planId: string) {
    return request<{
      success: boolean;
      razorpayOrderId: string;
      amount: number;
      currency: string;
      keyId: string;
      plan: { id: string; name: string; price: number };
      prefill: { name: string; email: string };
    }>(`${NETLIFY_FUNCTIONS_BASE}/subscriptions/create-order`, {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  },

  async verifyPayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    planId: string;
  }) {
    return request<{
      success: boolean;
      message: string;
      subscription: SellerSubscription;
    }>(`${NETLIFY_FUNCTIONS_BASE}/subscriptions/verify-payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async cancelSubscription() {
    return request<{
      success: boolean;
      message: string;
      subscription: SellerSubscription;
    }>(`${NETLIFY_FUNCTIONS_BASE}/subscriptions/cancel`, {
      method: 'POST',
    });
  },

  // Security Audit Runner
  async runSecurityAudit() {
    return request<{
      summary: { total: number; passed: number; failed: number; timestamp: string };
      checks: SecurityCheckItem[];
    }>(`${NETLIFY_FUNCTIONS_BASE}/security-audit`, {
      method: 'POST',
    });
  },

  // n8n Automation
  async getAutomationLogs() {
    return request<{
      logs: AutomationLogItem[];
      config: { n8nWebhookUrl: string; isConfigured: boolean; authHeader: string };
    }>(`${NETLIFY_FUNCTIONS_BASE}/automation-logs`);
  },

  async testAutomationTrigger(eventType: string) {
    return request<{ success: boolean; event: AutomationLogItem }>(
      `${NETLIFY_FUNCTIONS_BASE}/automation-test-trigger`,
      {
        method: 'POST',
        body: JSON.stringify({ eventType }),
      }
    );
  },
};
