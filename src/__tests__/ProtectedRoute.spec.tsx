import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';

let mockAuth = {
  isAuthenticated: false,
  isAdmin: false,
  isLoading: false,
};

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockAuth,
}));

const renderWithRouter = (initialPath: string) => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/auth" element={<div>Auth Page</div>} />
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route index element={<div>Dashboard Content</div>} />
        </Route>
        <Route path="/admin" element={<ProtectedRoute adminOnly={true} />}>
          <Route index element={<div>Admin Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockAuth = {
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
    };
  });

  it('renders loading spinner when auth is checking state', () => {
    mockAuth = { isAuthenticated: false, isAdmin: false, isLoading: true };

    const { container } = renderWithRouter('/dashboard');

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated user to /auth', () => {
    mockAuth = { isAuthenticated: false, isAdmin: false, isLoading: false };

    renderWithRouter('/dashboard');

    expect(screen.getByText('Auth Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('redirects non-admin user trying to access adminOnly route to /', () => {
    mockAuth = { isAuthenticated: true, isAdmin: false, isLoading: false };

    renderWithRouter('/admin');

    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('renders protected child component for authenticated user', () => {
    mockAuth = { isAuthenticated: true, isAdmin: false, isLoading: false };

    renderWithRouter('/dashboard');

    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('renders admin content for authenticated admin user', () => {
    mockAuth = { isAuthenticated: true, isAdmin: true, isLoading: false };

    renderWithRouter('/admin');

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});
