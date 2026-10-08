import { App, Notice, Plugin, TFolder } from "obsidian";
import { SpreadsheetView, VIEW_TYPE_SPREADSHEET } from "./view";
import { applyFormulas, livePreviewFormulas } from "./tables";

async function createSpreadsheet(app: App, folder: TFolder) {
	const prefix = folder.isRoot() ? "" : folder.path + "/";
	let path = `${prefix}Untitled.sheet`;
	for (let i = 1; app.vault.getAbstractFileByPath(path); i++) path = `${prefix}Untitled ${i}.sheet`;
	const file = await app.vault.create(path, "");
	await app.workspace.getLeaf(true).openFile(file);
	new Notice(`Created spreadsheet ${path}`);
}

export default class SpreadsheetPlugin extends Plugin {
	async onload() {
		this.registerView(VIEW_TYPE_SPREADSHEET, (leaf) => new SpreadsheetView(leaf));
		this.registerExtensions(["sheet"], VIEW_TYPE_SPREADSHEET);

		this.registerMarkdownPostProcessor((el) => el.querySelectorAll("table").forEach(applyFormulas));
		this.registerEditorExtension(livePreviewFormulas);

		const createInRoot = () => createSpreadsheet(this.app, this.app.vault.getRoot());
		this.addRibbonIcon("table", "New spreadsheet", createInRoot);
		this.addCommand({ id: "new-spreadsheet", name: "New spreadsheet", callback: createInRoot });

		this.registerEvent(this.app.workspace.on("file-menu", (menu, file) => {
			if (!(file instanceof TFolder)) return;
			menu.addItem((item) => item.setTitle("New spreadsheet").setIcon("table")
				.onClick(() => createSpreadsheet(this.app, file)));
		}));
	}
}
