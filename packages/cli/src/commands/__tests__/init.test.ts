import { describe, it, expect } from "vitest";

describe("InitCommand - Module Validation", () => {
	describe("module parsing and validation", () => {
		const VALID_MODULES = ["cache", "realtime", "queue"];

		function parseAndValidateModules(modulesInput: string, validModules: string[]) {
			const modulesArray = modulesInput
				.split(",")
				.map((m) => m.trim())
				.filter(Boolean);

			// Check if any modules were specified
			if (modulesArray.length === 0) {
				throw new Error(`No valid modules specified. Please specify at least one module: ${validModules.join(", ")}`);
			}

			// Validate each module
			for (const module of modulesArray) {
				if (!validModules.includes(module)) {
					throw new Error(`Invalid module "${module}". Allowed modules: ${validModules.join(", ")}`);
				}
			}

			return modulesArray;
		}

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