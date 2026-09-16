import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { MetricsGrid } from "../components/dashboard/MetricsGrid";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../context/ThemeContextInstance", () => ({
  useTheme: () => ({ theme: "dark" }),
}));

vi.mock("../context/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

describe("MetricsGrid Component", () => {
  const defaultProps = {
    stats: {
      top10: 5,
      potential: 3,
      total: 20,
      visibility: 40,
    },
    views: 1250,
    appreciations: 85,
    comments: 18,
    activeFilter: "all" as const,
    onFilterChange: vi.fn(),
    tags: ["branding", "ui ux", "design"],
    top10Tags: ["branding"],
    onCopyTags: vi.fn(),
  };

  it("renders correctly with formatted views and tags stats", () => {
    render(<MetricsGrid {...defaultProps} />);
    expect(screen.getByText("5")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByText("12")).toBeDefined();
    expect(screen.getByText("85")).toBeDefined();
    expect(screen.getByText("18")).toBeDefined();
    expect(screen.getByText("dashboard.metrics.verdictTop10")).toBeDefined();
  });

  it("triggers onFilterChange when clicking filter cards", () => {
    render(<MetricsGrid {...defaultProps} />);
    const top10Card = screen.getByText("5").closest("button");
    if (top10Card) {
      fireEvent.click(top10Card);
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith("top10");
    }
  });

  it("opens copy menu when clicking export tags button", () => {
    render(<MetricsGrid {...defaultProps} />);
    const copyBtn = screen.getByText("dashboard.metrics.copyTagsForBehance");
    fireEvent.click(copyBtn);
    expect(screen.getByText("dashboard.matrix.copyComma")).toBeDefined();
  });
});
