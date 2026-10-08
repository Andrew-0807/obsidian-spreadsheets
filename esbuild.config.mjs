import esbuild from "esbuild";
import process from "process";
import { readFileSync, writeFileSync, rmSync } from "fs";
import builtins from "builtin-modules";

const prod = process.argv[2] === "production";

// esbuild emits fortune-sheet's imported CSS as main.css, Obsidian only loads styles.css.
const stylesPlugin = {
	name: "styles",
	setup(build) {
		build.onEnd((result) => {
			if (result.errors.length) return;
			writeFileSync("styles.css", readFileSync("main.css", "utf8") + "\n" + readFileSync("styles.override.css", "utf8"));
			rmSync("main.css");
		});
	},
};

const context = await esbuild.context({
	entryPoints: ["main.ts"],
	bundle: true,
	external: ["obsidian", "electron", "@codemirror/*", "@lezer/*", ...builtins],
	format: "cjs",
	target: "es2018",
	logLevel: "info",
	sourcemap: prod ? false : "inline",
	minify: prod,
	define: { "process.env.NODE_ENV": JSON.stringify(prod ? "production" : "development") },
	outfile: "main.js",
	plugins: [stylesPlugin],
});

if (prod) {
	await context.rebuild();
	process.exit(0);
} else {
	await context.watch();
}
