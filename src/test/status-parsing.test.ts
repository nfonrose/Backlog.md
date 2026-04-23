import { describe, expect, it } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { FileSystem } from "../file-system/operations.ts";

describe("Status Parsing", () => {
	it("should parse custom statuses including 'Paused'", async () => {
		const TEST_DIR = "./tmp-status-test";
		await mkdir(TEST_DIR, { recursive: true });
		const fs = new FileSystem(TEST_DIR);
		await fs.ensureBacklogStructure();

		const configContent = `project_name: "Test Project"
statuses: ["To Do", "Paused", "In Progress", "Done"]
date_format: yyyy-mm-dd
`;
		const configPath = join(TEST_DIR, "backlog", "config.yml");
		await writeFile(configPath, configContent);

		const config = await fs.loadConfig();
		expect(config?.statuses).toEqual(["To Do", "Paused", "In Progress", "Done"]);

		await rm(TEST_DIR, { recursive: true, force: true });
	});
});
