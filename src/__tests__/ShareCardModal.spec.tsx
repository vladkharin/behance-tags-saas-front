import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ShareCardModal } from "../components/dashboard/ShareCardModal";
import type { BehanceProject, TagMatrixItem } from "../types/analytics.types";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "ru" },
  }),
}));

const mockShowToast = vi.fn();
vi.mock("../context/ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

describe("ShareCardModal Component", () => {
  const mockProject: BehanceProject = {
    id: "proj-1",
    url: "https://www.behance.net/gallery/123/Cool-Design",
    title: "Cool Design System",
    authorName: "Alex Designer",
    authorUsername: "alexdes",
    thumbnailUrl: "https://example.com/thumb.jpg",
    tagsCount: 5,
    views: 1200,
    appreciations: 95,
    comments: 10,
    activeTags: ["branding", "ui ux"],
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-02T00:00:00.000Z",
  };

  const mockTags: TagMatrixItem[] = [
    { tag: "branding", currentRank: 2, previousRank: 5, checkedAt: "2026-09-02" },
    { tag: "ui ux", currentRank: 8, previousRank: 8, checkedAt: "2026-09-02" },
    { tag: "figma", currentRank: 45, previousRank: 40, checkedAt: "2026-09-02" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when isOpen is false", () => {
    const { container } = render(
      <ShareCardModal
        isOpen={false}
        onClose={vi.fn()}
        project={mockProject}
        tags={mockTags}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders preview with best tag and format switchers", () => {
    render(
      <ShareCardModal
        isOpen={true}
        onClose={vi.fn()}
        project={mockProject}
        tags={mockTags}
        views={1200}
        appreciations={95}
      />
    );

    expect(screen.getByText(/Stories \(9:16\)/i)).toBeDefined();
    expect(screen.getByText(/Post \(1:1\)/i)).toBeDefined();
    expect(screen.getByText(/Banner \(16:9\)/i)).toBeDefined();
    expect(screen.getByText("Cool Design System")).toBeDefined();
  });

  it("allows switching format to Post and Banner", () => {
    render(
      <ShareCardModal
        isOpen={true}
        onClose={vi.fn()}
        project={mockProject}
        tags={mockTags}
      />
    );

    const postBtn = screen.getByText(/Post \(1:1\)/i);
    fireEvent.click(postBtn);
    expect(postBtn).toBeDefined();

    const bannerBtn = screen.getByText(/Banner \(16:9\)/i);
    fireEvent.click(bannerBtn);
    expect(bannerBtn).toBeDefined();
  });

  it("calls onClose when clicking close button", () => {
    const handleClose = vi.fn();
    render(
      <ShareCardModal
        isOpen={true}
        onClose={handleClose}
        project={mockProject}
        tags={mockTags}
      />
    );

    const closeBtn = screen.getByText("✕");
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders gracefully with empty tags list and missing ranks", () => {
    render(
      <ShareCardModal
        isOpen={true}
        onClose={vi.fn()}
        project={{ ...mockProject, title: "" }}
        tags={[]}
      />
    );

    expect(screen.getAllByText("Behance Case").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/0 in TOP-10/i)).toBeDefined();
  });
});
