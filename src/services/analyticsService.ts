import api from "../api/axios";

export interface TagAnalytics {
  tag: string;
  totalViews: number;
  totalAppreciations: number;
  currentRank?: number | null; // Добавили текущий ранг
}

export interface BehanceProject {
  id: string;
  url: string;
  userId: string;
  createdAt: string;
  behanceId: string;
  title: string;
}

export interface HistoryPoint {
  date: string;
  rank: number;
}

export interface DashboardData {
  user: {
    id: string;
    username?: string;
  };
  activeProject?: BehanceProject | null;
  tagsMatrix: TagAnalytics[];
  isScraping: boolean;
}

export const analyticsService = {
  // 1. Получить общую статистику (Матрица тегов + Активный проект)
  getAnalytics: async (): Promise<DashboardData> => {
    return 1;
    const response = await api.get<DashboardData>("/scraper/analytics");
    return response.data;
  },

  importCase: async (url: string, userId: string, tags?: string[]): Promise<{ success: boolean; data: any }> => {
    const response = await api.post("/scraper/import-case", {
      url,
      userId,
      tags, // Добавляем передачу тегов
    });
    return response.data;
  },

  // 3. Запустить анализ (может принимать кастомные теги)
  analyzeProject: async (projectId: string, tags?: string[]): Promise<{ success: boolean; results: any[] }> => {
    const response = await api.post(`/scraper/${projectId}/analyze`, {
      tags, // Передаем массив тегов в Body
    });
    return response.data;
  },

  // 4. Получить историю позиций для графиков (Record<string, Point[]>)
  getProjectHistory: async (projectId: string): Promise<Record<string, HistoryPoint[]>> => {
    const response = await api.get<{ analytics: Record<string, HistoryPoint[]> }>(`/scraper/${projectId}/history`);
    return response.data.analytics;
  },

  // Получить список всех проектов пользователя
  getUserProjects: async (userId: string): Promise<BehanceProject[]> => {
    const response = await api.get<BehanceProject[]>(`/scraper/projects?userId=${userId}`);
    return response.data;
  },

  // Удалить проект
  deleteProject: async (projectId: string, userId: string): Promise<any> => {
    const response = await api.delete(`/scraper/projects/${projectId}?userId=${userId}`);
    return response.data;
  },

  getProjectDetails: async (projectId: string) => {
    const response = await api.get(`/scraper/project/${projectId}`);
    return response.data;
  },

  toggleTagOnChart: async (projectId: string, tagName: string, state: boolean) => {
    await api.patch(`/scraper/${projectId}/tags/chart`, { tagName, state });
  },

  toggleAutoUpdate: async (projectId: string, state: boolean) => {
    const response = await api.patch(`/scraper/projects/${projectId}/schedule`, { isScheduled: state });
    return response.data;
  },

  toggleAllTagsOnChart: async (projectId: string, state: boolean) => {
    await api.patch(`/scraper/projects/${projectId}/tags/chart/bulk`, { state });
  },
};
