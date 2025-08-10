import { describe, it, expect } from "vitest";
import { parseAndValidateModules } from "../../utils/modules.ts";

describe("InitCommand - Module Validation", () => {
	describe("module parsing and validation", () => {
		const VALID_MODULES = ["cache", "realtime", "queue"];

		it("should successfully parse valid modules", () => {
			const result = parseAndValidateModules("cache,realtime", VALID_MODULES);
			expect(result).toEqual(["cache", "realtime"]);
		});

		it("should trim spaces from module names", () => {
			const result = parseAndValidateModules(" cache , realtime ", VALID_MODULES);
			expect(result).toEqual(["cache", "realtime"]);
		});

		it("should throw on invalid module", () => {
			expect(() => {
				parseAndValidateModules("cache,invalid-module", VALID_MODULES);
			}).toThrow("Invalid module \"invalid-module\"");
		});

		it("should throw on empty modules after filtering", () => {
			expect(() => {
				parseAndValidateModules(" , , ", VALID_MODULES);
			}).toThrow("No valid modules specified");
		});

		it("should handle single valid module", () => {
			const result = parseAndValidateModules("cache", VALID_MODULES);
			expect(result).toEqual(["cache"]);
		});

		it("should handle all valid modules", () => {
			const result = parseAndValidateModules("cache,realtime,queue", VALID_MODULES);
			expect(result).toEqual(["cache", "realtime", "queue"]);
		});
	});
});