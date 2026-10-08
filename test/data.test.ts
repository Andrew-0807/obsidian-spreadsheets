import assert from "node:assert/strict";
import { parseSheets, serializeSheets, EMPTY_WORKBOOK } from "../data.ts";

assert.deepEqual(parseSheets(""), EMPTY_WORKBOOK);
assert.deepEqual(parseSheets("  \n"), EMPTY_WORKBOOK);
assert.throws(() => parseSheets("{}"));

const saved = JSON.parse(serializeSheets([
	{ name: "A", id: "1", order: 0, config: { merge: {} }, data: [[null, { v: 1 }], undefined as any, [{ v: "x" }]] },
	{ name: "B", celldata: [{ r: 0, c: 0, v: { v: 2 } }] },
]));
assert.deepEqual(saved[0], { name: "A", id: "1", order: 0, config: { merge: {} }, celldata: [{ r: 0, c: 1, v: { v: 1 } }, { r: 2, c: 0, v: { v: "x" } }] });
assert.deepEqual(saved[1], { name: "B", celldata: [{ r: 0, c: 0, v: { v: 2 } }] });
assert.deepEqual(parseSheets(serializeSheets(saved)), saved);
console.log("data tests passed");
