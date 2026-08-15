export type PlanType = "FREE" | "DAILY_FRESH" | "PRO_STREAM";

export type AnalysisStatus = "IDLE" | "PENDING" | "PROCESSING";

export interface TagAnalytics {
  tag: string;
  totalViews?: number;
  totalAppreciations?: number;
  totalComments?: number;
  count?: number;
  currentRank: number | null;
  onChart?: boolean;
}

export interface TagMatrixItem {
  tag: string;
  currentRank: number | null;
  bestRank?: number | null;
  previousRank?: number | null;
  rankDelta?: number | null;
  onChart: boolean;
}

export interface BehanceProject {
  id: string;
  behanceId: string;
  title: string;
  url: string;
  views: number;
  appreciations: number;
  comments: number;
  userId: string;
  lastAnalyzedAt: string;
  isScheduled: boolean;
  analysisStatus: AnalysisStatus;
  createdAt: string;
  updatedAt: string;
  tags?: {
    projectId: string;
    tagId: string;
    currentRank: number | null;
    onChart: boolean;
    tag: {
      id: string;
      name: string;
    };
  }[];
}

export interface HistoryPoint {
  date: string;
  rank: number;
}

export interface ProjectDetailsResponse {
  activeProject: BehanceProject;
  plan: PlanType;
  tagBalance: number;
  lastAnalyzedAt: string;
  tagsMatrix: TagMatrixItem[];
  suggestedTags?: string[];
  status: AnalysisStatus;
}

export interface DashboardData {
  user: {
    id: string;
    email?: string;
  };
  activeProject: BehanceProject | null;
  tagsMatrix: TagAnalytics[];
}

export interface DashboardSummaryResponse {
  user: {
    id: string;
    email: string;
    name?: string | null;
    plan: PlanType;
    tagBalance: number;
    planExpiresAt?: string | null;
  } | null;
  totalProjects: number;
  totalTags: number;
  totalViews: number;
  totalAppreciations: number;
  totalComments: number;
  rankDistribution: {
    top10: number;
    top50: number;
    top100: number;
    unranked: number;
  };
  averageRank: number | null;
  bestRank: number | null;
  bestPerformingTags: Array<{
    tag: string;
    rank: number;
    projectTitle: string;
  }>;
}

export interface ProjectOverviewItem {
  id: string;
  behanceId: string;
  title: string;
  url: string;
  views: number;
  appreciations: number;
  comments: number;
  isScheduled: boolean;
  lastAnalyzedAt: string;
  analysisStatus: AnalysisStatus;
  createdAt: string;
  totalTags: number;
  top10Count: number;
  top50Count: number;
  bestRank: number | null;
  averageRank: number | null;
}

export interface CreatePaymentDto {
  userId?: string;
  target: string;
  type: "PLAN" | "FUEL";
  currency: "RUB" | "USD" | "EUR";
}

export interface CreatePaymentResponse {
  url: string;
}

export interface HistoryResponse {
  success: boolean;
  analytics: Record<string, HistoryPoint[]>;
}
