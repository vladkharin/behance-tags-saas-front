import api from "../api/axios";
import type {
  AdminActivityItem,
  AdminPaymentItem,
  AdminPaymentsResponse,
  AdminSummaryResponse,
  AdminUserDetails,
  AdminUserItem,
  AdminUsersResponse,
} from "../types/admin.types";
import type { PlanType } from "../types/analytics.types";

export interface GetUsersParams {
  search?: string;
  plan?: PlanType;
  page?: number;
  limit?: number;
}

export interface GetPaymentsParams {
  status?: "PENDING" | "SUCCESS" | "FAILED";
  provider?: "ROBOKASSA" | "LAVA";
  search?: string;
  page?: number;
  limit?: number;
}

export const adminService = {
  // 1. Сводка платформы
  getSummary: async (): Promise<AdminSummaryResponse> => {
    const response = await api.get<AdminSummaryResponse>("/admin/summary");
    return response.data;
  },

  // 2. Список пользователей
  getUsers: async (params?: GetUsersParams): Promise<AdminUsersResponse> => {
    const response = await api.get<AdminUsersResponse>("/admin/users", { params });
    return response.data;
  },

  // 3. Детали пользователя
  getUserDetails: async (userId: string): Promise<AdminUserDetails> => {
    const response = await api.get<AdminUserDetails>(`/admin/users/${userId}`);
    return response.data;
  },

  // 4. Смена тарифа пользователя
  updateUserPlan: async (
    userId: string,
    plan: PlanType,
    planExpiresAt?: string,
  ): Promise<AdminUserItem> => {
    const response = await api.patch<AdminUserItem>(`/admin/users/${userId}/plan`, {
      plan,
      planExpiresAt,
    });
    return response.data;
  },

  // 5. Корректировка баланса тегов
  adjustUserBalance: async (
    userId: string,
    amount: number,
    mode: "SET" | "INCREMENT" | "DECREMENT",
  ): Promise<AdminUserItem> => {
    const response = await api.patch<AdminUserItem>(`/admin/users/${userId}/balance`, {
      amount,
      mode,
    });
    return response.data;
  },

  // 6. Список платежей
  getPayments: async (params?: GetPaymentsParams): Promise<AdminPaymentsResponse> => {
    const response = await api.get<AdminPaymentsResponse>("/admin/payments", { params });
    return response.data;
  },

  // 7. Живая лента активности
  getActivityFeed: async (limit = 30): Promise<AdminActivityItem[]> => {
    const response = await api.get<AdminActivityItem[]>("/admin/activity", {
      params: { limit },
    });
    return response.data;
  },
};
