// Evaluate Excel-style formulas in a plain grid of cell texts (markdown tables).
// Column letters map to table columns, row 1 is the header row.
// Unlike Excel, A:A and 2:2 ranges ignore the formula's own cell.
import { Parser } from "@fortune-sheet/formula-parser";

type Value = number | string | boolean | null;
type Coord = { row: { index: number }; column: { index: number } };

const CYCLE = "#CYCLE!";

export const isFormula = (text: string) => text.startsWith("=") && text.length > 1;

// Returns the display text for every formula cell, null for plain cells.
export function evaluateTable(cells: string[][]): (string | null)[][] {
	const width = Math.max(0, ...cells.map((r) => r.length));
	const cache = new Map<string, Value>();
	const visiting = new Set<string>();

	const value = (r: number, c: number): Value => {
		const text = (cells[r]?.[c] ?? "").trim();
		if (!isFormula(text)) return parsePlain(text);
		const key = `${r},${c}`;
		if (cache.has(key)) return cache.get(key)!;
		if (visiting.has(key)) throw new Error(CYCLE);
		visiting.add(key);
		try {
			const v = run(text.slice(1), r, c);
			cache.set(key, v);
			return v;
		} finally {
			visiting.delete(key);
		}
	};

	// A fresh parser per formula, the generated grammar parser is not re-entrant.
	const run = (expr: string, selfR: number, selfC: number): Value => {
		const parser = new Parser();
		let cycle = false;
		const safe = (r: number, c: number) => {
			try {
				return value(r, c);
			} catch (e) {
				cycle = true;
				throw e;
			}
		};
		parser.on("callCellValue", (at: Coord, _o: unknown, done: (v: Value) => void) => done(safe(at.row.index, at.column.index)));
		parser.on("callRangeValue", (from: Coord, to: Coord, _o: unknown, done: (v: Value[][]) => void) => {
			// Index -1 means a whole column (A:A) or whole row (2:2). Those skip the formula's own cell,
			// so a total row can use =SUM(B:B) instead of being a circular reference.
			const whole = from.row.index < 0 || from.column.index < 0;
			const r0 = from.row.index < 0 ? 0 : from.row.index, r1 = to.row.index < 0 ? cells.length - 1 : to.row.index;
			const c0 = from.column.index < 0 ? 0 : from.column.index, c1 = to.column.index < 0 ? width - 1 : to.column.index;
			const out: Value[][] = [];
			for (let r = r0; r <= r1; r++) {
				const row: Value[] = [];
				for (let c = c0; c <= c1; c++) row.push(whole && r === selfR && c === selfC ? null : safe(r, c));
				out.push(row);
			}
			done(out);
		});
		const { result, error } = parser.parse(expr);
		if (cycle) throw new Error(CYCLE);
		return error ?? result;
	};

	return cells.map((row, r) => row.map((text, c) => {
		if (!isFormula(text.trim())) return null;
		try {
			return format(value(r, c));
		} catch (e) {
			return e instanceof Error && e.message === CYCLE ? CYCLE : "#ERROR!";
		}
	}));
}

function parsePlain(text: string): Value {
	if (text === "") return null;
	const n = Number(text);
	return Number.isFinite(n) ? n : text;
}

function format(v: Value): string {
	if (v == null) return "";
	if (typeof v === "number") return String(Number(v.toFixed(10))); // hide float noise like 0.1+0.2
	return String(v);
}
