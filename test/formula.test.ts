import assert from "node:assert/strict";
import { evaluateTable } from "../formula.ts";

const t = [
	["Item", "Price", "Qty", "Total"],
	["a", "1.5", "2", "=B2*C2"],
	["b", "2", "3", "=B3*C3"],
	["", "", "", ""],
	["=SUM(C:C)", "=SUM(B2:B3)", "=SUM(C2:C3)", "=SUM(D2:D3)"],
];
const out = evaluateTable(t);
assert.equal(out[1][3], "3");
assert.equal(out[2][3], "6");
assert.equal(out[4][1], "3.5");
assert.equal(out[4][0], "10"); // whole column skips header text, includes C5 formula
assert.equal(out[4][3], "9"); // formulas referencing formulas
assert.equal(out[0][0], null); // plain cells untouched

const e = evaluateTable([["=A1"], ["=A3"], ["=A2"], ["=NOPE(1)"], ["=0.1+0.2"], ['=IF(1>0,"yes","no")'], ["=AVERAGE(1,3)"]]);
assert.equal(e[0][0], "#CYCLE!");
assert.equal(e[1][0], "#CYCLE!");
assert.equal(evaluateTable([["1"], ["2"], ["=SUM(A:A)"]])[2][0], "3"); // whole column skips its own cell
assert.equal(evaluateTable([["1"], ["=SUM(A1:A2)"]])[1][0], "#CYCLE!"); // explicit range still circular
assert.equal(e[3][0], "#NAME?");
assert.equal(e[4][0], "0.3");
assert.equal(e[5][0], "yes");
assert.equal(e[6][0], "2");
console.log("formula tests passed");
