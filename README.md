# Obsidian Spreadsheets Plugin

Spreadsheets inside Obsidian, on desktop and mobile:

1. **`.sheet` files**: full spreadsheet editor (formatting, formulas, filter and sort, merged cells) based on [FortuneSheet](https://github.com/ruilisi/fortune-sheet).
2. **Formulas in markdown tables**: write `=SUM(B:B)` in any table cell of a normal note and see the result in Reading view and Live Preview. The note keeps the formula text.

Fork of [divamgupta/obsidian-spreadsheets](https://github.com/divamgupta/obsidian-spreadsheets). See [CHANGELOG.md](CHANGELOG.md) for what changed.

## Spreadsheet files

Create one with the "New spreadsheet" ribbon button, the command palette, or by right-clicking a folder. Files are saved as JSON with the `.sheet` extension.

On a tablet: double-tap a cell (or tap the **fx** bar) to type, long-press for the context menu, use the **Σ** toolbar button to sum the cells above.

## Formulas in markdown tables

```
| Item | Price | Qty | Total  |
| ---- | ----- | --- | ------ |
| a    | 1.5   | 2   | =B2*C2 |
| b    | 2     | 3   | =B3*C3 |
| Sum  |       |     | =SUM(D:D) |
```

- Columns are `A`, `B`, `C` from the left. The header row is row 1.
- Any function of the spreadsheet engine works (`SUM`, `AVERAGE`, `IF`, `ROUND`, ...), and formulas can reference other formulas.
- Whole-column and whole-row ranges (`D:D`, `5:5`) skip the formula's own cell, so a total row can sum its own column. Explicit ranges that include the formula's own cell show `#CYCLE!`.
- Numbers must be plain (`1500`, `2.5`). Values like `1,500` or `$3` count as text.
- Formula cells are marked with a dotted underline. The tooltip shows the formula.

## Development

```
npm install
npm test        # data, formula and table tests
npm run build   # type check, then main.js + styles.css
```

Copy `main.js`, `manifest.json` and `styles.css` to `<vault>/.obsidian/plugins/spreadsheets/`.

`styles.css` is generated: FortuneSheet's CSS plus `styles.override.css`. Edit the override file, not `styles.css`.
