import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { RankingsChart } from "../components/dashboard/RankingsChart";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../context/ThemeContextInstance", () => ({
  useTheme: () => ({ theme: "dark" }),
}));

// Mock Recharts ResponsiveContainer to avoid SVG measuring issues in happy-dom
vi.mock("recharts", async () => {
  const actual = await vi.importActual("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

describe("RankingsChart Component", () => {
  const mockNavigatePricing = vi.fn();

  it("shows paywall upgrade prompt when hasHistory is false", () => {
    render(
      <RankingsChart
        hasHistory={false}
        history={{}}
        visibleTags={[]}
        focusedTag={null}
        tagColors={{}}
        onNavigatePricing={mockNavigatePricing}
      />
    );

    expect(screen.getByText("dashboard.chart.historyPaywallTitle")).toBeDefined();
    const upgradeBtn = screen.getByText("dashboard.chart.learnMore");
    fireEvent.click(upgradeBtn);
    expect(mockNavigatePricing).toHaveBeenCalled();
  });

  it("renders expandable chart when hasHistory is true", () => {
    const mockHistory = {
      branding: [
        { date: "2026-09-01", rank: 3 },
        { date: "2026-09-02", rank: 2 },
      ],
    };

    render(
      <RankingsChart
        hasHistory={true}
        history={mockHistory}
        visibleTags={["branding"]}
        focusedTag={null}
        tagColors={{ branding: "#0057ff" }}
        onNavigatePricing={mockNavigatePricing}
      />
    );

    expect(screen.getByText("dashboard.chart.showDetailed")).toBeDefined();
    const toggleBtn = screen.getByText("dashboard.chart.expandBtn");
    fireEvent.click(toggleBtn);

    expect(screen.getByText("dashboard.chart.hideDetailed")).toBeDefined();
  });
});
