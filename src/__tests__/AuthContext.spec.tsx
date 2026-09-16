import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import { AuthProvider } from "../context/AuthContext";
import { useAuth } from "../hooks/useAuth";

vi.mock("../api/auth.service", () => ({
  authService: {
    logout: vi.fn(),
    login: vi.fn(),
  },
}));

vi.mock("../api/axios", () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: {
        userId: "user-123",
        email: "test@example.com",
        plan: "PRO_STREAM",
        isAdmin: true,
      },
    }),
  },
}));

const TestConsumer: React.FC = () => {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? "logged-in" : "guest"}</span>
      <span data-testid="user-id">{user || "none"}</span>
      <span data-testid="admin-status">{isAdmin ? "admin" : "regular"}</span>
      <button onClick={logout}>Log out</button>
    </div>
  );
};

describe("AuthContext & useAuth", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("initializes as unauthenticated when localStorage is empty", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth-status").textContent).toBe("guest");
    expect(screen.getByTestId("user-id").textContent).toBe("none");
    expect(screen.getByTestId("admin-status").textContent).toBe("regular");
  });

  it("initializes as authenticated when token exists and fetches user profile", async () => {
    localStorage.setItem("token", "valid-jwt");
    localStorage.setItem("userId", "user-123");
    localStorage.setItem("isAdmin", "true");

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId("auth-status").textContent).toBe("logged-in");
    expect(screen.getByTestId("user-id").textContent).toBe("user-123");
    expect(screen.getByTestId("admin-status").textContent).toBe("admin");
  });

  it("clears storage and sets unauthenticated on logout", async () => {
    localStorage.setItem("token", "valid-jwt");
    localStorage.setItem("userId", "user-123");

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    const logoutBtn = screen.getByText("Log out");
    act(() => {
      logoutBtn.click();
    });

    expect(screen.getByTestId("auth-status").textContent).toBe("guest");
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("userId")).toBeNull();
  });
});
