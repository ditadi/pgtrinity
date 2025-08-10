import { describe, it, expect } from "vitest";
import NeonAdapter from "../neon/neonAdapter.ts";
import { TestUtils } from "../../__tests__/test-utils.ts";

describe("NeonAdapter", () => {
    describe("validateOptions", () => {
        it("should return true when apiKey and projectId are provided explicitly", () => {
            const adapter = new NeonAdapter({
                apiKey: "test-api-key", 
                projectId: "test-project-id"
            });
            expect(adapter.validateOptions()).toBe(true);
        });

        it("should return true when credentials come from environment", () => {
            // Since we load .env in TestUtils, these should be available
            const adapter = new NeonAdapter({});
            expect(adapter.validateOptions()).toBe(true);
        });

        it("should return true when partial credentials provided (env fills gaps)", () => {
            const adapter = new NeonAdapter({ apiKey: "test-key" });
            expect(adapter.validateOptions()).toBe(true);
        });
    });

    describe("createResources - Integration", () => {
        it("should succeed when using environment credentials", async () => {
            const adapter = new NeonAdapter({}); // Uses env credentials
            const result = await adapter.createResources();

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data).toMatch(/^postgresql:\/\//);
        }, 30000);
    });

    describe("createMigrations - Integration", () => {
        it("should run real cache migrations", async () => {
            const connectionString = await TestUtils.getTestConnectionString();
            if (!connectionString) {
                console.log("⏭️  Skipping migration test - no connection available");
                return;
            }

            const adapter = TestUtils.createTestNeonAdapter()!;
            const result = await adapter.createMigrations(connectionString, ["cache"]);

            expect(result.success).toBe(true);
        }, 30000);

        it("should handle invalid connection string", async () => {
            const adapter = TestUtils.createTestNeonAdapter();
            if (!adapter) {
                console.log("⏭️  Skipping integration test - no Neon credentials");
                return;
            }

            const result = await adapter.createMigrations("invalid-connection-string", ["cache"]);

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });
});
