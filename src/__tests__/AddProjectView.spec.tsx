import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AddProjectView } from "../components/dashboard/AddProjectView";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../context/ThemeContextInstance", () => ({
  useTheme: () => ({ theme: "dark" }),
}));

const mockShowToast = vi.fn();
vi.mock("../context/ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

describe("AddProjectView Component", () => {
  const defaultProps = {
    hasCustomTags: false,
    actionLoading: false,
    onImport: vi.fn().mockResolvedValue(undefined),
    onTryDemo: vi.fn().mockResolvedValue(undefined),
    onOpenMobileMenu: vi.fn(),
    onOpenVideoTutorial: vi.fn(),
  };

  it("renders input field and submit button", () => {
    render(<AddProjectView {...defaultProps} />);
    expect(
      screen.getByPlaceholderText("https://www.behance.net/gallery/19824219/My-Case")
    ).toBeDefined();
    expect(screen.getByText("modals.addProject.submitBtn")).toBeDefined();
  });

  it("disables import button when URL is empty", () => {
    render(<AddProjectView {...defaultProps} />);
    const submitBtn = screen.getByText("modals.addProject.submitBtn").closest("button");
    expect(submitBtn?.disabled).toBe(true);
  });

  it("enables submit and calls onImport when entering a valid Behance URL", async () => {
    render(<AddProjectView {...defaultProps} />);
    const input = screen.getByPlaceholderText(
      "https://www.behance.net/gallery/19824219/My-Case"
    );
    fireEvent.change(input, {
      target: { value: "https://www.behance.net/gallery/12345/Awesome-UI" },
    });

    const submitBtn = screen.getByText("modals.addProject.submitBtn").closest("button");
    expect(submitBtn?.disabled).toBe(false);

    fireEvent.click(submitBtn!);
    expect(defaultProps.onImport).toHaveBeenCalledWith(
      "https://www.behance.net/gallery/12345/Awesome-UI",
      undefined
    );
  });

  it("calls onTryDemo when clicking demo project link", () => {
    render(<AddProjectView {...defaultProps} />);
    const demoBtn = screen.getByText("modals.addProject.orViewDemo");
    fireEvent.click(demoBtn);
    expect(defaultProps.onTryDemo).toHaveBeenCalled();
  });
});
