import { ApiError, resolveAPIBaseURL } from "@/lib/http";

describe("resolveAPIBaseURL", () => {
  it("uses the configured API URL without a trailing slash", () => {
    expect(resolveAPIBaseURL("https://api.example.com/", "app.example.com")).toBe(
      "https://api.example.com",
    );
  });

  it("falls back to the local API while running locally", () => {
    expect(resolveAPIBaseURL("", "localhost")).toBe("http://localhost:8080");
  });

  it("throws a clear deployment error when the API URL is missing in production", () => {
    expect(() => resolveAPIBaseURL("", "fullstack-taskmanager-production.up.railway.app")).toThrow(
      ApiError,
    );
  });
});
