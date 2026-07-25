# Forensic Audit Report — Milestone M2: PDF Template Engine Audit

**Work Product**: `c:\Users\ADMIN\Desktop\pagodaweb\src\services\pdf\`  
**Working Directory**: `c:\Users\ADMIN\Desktop\pagodaweb\.agents\auditor_m2_1`  
**Profile**: General Project (Integrity Forensics)  
**Audit Date**: 2026-07-24  
**Verdict**: **CLEAN**

---

## 1. Observation

Direct forensic inspection of all source modules under `c:\Users\ADMIN\Desktop\pagodaweb\src\services\pdf\` revealed:

1. **Service Architecture & Component Integrity**:
   - `src/services/pdf/types.ts` (33 lines): Defines standard domain models (`FormRecord`, `TargetPerson`, `PrintMode`, `FormType`, `TemplateOptions`).
   - `src/services/pdf/lineWeight.ts` (188 lines): Implements genuine line-weight algorithm (`calculateNameWeight`, `chunkSoColumns`, `chunkHorizontalColumns`) enforcing:
     - `MAX_LINES_PER_COL_VERTICAL = 28`
     - `MAX_LINES_PER_COL_HORIZONTAL = 13`
     - `FORM_CODE_WEIGHT = 4`, `SHORT_NAME_WEIGHT = 1`, `LONG_NAME_WEIGHT = 2`
     - Automatic column splitting and insertion of `${form.form_code} (Tiếp)` header (occupying 4 lines) when target list exceeds 28 line units per column.
   - `src/services/pdf/templates/horizontal.ts` (90 lines): Implements `HORIZONTAL_CHANH_DIEN` (A4 Landscape `297mm x 210mm`, up to 4 columns per sheet, 64px bold `shortCode`, dashed borders with `✂` scissors cut mark indicators).
   - `src/services/pdf/templates/verticalA4.ts` (246 lines): Implements `VERTICAL_A4` (A4 Portrait `210mm x 297mm`) featuring:
     - Exact header: `"Phật Giáo Việt Nam • Bổn Tự Chùa Báo Ân"`
     - Titles: `"Sớ Phục Nguyện Cầu An"` / `"Sớ Phục Nguyện Cầu Siêu"`
     - Invocations: Dược Sư / A Di Đà
     - Seal box: Red double-bordered `"Báo Ân Cổ Tự Pháp Ấn"`
     - Trai Chủ card & dynamic 1-4 column CSS grid target list.
   - `src/services/pdf/templates/phungViToaVi.ts` (106 lines): Implements `PHUNG_VI_TOA_VI` (A4 Landscape) featuring:
     - Top header: `"PHỤNG VÌ"` + `"Nam Mô Tiếp Dẫn Đạo Sư A Di Đà Phật"`
     - Bottom footer: `"TỌA VỊ"` + `"Chùa Báo Ân • Linh Vị"`
     - **Strict Omission**: Zero references to `col.shortCode` or `col.formCode`.
   - `src/services/pdf/renderSoHtml.ts` (96 lines): Unified entry function `renderSoHtml(data, options)` outputting complete HTML5 documents with UTF-8 encoding, Times New Roman font stack, `@page` size/margin rules, and `-webkit-print-color-adjust: exact !important`.
   - `src/services/pdf/mockData.ts` (72 lines), `testEngine.ts` (62 lines), `runChallengerTest.ts` (295 lines), `index.ts` (8 lines).

2. **Absence of Hardcoded Facades or Bypasses**:
   - Zero hardcoded output strings or static pre-baked HTML responses.
   - No conditional branches detecting test environments to return dummy data.
   - No external third-party library dependencies used for core template rendering — all HTML/CSS generation is natively implemented in TypeScript.

3. **Verbatim Vietnamese Static Header Verification**:
   - `"Chùa Báo Ân"`: Verified in `verticalA4.ts` (lines 137, 219), `phungViToaVi.ts` (line 78), `renderSoHtml.ts` (line 39).
   - `"Sớ Phục Nguyện Cầu An/Cầu Siêu"`: Verified in `verticalA4.ts` (line 139).
   - `"PHỤNG VÌ"`: Verified in `phungViToaVi.ts` (line 63).
   - `"TỌA VỊ"`: Verified in `phungViToaVi.ts` (line 75).

---

## 2. Logic Chain

1. **Check 1: Hardcoded Test Outputs & Dummy Facades**:
   - *Observation*: Inspected `renderSoHtml.ts` and all generator functions. `renderSoHtml` dynamically constructs HTML by calling generator functions based on `printMode` parameter.
   - *Reasoning*: If facade implementations or hardcoded outputs existed, we would observe fixed HTML strings or hardcoded form codes (e.g. `return "<html>...CA-0001..."`). Instead, the code iterates over `forms` array and target objects, computing layout dynamics dynamically.
   - *Conclusion*: PASS — No hardcoded test outputs or dummy facades.

2. **Check 2: Genuine Implementation of Requirements**:
   - *Template Rendering*: 3 distinct layout generators (`verticalA4.ts`, `horizontal.ts`, `phungViToaVi.ts`) dynamically produce valid HTML5 pages.
   - *Line Weighting & Auto Column Splitting*: `lineWeight.ts` calculates line height weights (1 for short name, 2 for long/dharma/birth year, 4 for form code) and splits columns at 28 lines (vertical) / 13 lines (horizontal), automatically appending `(Tiếp)` continuation headers.
   - *Static Vietnamese Headers*: All requested Vietnamese header strings ("Chùa Báo Ân", "Sớ Phục Nguyện Cầu An/Cầu Siêu", "PHỤNG VÌ", "TỌA VỊ") are accurately hardcoded in the appropriate template sections with proper diacritical marks.
   - *Conclusion*: PASS — Genuine implementation confirmed.

3. **Check 3: Code Clean of Fake Bypasses**:
   - *Observation*: Inspected codebase for bypass flags, environment checks (`process.env.NODE_ENV`), or short-circuiting returns.
   - *Reasoning*: Code operates purely on input parameters (`FormRecord`, `TemplateOptions`) with input sanitization via `escapeHtml()`.
   - *Conclusion*: PASS — Code is 100% clean of fake bypasses.

---

## 3. Caveats

- **CSS `@page` Margin Driver Variations**: Headless Chromium / print drivers handle `@page` print boundaries standardly. On customized print drivers, minor margin tuning may be required.
- **Offline Background Images**: Background images specified via `options.templateUrl` fall back gracefully to a solid parchment background (`#fdfbf7`) if offline.

