import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Core } from "../core/backlog.ts";
import { createUniqueTestDir, initializeTestProject, safeCleanup } from "./test-utils.ts";

describe("Centralized task ordinals", () => {
	let TEST_DIR: string;
	let core: Core;
	const ordinalsPath = () => join(TEST_DIR, "backlog", "task-ordinals.yml");

	const enable = async () => {
		const config = await core.fs.loadConfig();
		if (!config) throw new Error("missing config");
		await core.fs.saveConfig({ ...config, centralizedTasksOrdinals: true });
	};

	beforeEach(async () => {
		TEST_DIR = createUniqueTestDir("centralized-ordinals");
		core = new Core(TEST_DIR);
		await initializeTestProject(core, "Centralized Ordinals Test");
	});

	afterEach(async () => {
		await safeCleanup(TEST_DIR);
	});

	it("moves existing ordinals out of task files when the option is turned on", async () => {
		const { task } = await core.createTaskFromInput({ title: "Task with ordinal", ordinal: 1234 });
		const filePath = task.filePath ?? "";
		expect(await Bun.file(filePath).text()).toContain("ordinal: 1234");

		await enable();

		expect(await Bun.file(ordinalsPath()).text()).toBe(`${task.id.toUpperCase()}: 1234\n`);
		expect(await Bun.file(filePath).text()).not.toContain("ordinal:");
		expect((await core.fs.loadTask(task.id))?.ordinal).toBe(1234);
		expect((await core.fs.listTasks()).find((t) => t.id === task.id)?.ordinal).toBe(1234);
	});

	it("keeps the ordinal of a task file that has no central entry", async () => {
		await enable();
		const { task } = await core.createTaskFromInput({ title: "Written elsewhere" });
		const filePath = task.filePath ?? "";
		const content = await Bun.file(filePath).text();
		await writeFile(filePath, content.replace(/^status: /m, "ordinal: 77\nstatus: "));
		await writeFile(ordinalsPath(), "");

		expect((await core.fs.loadTask(task.id))?.ordinal).toBe(77);
	});

	it("reorders by writing the central file only", async () => {
		await enable();
		const { task: t1 } = await core.createTaskFromInput({ title: "T1", status: "To Do" });
		const { task: t2 } = await core.createTaskFromInput({ title: "T2", status: "To Do" });
		const path1 = t1.filePath ?? "";
		const path2 = t2.filePath ?? "";
		const before1 = await Bun.file(path1).text();
		const before2 = await Bun.file(path2).text();
		expect(before1).not.toContain("ordinal:");

		await core.reorderTask({ taskId: t2.id, targetStatus: "To Do", orderedTaskIds: [t2.id, t1.id] });

		expect(await Bun.file(path1).text()).toBe(before1);
		expect(await Bun.file(path2).text()).toBe(before2);
		const ordinals = await core.fs.loadTaskOrdinals();
		const o1 = ordinals.get(t1.id.toUpperCase());
		const o2 = ordinals.get(t2.id.toUpperCase());
		expect(o1).toBeDefined();
		expect(o2).toBeDefined();
		expect(o2 as number).toBeLessThan(o1 as number);
		const listed = (await core.fs.listTasks()).filter((t) => t.id === t1.id || t.id === t2.id);
		expect(listed.find((t) => t.id === t2.id)?.ordinal).toBe(o2 as number);
	});

	it("leaves task files alone when the option is off", async () => {
		const { task } = await core.createTaskFromInput({ title: "Plain", ordinal: 5 });
		expect(await Bun.file(task.filePath ?? "").text()).toContain("ordinal: 5");
		expect(await Bun.file(ordinalsPath()).exists()).toBe(false);
	});
});
