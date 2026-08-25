import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagsMatrix } from '../components/dashboard/TagsMatrix';
import { ThemeContext } from '../context/ThemeContextInstance';
import { ToastProvider } from '../context/ToastContext';

const mockThemeContext = {
  theme: 'dark' as const,
  toggleTheme: vi.fn(),
};

const mockTags = [
  { tag: 'motion design', currentRank: 1, bestRank: 1, previousRank: 2, rankDelta: 1, onChart: true },
  { tag: '3d animation', currentRank: 2, bestRank: 2, previousRank: 3, rankDelta: 1, onChart: true },
  { tag: 'blender 3d', currentRank: 45, bestRank: 40, previousRank: 50, rankDelta: 5, onChart: false },
];

describe('TagsMatrix Component', () => {
  it('renders tags matrix table with filters and tags count', () => {
    const onToggleTagOnChart = vi.fn();
    const onRemoveTag = vi.fn();
    const onAddTags = vi.fn();
    const onToggleAllOnChart = vi.fn();
    const onAddSuggestedTag = vi.fn();
    const onAddCustomTags = vi.fn();

    render(
      <ToastProvider>
        <ThemeContext.Provider value={mockThemeContext}>
          <TagsMatrix
            tags={mockTags}
            suggestedTags={['motion 3d', 'render', 'cinema 4d']}
            hasCustomTags={true}
            onAddSuggestedTag={onAddSuggestedTag}
            onAddCustomTags={onAddCustomTags}
            getTrend={() => 0}
            onToggleTagOnChart={onToggleTagOnChart}
            onRemoveTag={onRemoveTag}
            onAddTags={onAddTags}
            onToggleAllOnChart={onToggleAllOnChart}
          />
        </ThemeContext.Provider>
      </ToastProvider>
    );

    expect(screen.getByText(/motion design/i)).toBeInTheDocument();
    expect(screen.getByText(/3d animation/i)).toBeInTheDocument();
    expect(screen.getByText(/blender 3d/i)).toBeInTheDocument();
  });

  it('triggers onAddCustomTags when clicking ⚡ Добавить все button', () => {
    const onToggleTagOnChart = vi.fn();
    const onRemoveTag = vi.fn();
    const onAddTags = vi.fn();
    const onToggleAllOnChart = vi.fn();
    const onAddSuggestedTag = vi.fn();
    const onAddCustomTags = vi.fn();

    render(
      <ToastProvider>
        <ThemeContext.Provider value={mockThemeContext}>
          <TagsMatrix
            tags={mockTags}
            suggestedTags={['motion 3d', 'render', 'cinema 4d']}
            hasCustomTags={true}
            onAddSuggestedTag={onAddSuggestedTag}
            onAddCustomTags={onAddCustomTags}
            getTrend={() => 0}
            onToggleTagOnChart={onToggleTagOnChart}
            onRemoveTag={onRemoveTag}
            onAddTags={onAddTags}
            onToggleAllOnChart={onToggleAllOnChart}
          />
        </ThemeContext.Provider>
      </ToastProvider>
    );

    const addAllBtn = screen.getByText(/Добавить все/i);
    expect(addAllBtn).toBeInTheDocument();
    fireEvent.click(addAllBtn);
    expect(onAddCustomTags).toHaveBeenCalledWith('motion 3d, render, cinema 4d');
  });
});
