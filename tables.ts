// Show formula results in markdown tables (Reading view and Live Preview). Only the display changes, the note keeps the formula text.
import { ViewPlugin, EditorView } from "@codemirror/view";
import { evaluateTable } from "./formula";

// Live Preview renders each cell inside .table-cell-wrapper, Reading view puts text straight in the cell.
const contentOf = (cell: Element) => (cell.querySelector(".table-cell-wrapper") ?? cell) as HTMLElement;

function sourceOf(el: HTMLElement): string {
	const editing = el.querySelector(".cm-content");
	if (editing) return editing.textContent ?? "";
	// Still showing our result, so the real text is the stored formula.
	if (el.dataset.sheetFormula != null && el.textContent === el.dataset.sheetResult) return el.dataset.sheetFormula;
	return el.textContent ?? "";
}

export function applyFormulas(table: HTMLTableElement) {
	const els = Array.from(table.querySelectorAll("tr"), (row) =>
		Array.from(row.children).filter((c) => c.tagName === "TD" || c.tagName === "TH").map(contentOf));
	const results = evaluateTable(els.map((row) => row.map(sourceOf)));
	els.forEach((row, r) => row.forEach((el, c) => {
		if (el.querySelector(".cm-editor")) return; // never touch the cell being edited
		const result = results[r][c];
		if (result == null) {
			if (el.dataset.sheetFormula != null) {
				delete el.dataset.sheetFormula;
				delete el.dataset.sheetResult;
				el.removeClass("sheet-formula-cell");
				el.removeAttribute("title");
			}
			return;
		}
		const formula = sourceOf(el).trim();
		// Write only on change, otherwise the Live Preview observer would loop on its own mutations.
		if (el.textContent === result && el.dataset.sheetFormula === formula) return;
		el.dataset.sheetFormula = formula;
		el.dataset.sheetResult = result;
		el.textContent = result;
		el.addClass("sheet-formula-cell");
		el.setAttribute("title", formula);
	}));
}

export const livePreviewFormulas = ViewPlugin.fromClass(class {
	private observer: MutationObserver;
	private queued = false;

	constructor(private view: EditorView) {
		this.observer = new MutationObserver(() => this.schedule());
		this.observer.observe(view.contentDOM, { childList: true, subtree: true, characterData: true });
		this.schedule();
	}

	private schedule() {
		if (this.queued) return;
		this.queued = true;
		requestAnimationFrame(() => {
			this.queued = false;
			this.view.contentDOM.querySelectorAll<HTMLTableElement>(".cm-table-widget table").forEach(applyFormulas);
		});
	}

	destroy() {
		this.observer.disconnect();
	}
});
