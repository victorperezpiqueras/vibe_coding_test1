import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

// Mock fetch helper
export function createMockFetch() {
  return {
    health: (status: string = "healthy") => ({
      ok: true,
      json: () => Promise.resolve({ status }),
    }),
    items: (items: unknown[] = []) => ({
      ok: true,
      json: () => Promise.resolve(items),
    }),
    tags: (tags: unknown[] = []) => ({
      ok: true,
      json: () => Promise.resolve(tags),
    }),
    post: (data: unknown) => ({
      ok: true,
      json: () => Promise.resolve(data),
    }),
    delete: () => ({
      ok: true,
    }),
    error: (message = "Network error") => Promise.reject(new Error(message)),
  };
}

// Setup default mock fetch responses
export function setupMockFetch(
  mockFetch: ReturnType<typeof vi.fn>,
  customHandlers?: (
    url: string,
    options?: RequestInit,
  ) => Promise<Response> | Response | undefined,
) {
  mockFetch.mockImplementation((url: string, options?: RequestInit) => {
    // Allow custom handlers to override
    if (customHandlers) {
      const customResult = customHandlers(url, options);
      if (customResult !== undefined) {
        return customResult;
      }
    }

    // Default handlers
    if (url.includes("/health")) {
      return Promise.resolve(createMockFetch().health());
    }
    if (url.includes("/items/")) {
      return Promise.resolve(createMockFetch().items());
    }
    if (url.includes("/tags/")) {
      return Promise.resolve(createMockFetch().tags());
    }
    return Promise.reject(new Error("Not found"));
  });
}

// Custom render function (can be extended with providers if needed)
export function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { ...options });
}

// eslint-disable-next-line react-refresh/only-export-components
export * from "@testing-library/react";
