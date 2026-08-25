import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectsSidebar } from '../components/dashboard/ProjectsSidebar';
import { ThemeContext } from '../context/ThemeContextInstance';

const mockThemeContext = {
  theme: 'dark' as const,
  toggleTheme: vi.fn(),
};

const mockProjects = [
  {
    id: 'proj-1',
    behanceId: '12345',
    title: 'Awesome 3D Animation Case',
    url: 'https://behance.net/gallery/12345/3D',
    views: 1200,
    appreciations: 150,
    comments: 12,
    userId: 'u1',
    lastAnalyzedAt: new Date().toISOString(),
    isScheduled: true,
    analysisStatus: 'IDLE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('ProjectsSidebar Component', () => {
  it('renders projects sidebar with project list and demo button', () => {
    const onSelectProject = vi.fn();
    const onAddProject = vi.fn();
    const onTryDemo = vi.fn();
    const onCloseMobile = vi.fn();

    render(
      <ThemeContext.Provider value={mockThemeContext}>
        <ProjectsSidebar
          projects={mockProjects}
          activeProjectId="proj-1"
          onSelectProject={onSelectProject}
          onAddProject={onAddProject}
          onTryDemo={onTryDemo}
          onCloseMobile={onCloseMobile}
          userPlan="PRO_STREAM"
          tagBalance={500}
        />
      </ThemeContext.Provider>
    );

    expect(screen.getAllByText(/Awesome 3D Animation Case/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/демо-проект/i).length).toBeGreaterThan(0);
  });

  it('triggers onTryDemo when clicking the demo showcase button', () => {
    const onSelectProject = vi.fn();
    const onAddProject = vi.fn();
    const onTryDemo = vi.fn();
    const onCloseMobile = vi.fn();

    render(
      <ThemeContext.Provider value={mockThemeContext}>
        <ProjectsSidebar
          projects={mockProjects}
          activeProjectId="proj-1"
          onSelectProject={onSelectProject}
          onAddProject={onAddProject}
          onTryDemo={onTryDemo}
          onCloseMobile={onCloseMobile}
          userPlan="FREE"
          tagBalance={90}
        />
      </ThemeContext.Provider>
    );

    const demoBtn = screen.getAllByText(/демо-проект/i)[0];
    fireEvent.click(demoBtn);
    expect(onTryDemo).toHaveBeenCalled();
  });
});
