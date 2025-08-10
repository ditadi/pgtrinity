import { describe, it, expect, vi, beforeEach } from "vitest";
import NeonAdapter from "../neon/neonAdapter.ts";
import type { NeonAdapterOptions } from "../neon/types.ts";

// Mock fetch globally
global.fetch = vi.fn();

describe("NeonAdapter", () => {
	let adapter: NeonAdapter;
	const validOptions: NeonAdapterOptions = {
		apiKey: "test-api-key",
		projectId: "test-project-id",
		branchName: "test-branch",
	};

	beforeEach(() => {
		vi.clearAllMocks();
		adapter = new NeonAdapter(validOptions);
	});

	describe("validateOptions", () => {
		it("should return true when apiKey and projectId are provided", () => {
			expect(adapter.validateOptions()).toBe(true);
		});

		it("should return false when apiKey is missing", () => {
			adapter = new NeonAdapter({ projectId: "test-project" });
			expect(adapter.validateOptions()).toBe(false);
		});

		it("should return false when projectId is missing", () => {
			adapter = new NeonAdapter({ apiKey: "test-key" });
			expect(adapter.validateOptions()).toBe(false);
		});

		it("should return false when both are missing", () => {
			adapter = new NeonAdapter({});
			expect(adapter.validateOptions()).toBe(false);
		});
	});

	describe("createResources", () => {
		it("should fail early if validation fails", async () => {
			adapter = new NeonAdapter({}); // No credentials
			const result = await adapter.createResources();
			
			expect(result.success).toBe(false);
			expect(result.error?.message).toContain("Missing required configuration");
		});

		it("should handle successful branch creation flow", async () => {
			// Mock the API responses
			const mockFetch = vi.mocked(fetch);
			
			// Mock branches list (no existing branch)
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({
					branches: [{ id: "main-branch", name: "main", primary: true }]
				})
			} as any);
			
			// Mock branch creation
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({
					branch: { id: "new-branch-id", name: "test-branch", operations: [] }
				})
			} as any);
			
			// Mock databases list
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({
					databases: [{ name: "neondb" }]
				})
			} as any);
			
			// Mock roles list
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({
					roles: [{ name: "neondb_owner" }]
				})
			} as any);
			
			// Mock connection string
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({
					uri: "postgresql://user:pass@host/db"
				})
			} as any);

			const result = await adapter.createResources();
			
			expect(result.success).toBe(true);
			expect(result.data).toBe("postgresql://user:pass@host/db");
		});

		it("should handle API errors gracefully", async () => {
			const mockFetch = vi.mocked(fetch);
			
			// Mock API failure
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 401,
				text: () => Promise.resolve("Unauthorized")
			} as any);

			const result = await adapter.createResources();
			
			expect(result.success).toBe(false);
			expect(result.error?.message).toContain("API Error 401");
		});
	});

	describe("createMigrations", () => {
		it("should return success (stubbed)", async () => {
			const result = await adapter.createMigrations("connection-string", ["cache"]);
			expect(result.success).toBe(true);
		});
	});

	describe("checkResources", () => {
		it("should return success (stubbed)", async () => {
			const result = await adapter.checkResources("connection-string");
			expect(result.success).toBe(true);
		});
	});
});