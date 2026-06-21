import api from "../api/axios"; // Твой настроенный инстанс Axios

export interface TagAnalytics {
  tag: string;
  totalViews: number;
  totalAppreciations: number;
}

export interface BehanceProject {
  id: string;
  url: string;
  userId: string;
  createdAt: string;
}

export interface ProjectHistoryItem {
  id: string;
  projectId: string;
  checkedAt: string;
  views: number;
  appreciations: number;
}

export interface DashboardData {
  user: {
    username?: string;
    behanceUrl?: string;
  };
  activeProject?: BehanceProject;
  tagsMatrix: TagAnalytics[];
  isScraping: boolean;
}

export const analyticsService = {
  // 1. Получить сохраненную аналитику / матрицу тегов
  getAnalytics: async (userId: string | null): Promise<DashboardData> => {
    // В зависимости от того, как устроен эндпоинт получения общих данных,
    // ты дергаешь /analytics или соответствующий роут.
    const response = await api.get<DashboardData>("/scraperr/analytics", {
      userId,
    });
    return response.data;
  },

  // 2. Импортировать кейс: POST /scraper/import-case
  importCase: async (url: string, userId: string | null): Promise<BehanceProject> => {
    const response = await api.post<BehanceProject>("/scraper/import-case", {
      url,
      userId, // Пока авторизации нет на бэке, передаем заглушку вручную
    });
    return response.data;
  },

  // 3. Запустить анализ позиций проекта по категориям: POST /scraper/:id/analyze
  analyzeProject: async (projectId: string): Promise<any> => {
    const response = await api.post<any>(`/scraper/${projectId}/analyze`);
    return response.data;
  },

  // 4. Получить историю изменения метрик и выходов в топ: GET /scraper/:id/history
  getProjectHistory: async (projectId: string): Promise<ProjectHistoryItem[]> => {
    const response = await api.get<ProjectHistoryItem[]>(`/scraper/${projectId}/history`);
    return response.data;
  },
};
