/// <reference types="jest" />

import { authFetch, getCookie } from "./authFetch";

describe("authFetch", () => {
  beforeEach(() => {
    // Mock global.fetch
    // @ts-ignore
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    );

    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "",
    });
  });

  it("should add Authorization header if token cookie exists", async () => {
    document.cookie = "token=abc123";

    await authFetch("/api/test");

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer abc123" }),
      })
    );
  });

  it("should not add Authorization header if token cookie does not exist", async () => {
    document.cookie = "other=val";

    await authFetch("/api/test");

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/test",
      expect.not.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.any(String),
        }),
      })
    );
  });
});

describe("getCookie", () => {
  it("should return the value of the cookie if it exists", () => {
    document.cookie = "foo=bar";
    expect(getCookie("foo")).toBe("bar");
  });

  it("should return undefined if the cookie does not exist", () => {
    document.cookie = "baz=qux";
    expect(getCookie("notfound")).toBeUndefined();
  });
});
