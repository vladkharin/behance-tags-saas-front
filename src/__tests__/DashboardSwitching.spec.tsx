import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import { AuthContext } from '../context/AuthContextInstance';
import { ToastProvider } from '../context/ToastContext';
import { ThemeContext } from '../context/ThemeContextInstance';
import { analyticsService } from '../services/analyticsService';

vi.mock('../services/analyticsService', () => ({
  analyticsService: {
    getUserProjects: vi.fn(),
    getProjectDetails: vi.fn(),
    getProjectHistory: vi.fn(),
    toggleAllTagsOnChart: vi.fn().mockResolvedValue({}),
  },
}));

const mockAuthContextValue = {
  user: 'user-123',
  isLoading: false,
  isAuthenticated: true,
  isAdmin: false,
  login: vi.fn(),
  register: vi.fn(),
  verifyCode: vi.fn(),
  resendCode: vi.fn(),
  logout: vi.fn(),
};

const mockRealProject = {
  id: 'arche-perfume-real-id',
  behanceId: '998877',
  title: 'ARCHE PERFUME /BRAND IDENTITY & PACKAGING',
  url: 'https://behance.net/gallery/998877/Arche-Perfume',
  views: 520,
  appreciations: 64,
  comments: 7,
  userId: 'user-123',
  lastAnalyzedAt: new Date().toISOString(),
  isScheduled: true,
  analysisStatus: 'IDLE' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockRealDetails = {
  activeProject: mockRealProject,
  plan: 'PRO_STREAM' as const,
  tagBalance: 200,
  lastAnalyzedAt: new Date().toISOString(),
  tagsMatrix: [
    { tag: 'perfume', currentRank: 1, previousRank: 2, onChart: true },
    { tag: 'packaging design', currentRank: 3, previousRank: 4, onChart: true },
  ],
};

describe('Dashboard Demo to Real Project Switching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('onboarding_complete', 'true');
    (analyticsService.getUserProjects as any).mockResolvedValue([mockRealProject]);
    (analyticsService.getProjectDetails as any).mockResolvedValue(mockRealDetails);
    (analyticsService.getProjectHistory as any).mockResolvedValue({
      perfume: [{ date: '2026-03-01', rank: 1 }],
    });
  });

  it('switches properly from Demo project to Real project and updates tags/metrics', async () => {
    render(
      <MemoryRouter>
        <ThemeContext.Provider value={{ theme: 'dark', toggleTheme: vi.fn() }}>
          <AuthContext.Provider value={mockAuthContextValue}>
            <ToastProvider>
              <Dashboard
                onNavigatePricing={vi.fn()}
                onNavigateLegal={vi.fn()}
                logout={vi.fn()}
                initialDemo={false}
              />
            </ToastProvider>
          </AuthContext.Provider>
        </ThemeContext.Provider>
      </MemoryRouter>
    );

    // 1. Initially loaded with Real project
    await waitFor(() => {
      expect(screen.getAllByText(/ARCHE PERFUME/i).length).toBeGreaterThan(0);
    });

    // 2. Click "⭐ Посмотреть на демо-проекте" in sidebar
    const demoButtons = screen.getAllByText(/демо-проект/i);
    fireEvent.click(demoButtons[0]);

    // 3. Verify we are now in Demo mode
    await waitFor(() => {
      expect(screen.getAllByText(/Smart Watch UI\/UX Design Case/i).length).toBeGreaterThan(0);
    });

    // 4. Now click back on real project in the sidebar
    const realProjectButtons = screen.getAllByText(/ARCHE PERFUME/i);
    fireEvent.click(realProjectButtons[0]);

    // 5. It should call getProjectDetails with the real project ID
    await waitFor(() => {
      expect(analyticsService.getProjectDetails).toHaveBeenCalledWith('arche-perfume-real-id');
    });

    // 6. Real project tags should be displayed and NOT smartwatch tags
    await waitFor(() => {
      expect(screen.getAllByText(/#perfume/i).length).toBeGreaterThan(0);
    });
  });
});
