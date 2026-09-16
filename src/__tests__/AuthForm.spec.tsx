import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthForm } from '../components/AuthForm';

const mockLogin = vi.fn();
const mockRegister = vi.fn();
const mockVerifyCode = vi.fn();
const mockResendCode = vi.fn();
const mockShowToast = vi.fn();
const mockNavigatePrivacy = vi.fn();
const mockNavigateTerms = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    verifyCode: mockVerifyCode,
    resendCode: mockResendCode,
    isLoading: false,
  }),
}));

vi.mock('../context/ThemeContextInstance', () => ({
  useTheme: () => ({
    theme: 'dark',
    toggleTheme: vi.fn(),
  }),
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

vi.mock('../utils/confetti', () => ({
  fireConfetti: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ru', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: any) => children,
}));

describe('AuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form by default', () => {
    render(
      <AuthForm
        onNavigatePrivacy={mockNavigatePrivacy}
        onNavigateTerms={mockNavigateTerms}
      />,
    );

    expect(screen.getByPlaceholderText('example@domain.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'auth.loginBtn' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'auth.noAccount' })).toBeInTheDocument();
  });

  it('shows error if submitting empty email or password', () => {
    render(
      <AuthForm
        onNavigatePrivacy={mockNavigatePrivacy}
        onNavigateTerms={mockNavigateTerms}
      />,
    );

    const submitBtn = screen.getByRole('button', { name: 'auth.loginBtn' });
    const form = submitBtn.closest('form')!;
    fireEvent.submit(form);

    expect(screen.getByText('auth.errorEmpty')).toBeInTheDocument();
  });

  it('submits login with entered email and password', async () => {
    mockLogin.mockResolvedValueOnce({});

    render(
      <AuthForm
        onNavigatePrivacy={mockNavigatePrivacy}
        onNavigateTerms={mockNavigateTerms}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('example@domain.com'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'Secret123!' },
    });

    const submitBtn = screen.getByRole('button', { name: 'auth.loginBtn' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'Secret123!',
      });
    });
  });

  it('switches to register mode, clicks terms/privacy and validates policy agreement checkbox', () => {
    render(
      <AuthForm
        onNavigatePrivacy={mockNavigatePrivacy}
        onNavigateTerms={mockNavigateTerms}
      />,
    );

    // Switch to Register mode
    fireEvent.click(screen.getByRole('button', { name: 'auth.noAccount' }));

    // Check that title changed
    expect(screen.getByText('auth.registerTitle')).toBeInTheDocument();

    // Click legal buttons
    fireEvent.click(screen.getByText('auth.agreementOffer'));
    expect(mockNavigateTerms).toHaveBeenCalled();

    fireEvent.click(screen.getByText('auth.agreementPrivacy'));
    expect(mockNavigatePrivacy).toHaveBeenCalled();

    // Enter credentials but don't check checkbox
    fireEvent.change(screen.getByPlaceholderText('example@domain.com'), {
      target: { value: 'newuser@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'Secret123!' },
    });

    // The submit button is disabled until agreement is checked
    const registerBtn = screen.getByRole('button', { name: 'auth.registerBtn' });
    expect(registerBtn).toBeDisabled();
  });

  it('navigates to OTP verification step when registration requires verification', async () => {
    mockRegister.mockResolvedValueOnce({ requiresVerification: true });

    render(
      <AuthForm
        onNavigatePrivacy={mockNavigatePrivacy}
        onNavigateTerms={mockNavigateTerms}
      />,
    );

    // Switch to register
    fireEvent.click(screen.getByRole('button', { name: 'auth.noAccount' }));

    fireEvent.change(screen.getByPlaceholderText('example@domain.com'), {
      target: { value: 'newuser@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'Secret123!' },
    });

    // Check agreement
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    fireEvent.click(screen.getByRole('button', { name: 'auth.registerBtn' }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith('auth.codeSentToast', 'info');
      // Should now render verification step
      expect(screen.getByText('auth.verifyTitle')).toBeInTheDocument();
    });
  });

  it('submits OTP code on verification step', async () => {
    mockRegister.mockResolvedValueOnce({ requiresVerification: true });
    mockVerifyCode.mockResolvedValueOnce({});

    render(
      <AuthForm
        onNavigatePrivacy={mockNavigatePrivacy}
        onNavigateTerms={mockNavigateTerms}
      />,
    );

    // Switch to register and trigger verification step
    fireEvent.click(screen.getByRole('button', { name: 'auth.noAccount' }));
    fireEvent.change(screen.getByPlaceholderText('example@domain.com'), {
      target: { value: 'codeuser@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'Secret123!' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'auth.registerBtn' }));

    await waitFor(() => {
      expect(screen.getByText('auth.verifyTitle')).toBeInTheDocument();
    });

    // Enter 6-digit code
    const codeInput = screen.getByPlaceholderText('••••••');
    fireEvent.change(codeInput, { target: { value: '123456' } });

    const verifyBtn = screen.getByRole('button', { name: 'auth.verifyBtn' });
    fireEvent.click(verifyBtn);

    await waitFor(() => {
      expect(mockVerifyCode).toHaveBeenCalledWith({
        email: 'codeuser@example.com',
        code: '123456',
      });
      expect(mockShowToast).toHaveBeenCalledWith('auth.verifySuccess', 'success');
    });
  });
});
