import { describe, it, expect } from "vitest";
import { createAdapter } from "../index.ts";
import NeonAdapter from "../neon/neonAdapter.ts";

describe("Adapter Factory", () => {
	describe("createAdapter", () => {
		it("should create NeonAdapter for 'neon' type", () => {
			const adapter = createAdapter("neon", {
				apiKey: "test-key",
				projectId: "test-project"
			});
			
			expect(adapter).toBeInstanceOf(NeonAdapter);
		});

		it("should throw error for unsupported adapter type", () => {
			expect(() => {
				// @ts-expect-error Testing invalid type
				createAdapter("mysql", {});
			}).toThrow("Unsupported adapter type: mysql");
		});
	});
});