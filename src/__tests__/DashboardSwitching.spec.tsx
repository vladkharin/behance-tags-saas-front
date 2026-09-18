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

const mockProjectA = {
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

const mockDetailsA = {
  activeProject: mockProjectA,
  plan: 'PRO_STREAM' as const,
  tagBalance: 200,
  lastAnalyzedAt: new Date().toISOString(),
  tagsMatrix: [
    { tag: 'perfume', currentRank: 1, previousRank: 2, onChart: true },
    { tag: 'packaging design', currentRank: 3, previousRank: 4, onChart: true },
  ],
};

const mockProjectB = {
  id: 'fintech-crypto-app-id',
  behanceId: '112233',
  title: 'Fintech Crypto Mobile App UI/UX',
  url: 'https://behance.net/gallery/112233/Fintech',
  views: 3100,
  appreciations: 420,
  comments: 31,
  userId: 'user-123',
  lastAnalyzedAt: new Date().toISOString(),
  isScheduled: false,
  analysisStatus: 'IDLE' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockDetailsB = {
  activeProject: mockProjectB,
  plan: 'PRO_STREAM' as const,
  tagBalance: 180,
  lastAnalyzedAt: new Date().toISOString(),
  tagsMatrix: [
    { tag: 'crypto app', currentRank: 4, previousRank: 8, onChart: true },
    { tag: 'fintech ui', currentRank: 2, previousRank: 3, onChart: true },
  ],
};

describe('Dashboard Demo to Real Project Switching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('onboarding_complete', 'true');
    (analyticsService.getUserProjects as any).mockResolvedValue([mockProjectA, mockProjectB]);
    (analyticsService.getProjectDetails as any).mockImplementation((id: string) => {
      if (id === mockProjectB.id) return Promise.resolve(mockDetailsB);
      return Promise.resolve(mockDetailsA);
    });
    (analyticsService.getProjectHistory as any).mockResolvedValue({
      perfume: [{ date: '2026-03-01', rank: 1 }],
      'crypto app': [{ date: '2026-03-01', rank: 4 }],
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

    // 1. Initially loaded with Real project A
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

  it('switches cleanly between two different user projects without leaking stale state', async () => {
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

    await waitFor(() => {
      expect(screen.getAllByText(/ARCHE PERFUME/i).length).toBeGreaterThan(0);
    });

    // Switch to Project B
    const projectBButtons = screen.getAllByText(/Fintech Crypto Mobile App/i);
    fireEvent.click(projectBButtons[0]);

    await waitFor(() => {
      expect(analyticsService.getProjectDetails).toHaveBeenCalledWith('fintech-crypto-app-id');
    });

    await waitFor(() => {
      expect(screen.getAllByText(/#crypto app/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/#fintech ui/i).length).toBeGreaterThan(0);
    });
  });

  it('exits demo mode properly when clicking + Новый проект', async () => {
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

    await waitFor(() => {
      expect(screen.getAllByText(/ARCHE PERFUME/i).length).toBeGreaterThan(0);
    });

    // Enter demo mode
    const demoButtons = screen.getAllByText(/демо-проект/i);
    fireEvent.click(demoButtons[0]);

    await waitFor(() => {
      expect(screen.getAllByText(/Smart Watch UI\/UX Design Case/i).length).toBeGreaterThan(0);
    });

    // Click + Новый проект
    const addProjectBtn = screen.getAllByText(/НОВЫЙ ПРОЕКТ/i)[0];
    fireEvent.click(addProjectBtn);

    // Should display AddProjectView (has Behance case URL input)
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/behance\.net\/gallery/i)).toBeDefined();
    });
  });
});
