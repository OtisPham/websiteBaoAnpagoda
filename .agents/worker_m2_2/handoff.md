# Handoff Report — Milestone M2 (Template Engine Remediation)

## 1. Observation
- `src/services/pdf/templates/verticalA4.ts`: Previously used fixed count-based column splitting (`MAX_PER_COL = 15`) without utilizing line-weight calculations (`FORM_CODE_WEIGHT = 4`, `LONG_NAME_WEIGHT = 2`, `SHORT_NAME_WEIGHT = 1`, `MAX_LINES_PER_COL_VERTICAL = 28`) or prepending continuation headers (`FORM_CODE_CONTINUED` / `[Mã_phiếu (Tiếp)]`) when target lists spilled over into new columns.
- `src/services/pdf/templates/horizontal.ts`: Line 43 contained a React/JSX artifact `className="horizontal-col"` inside HTML template string literals, which generated invalid HTML attribute `className` instead of `class`.
- `src/services/pdf/testEngine.ts`: Self-check suite contained 4 tests (`verticalCauAn`, `verticalCauSieu`, `horizontalChanhDien`, `phungViToaVi`), lacking a test case for large target lists (>30 items) to verify line-weight column splitting and `(Tiếp)` continuation header rendering.

## 2. Logic Chain
1. **Line-Weight Column Splitting Integration in `verticalA4.ts`**:
   - `lineWeight.ts` exports `chunkSoColumns(forms: FormRecord[], maxLinesPerCol?: number): SoColumn[]`, which automatically calculates line weights for form headers (`FORM_CODE` weight = 4), long target names (weight = 2), and short target names (weight = 1), splitting columns at max 28 lines.
   - When a column breaks, `chunkSoColumns` automatically inserts a continuation header line of type `FORM_CODE_CONTINUED` with text `${form.form_code} (Tiếp)` at the top of the next column.
   - By replacing lines 40-109 of `verticalA4.ts` with `chunkSoColumns([{ ...form, targets: actualTargets }])`, the Vertical A4 template renderer now dynamically structures columns based on exact line weights and renders subheaders for both initial form codes and `(Tiếp)` continuation headers.
2. **HTML Attribute Fix in `horizontal.ts`**:
   - Replacing `className="horizontal-col"` with `class="horizontal-col"` on line 43 ensures that raw HTML output from `generateHorizontalTemplate` uses standard HTML `class` attribute rather than React JSX syntax.
3. **Automated Test Suite Expansion in `testEngine.ts`**:
   - Created a 32-item mock form (`mockLargeForm` with `form_code: 'CA-9999'`) and added Test 5 (`results.verticalA4LargeList`) to `runPdfEngineSelfCheck()`.
   - Test 5 verifies that `renderSoHtml` output for large target lists contains both `'CA-9999 (Tiếp)'` and `'Nguyễn Văn 32'`, confirming both line-weight column splitting and continuation header rendering.

## 3. Caveats
- No caveats. All identified issues were fully addressed and verified against the PDF engine specification.

## 4. Conclusion
- `templates/verticalA4.ts` now fully utilizes `chunkSoColumns` from `lineWeight.ts` for line-weight column splitting (max 28 lines) and continuation header rendering (`[Mã_phiếu (Tiếp)]`).
- `templates/horizontal.ts` has been cleaned of JSX artifacts (`className="horizontal-col"` -> `class="horizontal-col"`).
- `testEngine.ts` now includes 5 comprehensive test cases, covering single-column forms, multi-column forms with >30 items, horizontal layouts, and Phụng Vì - Tọa Vị layouts.

## 5. Verification Method
1. **TypeScript Compilation**:
   Run `npx tsc --noEmit` from project root `c:\Users\ADMIN\Desktop\pagodaweb`. Output should be clean with zero errors.
2. **PDF Engine Self-Check Test Suite**:
   Run `npx tsx -e "import { runPdfEngineSelfCheck } from './src/services/pdf/testEngine'; console.log(runPdfEngineSelfCheck());"`
   Expected output:
   `{ success: true, results: { verticalCauAn: true, verticalCauSieu: true, horizontalChanhDien: true, phungViToaVi: true, verticalA4LargeList: true } }`
3. **File Inspection**:
   - Inspect `src/services/pdf/templates/verticalA4.ts` around lines 47-115 to confirm `chunkSoColumns` call and line type rendering.
   - Inspect `src/services/pdf/templates/horizontal.ts` line 43 to confirm `class="horizontal-col"`.
   - Inspect `src/services/pdf/testEngine.ts` lines 41-57 to confirm `verticalA4LargeList` test case.
