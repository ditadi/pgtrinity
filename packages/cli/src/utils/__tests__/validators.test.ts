import { describe, it, expect, vi } from "vitest";
import ora from "ora";
import { validateAdapter, validateModules } from "../validators.ts";

describe("validators", () => {
	const mockSpinner = ora();

	describe("validateAdapter", () => {
		it("should return true for supported adapter", () => {
			const result = validateAdapter("neon", ["neon", "postgres"], mockSpinner);
			expect(result).toBe(true);
		});

		it("should return false for unsupported adapter", () => {
			const consoleSpy = vi.spyOn(mockSpinner, "fail");
			const result = validateAdapter("mysql", ["neon", "postgres"], mockSpinner);
			expect(result).toBe(false);
			expect(consoleSpy).toHaveBeenCalledWith("Unsupported adapter: mysql");
		});
	});

	describe("validateModules", () => {
		const validModules = ["cache", "realtime", "queue"];

		it("should return valid modules for correct input", () => {
			const result = validateModules("cache,realtime", validModules, mockSpinner);
			expect(result.valid).toBe(true);
			expect(result.modules).toEqual(["cache", "realtime"]);
		});

		it("should trim spaces from modules", () => {
			const result = validateModules("cache , realtime ", validModules, mockSpinner);
			expect(result.valid).toBe(true);
			expect(result.modules).toEqual(["cache", "realtime"]);
		});

		it("should return false for invalid modules", () => {
			const result = validateModules("cache,invalid", validModules, mockSpinner);
			expect(result.valid).toBe(false);
			expect(result.modules).toEqual([]);
		});

		it("should return false for empty input", () => {
			const result = validateModules("", validModules, mockSpinner);
			expect(result.valid).toBe(false);
		});

		it("should handle only spaces and commas", () => {
			const result = validateModules(" , , ", validModules, mockSpinner);
			expect(result.valid).toBe(false);
		});
	});
});