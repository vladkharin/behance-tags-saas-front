import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContextInstance';
import { ToastProvider } from '../../context/ToastContext';
import { ThemeContext } from '../../context/ThemeContextInstance';
import { Dashboard } from '../../pages/Dashboard';
import { LandingPage } from '../../pages/LandingPage';
import { Plans } from '../../pages/Plans';
import { analyticsService } from '../../services/analyticsService';

vi.mock('../../services/analyticsService', () => ({
  analyticsService: {
    getUserProjects: vi.fn(),
    getProjectDetails: vi.fn(),
    getProjectHistory: vi.fn(),
    toggleAllTagsOnChart: vi.fn().mockResolvedValue({}),
  },
}));

const mockProject = {
  id: 'e2e-user-case-1',
  behanceId: '887766',
  title: 'Luxury Perfume Identity & Web Experience',
  url: 'https://behance.net/gallery/887766/Luxury-Perfume',
  views: 940,
  appreciations: 120,
  comments: 18,
  userId: 'e2e-user',
  lastAnalyzedAt: new Date().toISOString(),
  isScheduled: true,
  analysisStatus: 'IDLE' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockProjectDetails = {
  activeProject: mockProject,
  plan: 'PRO_STREAM' as const,
  tagBalance: 300,
  lastAnalyzedAt: new Date().toISOString(),
  tagsMatrix: [
    { tag: 'perfume packaging', currentRank: 2, previousRank: 5, onChart: true },
    { tag: 'luxury identity', currentRank: 4, previousRank: 9, onChart: true },
    { tag: 'branding showcase', currentRank: 12, previousRank: 16, onChart: true },
  ],
};

const mockAuthContext = {
  user: 'e2e-user',
  isLoading: false,
  isAuthenticated: true,
  isAdmin: false,
  login: vi.fn(),
  register: vi.fn(),
  verifyCode: vi.fn(),
  resendCode: vi.fn(),
  logout: vi.fn(),
};

// Application shell wrapper for complete E2E user flows
const AppTestFlow: React.FC<{ initialRoute?: string; isAuth?: boolean }> = ({
  initialRoute = '/',
  isAuth = true,
}) => {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <ThemeContext.Provider value={{ theme: 'dark', toggleTheme: vi.fn() }}>
        <AuthContext.Provider value={{ ...mockAuthContext, isAuthenticated: isAuth }}>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthContext.Provider>
      </ThemeContext.Provider>
    </MemoryRouter>
  );
};

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LandingPage
            onNavigateAuth={() => navigate('/auth')}
            onTryDemo={() => navigate('/demo')}
            onNavigatePlans={() => navigate('/plans')}
            onNavigateLegal={() => {}}
          />
        }
      />
      <Route
        path="/demo"
        element={
          <Dashboard
            onNavigatePricing={() => navigate('/plans')}
            onNavigateLegal={() => {}}
            logout={() => navigate('/')}
            initialDemo={true}
          />
        }
      />
      <Route
        path="/app"
        element={
          <Dashboard
            onNavigatePricing={() => navigate('/plans')}
            onNavigateLegal={() => {}}
            logout={() => navigate('/')}
            initialDemo={false}
          />
        }
      />
      <Route
        path="/plans"
        element={<Plans onBack={() => navigate('/app')} onNavigateLegal={() => {}} />}
      />
    </Routes>
  );
};

describe('E2E Full User Journey: Landing ➔ Demo ➔ Dashboard ➔ Project Isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('onboarding_complete', 'true');
    (analyticsService.getUserProjects as any).mockResolvedValue([mockProject]);
    (analyticsService.getProjectDetails as any).mockResolvedValue(mockProjectDetails);
    (analyticsService.getProjectHistory as any).mockResolvedValue({
      'perfume packaging': [{ date: '2026-03-01', rank: 2 }],
    });
  });

  it('E2E: Guest visits landing, clicks "Попробовать демо", explores demo, and views demo metrics', async () => {
    render(<AppTestFlow initialRoute="/" isAuth={false} />);

    // Landing page hero
    expect(screen.getAllByText(/BeRanked/i).length).toBeGreaterThan(0);

    // Click "Попробовать демо" on Landing
    const tryDemoBtn = screen.getAllByText(/демо/i)[0];
    fireEvent.click(tryDemoBtn);

    // Navigates to Demo dashboard
    await waitFor(() => {
      expect(screen.getAllByText(/Smart Watch UI\/UX Design Case/i).length).toBeGreaterThan(0);
    });

    // Check that Demo banner is shown
    expect(screen.getAllByText(/DEMO/i).length).toBeGreaterThan(0);
  });

  it('E2E: Logged-in user navigates between dashboard, demo, and plans with zero state pollution', async () => {
    render(<AppTestFlow initialRoute="/app" isAuth={true} />);

    // 1. Dashboard loads user's real project
    await waitFor(() => {
      expect(screen.getAllByText(/Luxury Perfume Identity/i).length).toBeGreaterThan(0);
    });

    // Verify real project tags are present
    expect(screen.getAllByText(/#perfume packaging/i).length).toBeGreaterThan(0);

    // 2. Open plans from sidebar
    const plansButtons = screen.getAllByText(/ТАРИФЫ/i);
    fireEvent.click(plansButtons[0]);

    // Plans page displays prices
    await waitFor(() => {
      expect(screen.getAllByText(/390/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/890/i).length).toBeGreaterThan(0);
    });

    // 3. Return to App by clicking BeRanked logo
    const logoBackBtn = screen.getAllByText(/BeRanked/i)[0];
    fireEvent.click(logoBackBtn);

    // Back in dashboard with real project
    await waitFor(() => {
      expect(screen.getAllByText(/Luxury Perfume Identity/i).length).toBeGreaterThan(0);
    });

    // 4. Switch to Demo
    const demoButton = screen.getAllByText(/демо-проект/i)[0];
    fireEvent.click(demoButton);

    await waitFor(() => {
      expect(screen.getAllByText(/Smart Watch UI\/UX Design Case/i).length).toBeGreaterThan(0);
    });

    // 5. Switch back to Real project
    const realProjectButton = screen.getAllByText(/Luxury Perfume Identity/i)[0];
    fireEvent.click(realProjectButton);

    // Verify Real project is fully restored
    await waitFor(() => {
      expect(analyticsService.getProjectDetails).toHaveBeenCalledWith('e2e-user-case-1');
    });

    await waitFor(() => {
      expect(screen.getAllByText(/#perfume packaging/i).length).toBeGreaterThan(0);
    });
  });
});
