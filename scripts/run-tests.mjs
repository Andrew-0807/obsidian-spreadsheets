// formula.ts imports a CommonJS package without extension, so bundle tests before running them.
import { buildSync } from "esbuild";
import { execFileSync } from "child_process";
for (const f of ["data", "formula", "tables"]) {
	const out = `${process.env.TMPDIR ?? "/tmp"}/${f}.test.mjs`;
	buildSync({ entryPoints: [`test/${f}.test.ts`], bundle: true, platform: "node", format: "esm", outfile: out, logLevel: "error" });
	execFileSync("node", [out], { stdio: "inherit" });
}
