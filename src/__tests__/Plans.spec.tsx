import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Plans } from "../pages/Plans";
import { analyticsService } from "../services/analyticsService";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => (opts?.price !== undefined ? `${opts.price}` : key),
    i18n: { language: "ru", changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock("../context/ThemeContextInstance", () => ({
  useTheme: () => ({ theme: "dark", toggleTheme: vi.fn() }),
}));

const mockShowToast = vi.fn();
vi.mock("../context/ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

const mockUseAuth = vi.fn();
vi.mock("../hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("../services/analyticsService", () => ({
  analyticsService: {
    createPayment: vi.fn(),
  },
}));

describe("Plans Page Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
  });

  const renderPlans = () =>
    render(
      <MemoryRouter>
        <Plans onBack={vi.fn()} onNavigateLegal={vi.fn()} />
      </MemoryRouter>
    );

  it("renders all 3 plans with exact ruble prices", () => {
    renderPlans();
    expect(screen.getByText("0 ₽")).toBeDefined();
    expect(screen.getAllByText("390 ₽").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("890 ₽")).toBeDefined();
  });

  it("renders fuel packs with 149 ₽ and 390 ₽ options", () => {
    renderPlans();
    expect(screen.getByText("149 ₽")).toBeDefined();
    expect(screen.getAllByText("390 ₽").length).toBeGreaterThanOrEqual(2);
  });

  it("switches currency to USD and updates displayed prices", () => {
    renderPlans();
    const usdBtn = screen.getByText("USD");
    fireEvent.click(usdBtn);

    expect(screen.getByText("$0")).toBeDefined();
    expect(screen.getAllByText("$3.99").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("$8.99")).toBeDefined();
    expect(screen.getByText("$1.49")).toBeDefined();
  });

  it("initiates payment when clicking select plan button", async () => {
    (analyticsService.createPayment as any).mockResolvedValueOnce({
      url: "https://auth.robokassa.ru/Merchant/Index.aspx?InvoiceID=123",
    });

    renderPlans();
    const selectProBtn = screen.getByText("plans.buttons.getPro");
    fireEvent.click(selectProBtn);

    expect(analyticsService.createPayment).toHaveBeenCalledWith({
      target: "PRO_STREAM",
      type: "PLAN",
      currency: "RUB",
    });
  });

  it("redirects unauthenticated users to auth modal if not logged in", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    renderPlans();

    const selectProBtn = screen.getByText("plans.buttons.getPro");
    fireEvent.click(selectProBtn);

    expect(mockShowToast).toHaveBeenCalledWith(
      expect.stringContaining("Для выбора тарифа"),
      "info"
    );
    expect(analyticsService.createPayment).not.toHaveBeenCalled();
  });
});
