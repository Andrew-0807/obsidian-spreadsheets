// Sheet <-> file conversion. Kept free of obsidian/react imports so it can be tested with plain node.

import type { Sheet } from "@fortune-sheet/core";

export const EMPTY_WORKBOOK: Sheet[] = [{ name: "Sheet1" }];

export function parseSheets(text: string): Sheet[] {
	if (!text.trim()) return EMPTY_WORKBOOK;
	const parsed = JSON.parse(text);
	if (!Array.isArray(parsed)) throw new Error("Spreadsheet file must contain a JSON array of sheets");
	return parsed;
}

// Store only non-empty cells (celldata) instead of the full 2D matrix, keep every other sheet property.
export function serializeSheets(sheets: Sheet[]): string {
	const out = sheets.map(({ data, ...sheet }) => {
		if (!data) return sheet;
		const celldata: NonNullable<Sheet["celldata"]> = [];
		data.forEach((row, r) => row?.forEach((v, c) => {
			if (v != null) celldata.push({ r, c, v });
		}));
		return { ...sheet, celldata };
	});
	return JSON.stringify(out, null, "\t");
}
