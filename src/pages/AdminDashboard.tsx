import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "../context/ThemeContextInstance";
import { useToast } from "../context/ToastContext";
import { adminService } from "../services/adminService";
import { AdminHeader, type AdminTab } from "../components/admin/AdminHeader";
import { AdminOverviewTab } from "../components/admin/AdminOverviewTab";
import { AdminUsersTab } from "../components/admin/AdminUsersTab";
import { AdminPaymentsTab } from "../components/admin/AdminPaymentsTab";
import { AdminActivityTab } from "../components/admin/AdminActivityTab";
import { UserDetailsModal } from "../components/admin/UserDetailsModal";
import { AdjustBalanceModal } from "../components/admin/AdjustBalanceModal";
import { ChangePlanModal } from "../components/admin/ChangePlanModal";
import type {
  AdminActivityItem,
  AdminPaymentsResponse,
  AdminSummaryResponse,
  AdminUserDetails,
  AdminUserItem,
  AdminUsersResponse,
} from "../types/admin.types";
import type { PlanType } from "../types/analytics.types";

interface AdminDashboardProps {
  onBackToApp: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToApp }) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // DATA STATES
  const [summary, setSummary] = useState<AdminSummaryResponse | null>(null);
  const [usersData, setUsersData] = useState<AdminUsersResponse | null>(null);
  const [paymentsData, setPaymentsData] = useState<AdminPaymentsResponse | null>(null);
  const [activity, setActivity] = useState<AdminActivityItem[]>([]);

  // FILTER & PAGINATION STATES
  const [userSearch, setUserSearch] = useState("");
  const [userPlanFilter, setUserPlanFilter] = useState<PlanType | undefined>(undefined);
  const [userPage, setUserPage] = useState(1);

  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<"PENDING" | "SUCCESS" | "FAILED" | undefined>(undefined);
  const [paymentProviderFilter, setPaymentProviderFilter] = useState<"ROBOKASSA" | "LAVA" | undefined>(undefined);
  const [paymentPage, setPaymentPage] = useState(1);

  // MODALS STATE
  const [selectedUserDetails, setSelectedUserDetails] = useState<AdminUserDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [adjustBalanceTarget, setAdjustBalanceTarget] = useState<{ id: string; email: string; tagBalance: number } | null>(null);
  const [changePlanTarget, setChangePlanTarget] = useState<{ id: string; email: string; plan: PlanType; planExpiresAt?: string | null } | null>(null);

  // FETCH SUMMARY
  const fetchSummary = useCallback(async () => {
    try {
      const res = await adminService.getSummary();
      setSummary(res);
    } catch (e) {
      console.error("Failed to load admin summary", e);
      showToast("Ошибка загрузки сводки", "error");
    }
  }, [showToast]);

  // FETCH USERS
  const fetchUsers = useCallback(async () => {
    try {
      const res = await adminService.getUsers({
        search: userSearch,
        plan: userPlanFilter,
        page: userPage,
        limit: 15,
      });
      setUsersData(res);
    } catch (e) {
      console.error("Failed to load users", e);
      showToast("Ошибка загрузки пользователей", "error");
    }
  }, [userSearch, userPlanFilter, userPage, showToast]);

  // FETCH PAYMENTS
  const fetchPayments = useCallback(async () => {
    try {
      const res = await adminService.getPayments({
        search: paymentSearch,
        status: paymentStatusFilter,
        provider: paymentProviderFilter,
        page: paymentPage,
        limit: 15,
      });
      setPaymentsData(res);
    } catch (e) {
      console.error("Failed to load payments", e);
      showToast("Ошибка загрузки журнала платежей", "error");
    }
  }, [paymentSearch, paymentStatusFilter, paymentProviderFilter, paymentPage, showToast]);

  // FETCH ACTIVITY
  const fetchActivity = useCallback(async () => {
    try {
      const res = await adminService.getActivityFeed(35);
      setActivity(res);
    } catch (e) {
      console.error("Failed to load activity", e);
      showToast("Ошибка загрузки ленты активности", "error");
    }
  }, [showToast]);

  // LOAD DATA BASED ON TAB
  useEffect(() => {
    if (activeTab === "overview") {
      fetchSummary();
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "payments") {
      fetchPayments();
    } else if (activeTab === "activity") {
      fetchActivity();
    }
  }, [activeTab, fetchSummary, fetchUsers, fetchPayments, fetchActivity]);

  const handleGlobalRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (activeTab === "overview") await fetchSummary();
      if (activeTab === "users") await fetchUsers();
      if (activeTab === "payments") await fetchPayments();
      if (activeTab === "activity") await fetchActivity();
      showToast("Данные успешно обновлены", "success", undefined, 1500);
    } finally {
      setIsRefreshing(false);
    }
  };

  // OPEN USER DETAILS
  const handleOpenUserDetails = async (userId: string) => {
    setDetailsLoading(true);
    setSelectedUserDetails(null);
    try {
      const res = await adminService.getUserDetails(userId);
      setSelectedUserDetails(res);
    } catch (e) {
      showToast("Не удалось загрузить карточку пользователя", "error");
    } finally {
      setDetailsLoading(false);
    }
  };

  // ADJUST BALANCE SUBMIT
  const handleAdjustBalanceSubmit = async (userId: string, amount: number, mode: "SET" | "INCREMENT" | "DECREMENT") => {
    try {
      await adminService.adjustUserBalance(userId, amount, mode);
      showToast("Баланс тегов успешно изменен!", "success");
      fetchUsers();
      if (selectedUserDetails && selectedUserDetails.id === userId) {
        handleOpenUserDetails(userId);
      }
    } catch (e) {
      showToast("Ошибка при изменении баланса", "error");
    }
  };

  // CHANGE PLAN SUBMIT
  const handleChangePlanSubmit = async (userId: string, plan: PlanType, planExpiresAt?: string) => {
    try {
      await adminService.updateUserPlan(userId, plan, planExpiresAt);
      showToast(`Тариф пользователя успешно изменен на ${plan}!`, "success");
      fetchUsers();
      if (selectedUserDetails && selectedUserDetails.id === userId) {
        handleOpenUserDetails(userId);
      }
    } catch (e) {
      showToast("Ошибка при смене тарифа", "error");
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 flex flex-col ${
        isDark ? "bg-[#0a0a0a] text-white" : "bg-behance-grayBg text-behance-black"
      }`}
    >
      {/* HEADER */}
      <AdminHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBackToApp={onBackToApp}
        onRefresh={handleGlobalRefresh}
        isRefreshing={isRefreshing}
      />

      {/* MAIN BODY */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-8">
        {activeTab === "overview" && (
          <AdminOverviewTab
            summary={summary}
            loading={!summary && isRefreshing}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "users" && (
          <AdminUsersTab
            usersData={usersData}
            loading={!usersData && isRefreshing}
            search={userSearch}
            planFilter={userPlanFilter}
            page={userPage}
            onSearchChange={(q) => {
              setUserSearch(q);
              setUserPage(1);
            }}
            onPlanFilterChange={(p) => {
              setUserPlanFilter(p);
              setUserPage(1);
            }}
            onPageChange={setUserPage}
            onSelectUser={handleOpenUserDetails}
            onAdjustBalance={(u) => setAdjustBalanceTarget({ id: u.id, email: u.email, tagBalance: u.tagBalance })}
            onChangePlan={(u) => setChangePlanTarget({ id: u.id, email: u.email, plan: u.plan, planExpiresAt: u.planExpiresAt })}
          />
        )}

        {activeTab === "payments" && (
          <AdminPaymentsTab
            paymentsData={paymentsData}
            loading={!paymentsData && isRefreshing}
            search={paymentSearch}
            statusFilter={paymentStatusFilter}
            providerFilter={paymentProviderFilter}
            page={paymentPage}
            onSearchChange={(q) => {
              setPaymentSearch(q);
              setPaymentPage(1);
            }}
            onStatusFilterChange={(s) => {
              setPaymentStatusFilter(s);
              setPaymentPage(1);
            }}
            onProviderFilterChange={(p) => {
              setPaymentProviderFilter(p);
              setPaymentPage(1);
            }}
            onPageChange={setPaymentPage}
          />
        )}

        {activeTab === "activity" && (
          <AdminActivityTab
            activity={activity}
            loading={activity.length === 0 && isRefreshing}
          />
        )}
      </main>

      {/* MODALS */}
      <UserDetailsModal
        user={selectedUserDetails}
        loading={detailsLoading}
        onClose={() => setSelectedUserDetails(null)}
        onAdjustBalance={(u) => setAdjustBalanceTarget({ id: u.id, email: u.email, tagBalance: u.tagBalance })}
        onChangePlan={(u) => setChangePlanTarget({ id: u.id, email: u.email, plan: u.plan, planExpiresAt: u.planExpiresAt })}
      />

      <AdjustBalanceModal
        user={adjustBalanceTarget}
        onClose={() => setAdjustBalanceTarget(null)}
        onSubmit={handleAdjustBalanceSubmit}
      />

      <ChangePlanModal
        user={changePlanTarget}
        onClose={() => setChangePlanTarget(null)}
        onSubmit={handleChangePlanSubmit}
      />
    </div>
  );
};
