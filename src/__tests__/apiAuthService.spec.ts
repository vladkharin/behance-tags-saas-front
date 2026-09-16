import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../api/auth.service';
import api from '../api/axios';

vi.mock('../api/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('Frontend authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('register calls /auth/register with credentials', async () => {
    const mockData = { requiresVerification: true, email: 'test@example.com', message: 'Code sent' };
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockData });

    const res = await authService.register({ email: 'test@example.com', password: 'Password123' });

    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      email: 'test@example.com',
      password: 'Password123',
    });
    expect(res).toEqual(mockData);
  });

  it('login calls /auth/login with credentials', async () => {
    const mockData = { access_token: 'jwt_123', user: 'u_1', isAdmin: false };
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockData });

    const res = await authService.login({ email: 'test@example.com', password: 'Password123' });

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'Password123',
    });
    expect(res).toEqual(mockData);
  });

  it('verifyCode calls /auth/verify-code with credentials', async () => {
    const mockData = { access_token: 'jwt_123', user: 'u_1', isAdmin: false };
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockData });

    const res = await authService.verifyCode({ email: 'test@example.com', code: '123456' });

    expect(api.post).toHaveBeenCalledWith('/auth/verify-code', {
      email: 'test@example.com',
      code: '123456',
    });
    expect(res).toEqual(mockData);
  });

  it('resendCode calls /auth/resend-code with email', async () => {
    const mockData = { success: true, message: 'Code resent' };
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockData });

    const res = await authService.resendCode('test@example.com');

    expect(api.post).toHaveBeenCalledWith('/auth/resend-code', { email: 'test@example.com' });
    expect(res).toEqual(mockData);
  });

  it('logout removes token, userId, and isAdmin from localStorage', () => {
    localStorage.setItem('token', 'sample_token');
    localStorage.setItem('userId', 'user_123');
    localStorage.setItem('isAdmin', 'true');

    authService.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('userId')).toBeNull();
    expect(localStorage.getItem('isAdmin')).toBeNull();
  });
});
