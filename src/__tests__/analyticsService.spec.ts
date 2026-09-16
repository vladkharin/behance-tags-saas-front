import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyticsService } from '../services/analyticsService';
import api from '../api/axios';

vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('analyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAnalytics calls /scraper/analytics', async () => {
    const mock = { user: { id: 'u1' }, tagsMatrix: [] };
    vi.mocked(api.get).mockResolvedValueOnce({ data: mock });

    const res = await analyticsService.getAnalytics();
    expect(api.get).toHaveBeenCalledWith('/scraper/analytics');
    expect(res).toEqual(mock);
  });

  it('getDashboardSummary calls /scraper/analytics/summary', async () => {
    const mock = { totalProjects: 2, totalViews: 500 };
    vi.mocked(api.get).mockResolvedValueOnce({ data: mock });

    const res = await analyticsService.getDashboardSummary();
    expect(api.get).toHaveBeenCalledWith('/scraper/analytics/summary');
    expect(res).toEqual(mock);
  });

  it('getProjectsOverview calls /scraper/projects/overview', async () => {
    const mock = [{ id: 'p1', title: 'Case 1' }];
    vi.mocked(api.get).mockResolvedValueOnce({ data: mock });

    const res = await analyticsService.getProjectsOverview();
    expect(api.get).toHaveBeenCalledWith('/scraper/projects/overview');
    expect(res).toEqual(mock);
  });

  it('importCase calls POST /scraper/import-case with url', async () => {
    const mock = { id: 'p1', title: 'Imported' };
    vi.mocked(api.post).mockResolvedValueOnce({ data: mock });

    const res = await analyticsService.importCase('https://behance.net/gallery/123/test');
    expect(api.post).toHaveBeenCalledWith('/scraper/import-case', {
      url: 'https://behance.net/gallery/123/test',
    });
    expect(res).toEqual(mock);
  });

  it('analyzeProject calls POST /scraper/:id/analyze with tags', async () => {
    const mock = { success: true, message: 'Queued' };
    vi.mocked(api.post).mockResolvedValueOnce({ data: mock });

    const res = await analyticsService.analyzeProject('p-1', ['design', 'ui']);
    expect(api.post).toHaveBeenCalledWith('/scraper/p-1/analyze', {
      tags: ['design', 'ui'],
    });
    expect(res).toEqual(mock);
  });

  it('getProjectHistory calls GET /scraper/:id/history and returns analytics map', async () => {
    const mock = { analytics: { design: [{ date: '2026-09-10', rank: 5 }] } };
    vi.mocked(api.get).mockResolvedValueOnce({ data: mock });

    const res = await analyticsService.getProjectHistory('p-1');
    expect(api.get).toHaveBeenCalledWith('/scraper/p-1/history');
    expect(res).toEqual(mock.analytics);
  });

  it('getUserProjects calls GET /scraper/projects', async () => {
    const mock = [{ id: 'p-1' }];
    vi.mocked(api.get).mockResolvedValueOnce({ data: mock });

    const res = await analyticsService.getUserProjects();
    expect(api.get).toHaveBeenCalledWith('/scraper/projects');
    expect(res).toEqual(mock);
  });

  it('deleteProject calls DELETE /scraper/projects/:id', async () => {
    const mock = { id: 'p-1' };
    vi.mocked(api.delete).mockResolvedValueOnce({ data: mock });

    const res = await analyticsService.deleteProject('p-1');
    expect(api.delete).toHaveBeenCalledWith('/scraper/projects/p-1');
    expect(res).toEqual(mock);
  });

  it('removeTagFromProject calls DELETE with encoded tag name', async () => {
    const mock = { success: true, message: 'Deleted' };
    vi.mocked(api.delete).mockResolvedValueOnce({ data: mock });

    const res = await analyticsService.removeTagFromProject('p-1', 'graphic design');
    expect(api.delete).toHaveBeenCalledWith('/scraper/projects/p-1/tags/graphic%20design');
    expect(res).toEqual(mock);
  });

  it('getProjectDetails calls GET /scraper/project/:id', async () => {
    const mock = { activeProject: { id: 'p-1' }, tagsMatrix: [] };
    vi.mocked(api.get).mockResolvedValueOnce({ data: mock });

    const res = await analyticsService.getProjectDetails('p-1');
    expect(api.get).toHaveBeenCalledWith('/scraper/project/p-1');
    expect(res).toEqual(mock);
  });

  it('toggleTagOnChart calls PATCH /scraper/:id/tags/chart', async () => {
    vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });

    await analyticsService.toggleTagOnChart('p-1', 'ui', true);
    expect(api.patch).toHaveBeenCalledWith('/scraper/p-1/tags/chart', {
      tagName: 'ui',
      state: true,
    });
  });

  it('toggleAllTagsOnChart calls PATCH /scraper/projects/:id/tags/chart/bulk', async () => {
    const mock = { count: 5 };
    vi.mocked(api.patch).mockResolvedValueOnce({ data: mock });

    const res = await analyticsService.toggleAllTagsOnChart('p-1', false);
    expect(api.patch).toHaveBeenCalledWith('/scraper/projects/p-1/tags/chart/bulk', {
      state: false,
    });
    expect(res).toEqual(mock);
  });

  it('toggleAutoUpdate calls PATCH /scraper/projects/:id/schedule', async () => {
    const mock = { id: 'p-1', isScheduled: true };
    vi.mocked(api.patch).mockResolvedValueOnce({ data: mock });

    const res = await analyticsService.toggleAutoUpdate('p-1', true);
    expect(api.patch).toHaveBeenCalledWith('/scraper/projects/p-1/schedule', {
      isScheduled: true,
    });
    expect(res).toEqual(mock);
  });

  it('createPayment calls POST /billing/create-payment', async () => {
    const mock = { url: 'https://pay.url' };
    vi.mocked(api.post).mockResolvedValueOnce({ data: mock });

    const res = await analyticsService.createPayment({
      target: 'PRO_STREAM',
      type: 'PLAN',
      currency: 'RUB',
    });
    expect(api.post).toHaveBeenCalledWith('/billing/create-payment', {
      target: 'PRO_STREAM',
      type: 'PLAN',
      currency: 'RUB',
    });
    expect(res).toEqual(mock);
  });

  it('getDemoProject calls GET /scraper/demo', async () => {
    const mock = { id: 'demo-showcase-project' };
    vi.mocked(api.get).mockResolvedValueOnce({ data: mock });

    const res = await analyticsService.getDemoProject();
    expect(api.get).toHaveBeenCalledWith('/scraper/demo');
    expect(res).toEqual(mock);
  });
});
