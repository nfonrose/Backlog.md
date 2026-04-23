import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { Core } from "../core/backlog.ts";
import { createUniqueTestDir, initializeTestProject } from "./test-utils.ts";

describe("Centralized Task Ordinals", () => {
	let TEST_DIR: string;
	let core: Core;

	beforeEach(async () => {
		TEST_DIR = createUniqueTestDir("centralized-ordinals");
		core = new Core(TEST_DIR);
		await initializeTestProject(core, "Centralized Ordinals Test");
	});

	afterEach(async () => {
		await rm(TEST_DIR, { recursive: true, force: true }).catch(() => {});
	});

	it("migrates existing ordinals to task-ordinals.yml when enabled", async () => {
		// 1. Create a task with an ordinal in the old way (centralized disabled)
		const { task } = await core.createTaskFromInput({
			title: "Task with ordinal",
			ordinal: 1234,
		});

		// Verify it's in the .md file
		const contentBefore = await Bun.file(task.filePath!).text();
		expect(contentBefore).toContain("ordinal: 1234");

		// 2. Enable centralized ordinals in config
		const config = await core.fs.loadConfig();
		config!.centralizedTasksOrdinals = true;
		await core.fs.saveConfig(config!);

		// 3. Trigger migration (automatically called by loadConfig if file missing, or call explicitly)
		const result = await core.fs.migrateOrdinalsToCentralStorage();
		expect(result.migratedCount).toBe(1);

		// 4. Verify task-ordinals.yml exists and contains the ordinal
		const ordinalsPath = join(TEST_DIR, "backlog", "task-ordinals.yml");
		const ordinalsContent = await Bun.file(ordinalsPath).text();
		expect(ordinalsContent).toContain(`${task.id.toUpperCase()}: 1234`);

		// 5. Load task and verify ordinal is still 1234
		const loadedTask = await core.fs.loadTask(task.id);
		expect(loadedTask?.ordinal).toBe(1234);

		// 6. Save task again and verify ordinal is REMOVED from .md file
		await core.fs.saveTask(loadedTask!);
		const contentAfter = await Bun.file(task.filePath!).text();
		expect(contentAfter).not.toContain("ordinal: 1234");

		// But still present in YAML
		const ordinalsContentFinal = await Bun.file(ordinalsPath).text();
		expect(ordinalsContentFinal).toContain(`${task.id.toUpperCase()}: 1234`);
	});

	it("respects centralized ordinals during reordering", async () => {
		// 1. Enable centralized ordinals
		const config = await core.fs.loadConfig();
		config!.centralizedTasksOrdinals = true;
		await core.fs.saveConfig(config!);
		await core.fs.migrateOrdinalsToCentralStorage();

		// 2. Create two tasks
		const { task: task1 } = await core.createTaskFromInput({ title: "Task 1", status: "To Do" });
		const { task: task2 } = await core.createTaskFromInput({ title: "Task 2", status: "To Do" });

		// 3. Reorder them
		await core.reorderTask({
			taskId: task2.id,
			targetStatus: "To Do",
			orderedTaskIds: [task2.id, task1.id],
		});

		// 4. Verify ordinals are in YAML, not in .md
		const ordinalsPath = join(TEST_DIR, "backlog", "task-ordinals.yml");
		const ordinals = await core.fs.loadTaskOrdinals();

		expect(ordinals[task2.id.toUpperCase()]).toBeDefined();

		const content1 = await Bun.file(task1.filePath!).text();
		const content2 = await Bun.file(task2.filePath!).text();

		expect(content1).not.toContain("ordinal:");
		expect(content2).not.toContain("ordinal:");
	});

	it("does not update updated_date or rewrite .md files when only ordinal changes", async () => {
		// 1. Enable centralized ordinals
		const config = await core.fs.loadConfig();
		config!.centralizedTasksOrdinals = true;
		await core.fs.saveConfig(config!);
		await core.fs.migrateOrdinalsToCentralStorage();

		// 2. Create two tasks and capture their mtime and content
		const { task: t1 } = await core.createTaskFromInput({ title: "T1", status: "To Do" });
		const { task: t2 } = await core.createTaskFromInput({ title: "T2", status: "To Do" });

		const path1 = t1.filePath!;
		const content1Before = await Bun.file(path1).text();
		const stat1Before = await Bun.file(path1).lastModified;

		// 3. Wait a bit to ensure a date change would be visible if it happened
		await new Promise((resolve) => setTimeout(resolve, 1100));

		// 4. Reorder
		await core.reorderTask({
			taskId: t2.id,
			targetStatus: "To Do",
			orderedTaskIds: [t2.id, t1.id],
		});

		// 5. Verify T1 (which was shifted/affected by ordinal logic) was NOT rewritten
		const content1After = await Bun.file(path1).text();
		const stat1After = await Bun.file(path1).lastModified;

		expect(content1After).toBe(content1Before);
		expect(stat1After).toBe(stat1Before);

		// 6. Verify ordinals file WAS updated
		const ordinals = await core.fs.loadTaskOrdinals();
		expect(ordinals[t2.id.toUpperCase()]).toBeDefined();
		expect(ordinals[t1.id.toUpperCase()]).toBeDefined();
	});
});
