import { describe, it, expect, vi, beforeEach } from "vitest";
import api from "../api/axios";

describe("Axios API Client & Interceptors", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("adds Authorization Bearer header when token exists in localStorage", async () => {
    localStorage.setItem("token", "fake-jwt-token-123");

    // Test the request interceptor directly
    const interceptor = (api.interceptors.request as any).handlers[0];
    const config = await interceptor.fulfilled({ headers: {} });

    expect(config.headers.Authorization).toBe("Bearer fake-jwt-token-123");
  });

  it("does not add Authorization header when token is missing", async () => {
    const interceptor = (api.interceptors.request as any).handlers[0];
    const config = await interceptor.fulfilled({ headers: {} });

    expect(config.headers.Authorization).toBeUndefined();
  });

  it("removes token and dispatches auth:unauthorized event on 401 response", async () => {
    localStorage.setItem("token", "expired-token");
    localStorage.setItem("userId", "user-123");

    const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");

    const interceptor = (api.interceptors.response as any).handlers[0];
    const error = {
      response: { status: 401 },
    };

    await expect(interceptor.rejected(error)).rejects.toEqual(error);

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("userId")).toBeNull();
    expect(dispatchEventSpy).toHaveBeenCalled();
  });
});
