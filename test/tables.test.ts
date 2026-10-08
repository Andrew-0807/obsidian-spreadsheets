import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
const { document, HTMLElement } = parseHTML("<!doctype html><html><body></body></html>");
// Obsidian adds these helpers to every element.
Object.assign(HTMLElement.prototype, {
	addClass(this: any, c: string) { this.classList.add(c); },
	removeClass(this: any, c: string) { this.classList.remove(c); },
});
const { applyFormulas } = await import("../tables.ts");
const cell = (t: any, r: number, c: number) => t.querySelectorAll("tr")[r].children[c];

// Reading view: text sits directly in the cells.
document.body.innerHTML = `<table><thead><tr><th>Item</th><th>Cost</th></tr></thead>
<tbody><tr><td>a</td><td>2</td></tr><tr><td>b</td><td>3</td></tr><tr><td>Total</td><td>=SUM(B:B)</td></tr></tbody></table>`;
const table = document.querySelector("table") as any;
applyFormulas(table);
const total = cell(table, 3, 1);
assert.equal(total.textContent, "5");
assert.equal(total.getAttribute("title"), "=SUM(B:B)");
applyFormulas(table); // re-running must keep reading the stored formula
assert.equal(total.textContent, "5");

// Changing an input recalculates.
cell(table, 1, 1).textContent = "10";
applyFormulas(table);
assert.equal(total.textContent, "13");

// Live Preview: content inside .table-cell-wrapper, the cell being edited is left alone.
document.body.innerHTML = `<table><tr><td><div class="table-cell-wrapper">4</div></td><td><div class="table-cell-wrapper">=A1*2</div></td>
<td><div class="table-cell-wrapper"><div class="cm-editor"><div class="cm-content">=A1+1</div></div></div></td></tr></table>`;
const lp = document.querySelector("table") as any;
applyFormulas(lp);
assert.equal(cell(lp, 0, 1).textContent, "8");
assert.equal(cell(lp, 0, 2).querySelector(".cm-content").textContent, "=A1+1");

// A cell re-rendered by Obsidian with new source text is read as the new source.
const b1 = cell(lp, 0, 1).firstElementChild;
b1.textContent = "=A1*3";
applyFormulas(lp);
assert.equal(b1.textContent, "12");
b1.textContent = "plain";
applyFormulas(lp);
assert.equal(b1.textContent, "plain");
assert.equal(b1.classList.contains("sheet-formula-cell"), false);
console.log("table tests passed");
