import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

describe("CLI Integration", () => {
    const cliPath = join(process.cwd(), "dist/cli.js");

    it("should show help message", () => {
        const output = execFileSync("node", [cliPath, "--help"], { encoding: "utf-8" });
        expect(output).toContain("CLI for PGTrinity configuration");
        expect(output).toContain("init");
    });

    it("should show init help", () => {
        const output = execFileSync("node", [cliPath, "init", "--help"], { encoding: "utf-8" });
        expect(output).toContain("Initialize PGTrinity configuration");
        expect(output).toContain("--adapter");
        expect(output).toContain("--modules");
    });

    it("should fail with invalid adapter", () => {
        expect(() => {
            execFileSync("node", [cliPath, "init", "--adapter", "invalid"], {
                encoding: "utf-8",
                stdio: "pipe",
            });
        }).toThrow();
    });

    it("should fail with invalid modules", () => {
        expect(() => {
            execFileSync("node", [cliPath, "init", "--adapter", "neon", "--modules", "invalid"], {
                encoding: "utf-8",
                stdio: "pipe",
            });
        }).toThrow();
    });
});