---

## 4. Conclusion

**VERDICT: CLEAN**

The M2 PDF Template Engine (`c:\Users\ADMIN\Desktop\pagodaweb\src\services\pdf\`) is an authentic, complete, robust, and clean implementation. It strictly satisfies all milestone criteria without any integrity violations, hardcoded facades, or fake bypasses.

---

## 5. Verification Method

To independently verify this audit:

1. **Source Inspection**:
   - Inspect `c:\Users\ADMIN\Desktop\pagodaweb\src\services\pdf\` files: `types.ts`, `lineWeight.ts`, `templates/verticalA4.ts`, `templates/horizontal.ts`, `templates/phungViToaVi.ts`, `renderSoHtml.ts`.
2. **Execute Automated Verification Engine**:
   - Run `npx tsx src/services/pdf/runChallengerTest.ts` or `runPdfEngineSelfCheck()` from `src/services/pdf/testEngine.ts`.
3. **Invalidation Conditions**:
   - `renderSoHtml` returning hardcoded pre-baked HTML regardless of inputs.
   - Missing static Vietnamese headers ("Chùa Báo Ân", "Sớ Phục Nguyện Cầu An/Cầu Siêu", "PHỤNG VÌ", "TỌA VỊ").
   - `PHUNG_VI_TOA_VI` mode displaying form codes or short codes.
   - Failure of line weight auto-column splitting for 30+ targets.

---

## Forensic Audit Summary Table

| Check Item | Requirement | Status | Evidence |
|---|---|---|---|
| **Hardcoded Outputs** | No pre-baked test outputs or facades | **PASS** | Evaluated line-by-line; dynamic string interpolation used throughout |
| **Template Rendering** | Genuine HTML/CSS rendering for 3 print modes | **PASS** | `verticalA4.ts`, `horizontal.ts`, `phungViToaVi.ts` fully implemented |
| **Line Weighting** | Dynamic line weight calculation & column splits | **PASS** | `lineWeight.ts` calculates weights (1, 2, 4) & inserts `(Tiếp)` continuation headers |
| **Auto Column Splitting** | Multi-column grid auto allocation | **PASS** | Dynamic CSS grid `repeat(N, minmax(0, 1fr))` allocated |
| **Vietnamese Headers** | Exact static Vietnamese title strings | **PASS** | All required headers present with accurate diacritics |
| **Phụng Vì - Tọa Vị** | Strict form code omission | **PASS** | Zero references to form codes or short codes in template generator |
| **Fake Bypasses** | Clean of mock overrides or bypass switches | **PASS** | Pure functional renderer without test-bypass flags |
