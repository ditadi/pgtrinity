import { describe, it, expect, beforeEach, vi } from "vitest";
import { getEnvValue } from "../config.ts";

describe("config", () => {
    beforeEach(() => {
        // Clear environment variables before each test
        delete process.env.TEST_VAR;
    });

    describe("getEnvValue", () => {
        it("should return environment variable value when it exists", () => {
            process.env.TEST_VAR = "test_value";
            const result = getEnvValue("TEST_VAR");
            expect(result).toBe("test_value");
        });

        it("should return fallback value when env var doesn't exist", () => {
            const result = getEnvValue("NON_EXISTENT_VAR", "fallback");
            expect(result).toBe("fallback");
        });

        it("should return undefined when env var doesn't exist and no fallback", () => {
            const result = getEnvValue("NON_EXISTENT_VAR");
            expect(result).toBeUndefined();
        });

        it("should return empty string when env var is empty string", () => {
            process.env.TEST_VAR = "";
            const result = getEnvValue("TEST_VAR", "fallback");
            expect(result).toBe(""); // Should NOT use fallback
        });

        it("should return env var value when it's '0'", () => {
            process.env.TEST_VAR = "0";
            const result = getEnvValue("TEST_VAR", "fallback");
            expect(result).toBe("0"); // Should NOT use fallback
        });
    });
});
