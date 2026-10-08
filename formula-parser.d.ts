// Minimal types for the parts of @fortune-sheet/formula-parser this plugin uses.
declare module "@fortune-sheet/formula-parser" {
	export class Parser {
		on(event: string, handler: (...args: any[]) => void): void;
		parse(expr: string): { result: any; error: string | null };
	}
}
