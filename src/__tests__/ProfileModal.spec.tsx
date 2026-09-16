import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ProfileModal } from "../components/ui/ProfileModal";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../context/ThemeContextInstance", () => ({
  useTheme: () => ({ theme: "dark" }),
}));

describe("ProfileModal Component", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    email: "designer@example.com",
    userPlan: "PRO_STREAM",
    tagBalance: 4500,
    onNavigatePlans: vi.fn(),
    onLogout: vi.fn(),
  };

  it("returns null when isOpen is false", () => {
    const { container } = render(<ProfileModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays user email, plan name and tag balance", () => {
    render(<ProfileModal {...defaultProps} />);
    expect(screen.getByText("designer@example.com")).toBeDefined();
    expect(screen.getByText("PRO_STREAM")).toBeDefined();
    expect(screen.getByText("profile.title")).toBeDefined();
  });

  it("triggers onNavigatePlans when clicking upgrade/change plan", () => {
    render(<ProfileModal {...defaultProps} />);
    const upgradeBtn = screen.getByText("profile.upgradeBtn");
    fireEvent.click(upgradeBtn);
    expect(defaultProps.onNavigatePlans).toHaveBeenCalled();
  });

  it("triggers onLogout when clicking logout button", () => {
    render(<ProfileModal {...defaultProps} />);
    const logoutBtn = screen.getByText("profile.logoutBtn");
    fireEvent.click(logoutBtn);
    expect(defaultProps.onLogout).toHaveBeenCalled();
  });
});
