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
    }>('/api/auth/me');
  },

  async login(data: { email?: string; personaId?: string }) {
    const res = await request<{
      success: boolean;
      user: User;
      sellerProfile: SellerProfile | null;
      subscription: SellerSubscription | null;
      token: string;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthToken(res.token);
    return res;
  },

  async signup(data: {
    email: string;
    fullName: string;
    initialRole?: 'buyer' | 'seller';
    collegeName?: string;
  }) {
    const res = await request<{
      success: boolean;
      user: User;
      sellerProfile: SellerProfile | null;
      subscription: SellerSubscription | null;
      token: string;
    }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthToken(res.token);
    return res;
  },

  async logout() {
    setAuthToken(null);
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
  },

  async switchRole(targetRole: 'buyer' | 'seller') {
    return request<{ success: boolean; activeRole: 'buyer' | 'seller'; user: User }>(
      '/api/auth/switch-role',
      {
        method: 'POST',
        body: JSON.stringify({ targetRole }),
      }
    );
  },

  async switchDemoUser(userId: string) {
    const res = await request<{
      success: boolean;
      user: User;
      sellerProfile: SellerProfile | null;
      subscription: SellerSubscription | null;
      token: string;
    }>('/api/auth/switch-demo-user', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    setAuthToken(res.token);
    return res;
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
    }>('/api/sellers/onboard', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateSellerProfile(data: Partial<SellerProfile>) {
    return request<{ success: boolean; sellerProfile: SellerProfile }>('/api/sellers/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getSellers(params?: { search?: string; skill?: string; sort?: string }) {
    const q = new URLSearchParams(params as any).toString();
    return request<{ sellers: (SellerProfile & { fullName: string; avatarUrl: string })[] }>(
      `/api/sellers${q ? '?' + q : ''}`
    );
  },

  async getSellerById(id: string) {
    return request<{
      seller: SellerProfile & { fullName: string; avatarUrl: string };
      gigs: Gig[];
      reviews: Review[];
    }>(`/api/sellers/${id}`);
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
    return request<{ gigs: Gig[] }>(`/api/gigs${q.toString() ? '?' + q.toString() : ''}`);
  },

  async getGigById(id: string) {
    return request<{ gig: Gig; reviews: Review[] }>(`/api/gigs/${id}`);
  },

  async createGig(data: Partial<Gig>) {
    return request<{ success: boolean; gig: Gig }>('/api/gigs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateGig(id: string, data: Partial<Gig>) {
    return request<{ success: boolean; gig: Gig }>(`/api/gigs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteGig(id: string) {
    return request<{ success: boolean; message: string }>(`/api/gigs/${id}`, {
      method: 'DELETE',
    });
  },

  // Projects & Bidding
  async getProjects() {
    return request<{ projects: Project[] }>('/api/projects');
  },

  async createProject(data: {
    title: string;
    description: string;
    categoryId: string;
    budget: number;
    deadlineDays: number;
    requiredSkills: string[];
  }) {
    return request<{ success: boolean; project: Project }>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getProjectProposals(projectId: string) {
    return request<{ proposals: Proposal[] }>(`/api/projects/${projectId}/proposals`);
  },

  async submitProposal(
    projectId: string,
    data: { bidAmount: number; deliveryDays: number; coverLetter: string }
  ) {
    return request<{ success: boolean; proposal: Proposal }>(
      `/api/projects/${projectId}/proposals`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  async acceptProposal(projectId: string, proposalId: string) {
    return request<{ success: boolean; order: Order }>(
      `/api/projects/${projectId}/accept-proposal`,
      {
        method: 'POST',
        body: JSON.stringify({ proposalId }),
      }
    );
  },

  // Orders
  async getOrders(role?: 'buyer' | 'seller') {
    const q = role ? `?role=${role}` : '';
    return request<{ orders: Order[] }>(`/api/orders${q}`);
  },

  async getOrderById(id: string) {
    return request<{ order: Order; review?: Review }>(`/api/orders/${id}`);
  },

  async createOrder(data: { gigId: string; requirements: string }) {
    return request<{ success: boolean; order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deliverOrder(id: string, data: { deliveryNote: string; attachmentUrl?: string }) {
    return request<{ success: boolean; order: Order }>(`/api/orders/${id}/deliver`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateOrderStatus(id: string, status: string) {
    return request<{ success: boolean; order: Order }>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Reviews
  async submitReview(orderId: string, data: { rating: number; comment: string }) {
    return request<{ success: boolean; review: Review; averageRating: number }>(
      `/api/orders/${orderId}/review`,
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
    }>('/api/subscriptions/plans');
  },

  async getCurrentSubscription() {
    return request<{
      subscription: SellerSubscription | null;
      history: any[];
    }>('/api/subscriptions/current');
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
    }>('/api/subscriptions/create-order', {
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
    }>('/api/subscriptions/verify-payment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async cancelSubscription() {
    return request<{
      success: boolean;
      message: string;
      subscription: SellerSubscription;
    }>('/api/subscriptions/cancel', {
      method: 'POST',
    });
  },

  // Security Audit Runner
  async runSecurityAudit() {
    return request<{
      summary: { total: number; passed: number; failed: number; timestamp: string };
      checks: SecurityCheckItem[];
    }>('/api/security/run-audit', {
      method: 'POST',
    });
  },

  // n8n Automation
  async getAutomationLogs() {
    return request<{
      logs: AutomationLogItem[];
      config: { n8nWebhookUrl: string; isConfigured: boolean; authHeader: string };
    }>('/api/automation/logs');
  },

  async testAutomationTrigger(eventType: string) {
    return request<{ success: boolean; event: AutomationLogItem }>(
      '/api/automation/test-trigger',
      {
        method: 'POST',
        body: JSON.stringify({ eventType }),
      }
    );
  },
};
