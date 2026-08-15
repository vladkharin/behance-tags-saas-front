import type { PlanType } from "./analytics.types";

export interface AdminSummaryResponse {
  users: {
    total: number;
    today: number;
    last7d: number;
    last30d: number;
    plans: {
      FREE: number;
      DAILY_FRESH: number;
      PRO_STREAM: number;
    };
  };
  finance: {
    totalRevenueRub: number;
    totalRevenueUsd: number;
    successfulCount: number;
    pendingCount: number;
    totalTransactions: number;
  };
  scraper: {
    totalProjects: number;
    scheduledProjects: number;
    pendingJobs: number;
    processingJobs: number;
    totalTags: number;
  };
  chartTimeline: Array<{
    date: string;
    users: number;
    revenueRub: number;
    revenueUsd: number;
  }>;
}

export interface AdminUserItem {
  id: string;
  email: string;
  name?: string | null;
  plan: PlanType;
  tagBalance: number;
  planExpiresAt?: string | null;
  projectsCount: number;
  paymentsCount: number;
  totalViews: number;
  totalLikes: number;
  lastAnalyzedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUsersResponse {
  items: AdminUserItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUserDetails {
  id: string;
  email: string;
  name?: string | null;
  plan: PlanType;
  tagBalance: number;
  planExpiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  projects: Array<{
    id: string;
    behanceId: string;
    title: string;
    url: string;
    views: number;
    appreciations: number;
    comments: number;
    isScheduled: boolean;
    analysisStatus: "IDLE" | "PENDING" | "PROCESSING";
    lastAnalyzedAt: string;
    createdAt: string;
    tags: Array<{
      tag: string;
      currentRank: number | null;
      onChart: boolean;
    }>;
  }>;
  payments: Array<{
    id: string;
    orderNumber: number;
    amount: number;
    currency: string;
    status: "PENDING" | "SUCCESS" | "FAILED";
    provider: "ROBOKASSA" | "LAVA";
    type: string;
    targetName: string;
    createdAt: string;
  }>;
}

export interface AdminPaymentItem {
  id: string;
  orderNumber: number;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  provider: "ROBOKASSA" | "LAVA";
  type: string;
  targetName: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
}

export interface AdminPaymentsResponse {
  items: AdminPaymentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminActivityItem {
  id: string;
  type: "USER_REGISTER" | "PROJECT_IMPORT" | "PAYMENT" | "ANALYSIS";
  title: string;
  description: string;
  userEmail: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
