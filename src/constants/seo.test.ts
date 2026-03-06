import { describe, it, expect } from "vitest";
import { DEFAULT_SEO } from "./seo";

describe("DEFAULT_SEO", () => {
  it("has required SEO fields", () => {
    expect(DEFAULT_SEO.title).toBe("Next.js App");
    expect(DEFAULT_SEO.description).toBe("A Next.js application");
    expect(DEFAULT_SEO.siteName).toBe("Next.js App");
    expect(DEFAULT_SEO.locale).toBe("en_US");
    expect(DEFAULT_SEO.type).toBe("website");
  });

  it("has keywords array", () => {
    expect(DEFAULT_SEO.keywords).toContain("nextjs");
    expect(DEFAULT_SEO.keywords).toContain("react");
    expect(DEFAULT_SEO.keywords).toContain("typescript");
  });
});
