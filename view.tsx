import { TextFileView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { Workbook } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";
import { parseSheets, serializeSheets } from "./data";

export const VIEW_TYPE_SPREADSHEET = "spreadsheet-view";

export class SpreadsheetView extends TextFileView {
	private root: Root | null = null;
	private resizeObserver: ResizeObserver | null = null;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		this.contentEl.addClass("spreadsheet-view");
		// fortune-sheet only re-measures on window resize, so forward pane resizes to it.
		this.resizeObserver = new ResizeObserver(() => window.dispatchEvent(new Event("resize")));
		this.resizeObserver.observe(this.contentEl);
	}

	getViewType() {
		return VIEW_TYPE_SPREADSHEET;
	}

	getViewData() {
		return this.data;
	}

	setViewData(data: string, clear: boolean) {
		this.data = data;
		this.unmount();
		let sheets;
		try {
			sheets = parseSheets(data);
		} catch (err) {
			// Never render (and later overwrite) a file we could not read.
			this.contentEl.createDiv({ cls: "spreadsheet-error", text: `Cannot open ${this.file?.path}: ${err}` });
			return;
		}
		this.root = createRoot(this.contentEl.createDiv({ cls: "spreadsheet-container" }));
		this.root.render(<Workbook data={sheets} onChange={(s) => {
			this.data = serializeSheets(s);
			this.requestSave(); // Obsidian debounces this
		}} />);
	}

	clear() {
		this.unmount();
	}

	private unmount() {
		this.root?.unmount();
		this.root = null;
		this.contentEl.empty();
	}

	async onClose() {
		this.resizeObserver?.disconnect();
		this.unmount();
	}
}
