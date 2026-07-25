# HANDOFF REPORT — EXPLORER 3 (MILESTONE M1)

**Task**: Cross-Platform PDF Generation & Preview Analysis for React Native (`pagoda-app`)  
**Working Directory**: `c:\Users\ADMIN\Desktop\pagodaweb\.agents\explorer_m1_3`  
**Date**: 2026-07-24  
**Author**: Explorer 3 (Milestone M1)

---

## 1. OBSERVATION

1. **Legacy Next.js Print Station Architecture**:
   - Location: `c:\Users\ADMIN\Desktop\pagodaweb\src\app\dashboard\print\PrintStation.tsx` (Lines 258-558).
   - Mode switching: Controlled via `printMode` state supporting three distinct values:
     - `'READING'`: Vertical A4 Portrait (`210mm x 297mm`), single-page fit (`270mm` max container height), headers, Buddha invocations, signature blocks, 1-4 dynamic columns (`MAX_PER_COL = 15`).
     - `'POSTER'`: Horizontal A4 Landscape (`297mm x 210mm`), 4 columns per page (`MAX_COLS_PER_PAGE = 4`), max 13 lines/col, 3-digit large form code (`fontSize: 64px`), dashed border with cut scissors indicators (`✂`).
     - `'PHUNG_VI'`: Spirit tablet format, top title **`PHỤNG VÌ`**, bottom title **`TỌA VỊ`**, subtitle `"Chùa Báo Ân • Linh Vị"`, **strictly omitting form codes and column numbers**.
2. **Line-Weight Algorithm**:
   - Location: `c:\Users\ADMIN\Desktop\pagodaweb\src\utils\so\lineWeight.ts` (Lines 1-128).
   - Max lines per column: `MAX_LINES_PER_COL = 28`.
   - Line weights: Form code header = 4 lines; Short name (< 15 chars) = 1 line; Long name (>= 15 chars or extra metadata) = 2 lines.
   - Column overflow continuation header: `[Mã_Phiếu (Tiếp)]` (4 lines).
3. **CSS Print Rules & Font Specifications**:
   - Location: `c:\Users\ADMIN\Desktop\pagodaweb\src\app\globals.css` (Lines 59-137).
   - Font family invariant: `font-family: "Times New Roman", Times, serif !important;`.
   - Exact color adjust: `-webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;`.
   - Page break controls: `.break-after-page` (`page-break-after: always`), `.break-inside-avoid` (`page-break-inside: avoid`).
4. **React Native Ecosystem Options**:
   - `expo-print`: Provides `printToFileAsync({ html, width, height, base64 })` and `printAsync({ html, uri })`. Native PDF rendering on iOS and Android.
   - `react-native-webview`: Renders HTML/CSS strings natively on iOS (WKWebView) and Android (Chromium WebView).
   - `@react-pdf/renderer`: Custom PDFkit React wrapper, lacks standard HTML/CSS support, requires Webpack/Metro bundler polyfills.

---

## 2. LOGIC CHAIN

1. **Premise 1 (Observation 1 & 3)**: The legacy Next.js web application renders all 3 print modes (`READING`, `POSTER`, `PHUNG_VI`) using clean HTML/CSS elements styled with Times New Roman serif typography, flexbox/grid layout, and media query print rules (`@page`).
2. **Premise 2 (Observation 4)**: React Native / Expo supports `react-native-webview` for in-app live previewing of HTML strings, and `expo-print` for converting HTML strings to physical PDF binary files (`printToFileAsync`) or launching OS native print dialogs (`printAsync`).
3. **Deduction 1**: Implementing a shared HTML/CSS template generator function (`renderSoHtml(data, mode)`) allows 100% code reuse across React Native WebView preview, React Native PDF export via `expo-print`, Next.js web rendering, and Node.js verification scripts.
4. **Deduction 2**: For offline mobile operation in temple environments, embedding fonts as Base64 Data URIs or relying on native system serif fonts ("Times New Roman") guarantees correct rendering of Vietnamese diacritics and traditional Hán-Nôm text without external network requests.
5. **Deduction 3**: A Node/TypeScript verification script (`scripts/verify-pdf-export.ts`) that executes `renderSoHtml()` with mock data and writes physical `.html` and `.pdf` files to disk enables automated agent inspection (Agent-as-judge) and unit test assertions without requiring physical mobile hardware.

---

## 3. CAVEATS

1. **`pagoda-app` Path Access**: Direct access to `c:\Users\ADMIN\Desktop\pagoda-app` timed out during read permission check. Analysis was conducted based on standard Expo SDK 50+ / React Native architectural patterns and existing `pagodaweb` contracts.
2. **Puppeteer Dependency in Offline Node Environments**: Converting HTML to PDF in a Node.js CLI script requires headless Chromium (`puppeteer` or `playwright`). If Chromium binary is unavailable, saving standalone `.html` files (with embedded CSS/Base64 assets) provides an identical visual inspection baseline in any browser.

---

## 4. CONCLUSION

1. **Selected Architecture**: Choose the **HTML-to-PDF / WebView hybrid pattern** using `expo-print` + `react-native-webview` for React Native (`pagoda-app`).
2. **Unified Template Engine**: Define `renderSoHtml(formRecord: FormRecord, mode: PrintMode): string` as the single source of truth for HTML template rendering.
3. **Verification Script Design**: Implement `scripts/verify-pdf-export.ts` to output `reading_a4.html`, `poster_landscape.html`, and `phung_vi.html` (and `.pdf` equivalents) to `./output/` for automated verification.

---

## 5. VERIFICATION METHOD

To verify the findings and proposed verification strategy:

1. **Inspect Analysis Report**:
   - Check file: `c:\Users\ADMIN\Desktop\pagodaweb\.agents\explorer_m1_3\analysis.md`
   - Confirm coverage of:
     - 3 Print modes (`READING`, `POSTER`, `PHUNG_VI`).
     - HTML-to-PDF vs `@react-pdf/renderer` vs `expo-print` comparison.
     - Base64 font embedding & Vietnamese text rendering.
     - Node/TS verification script design.
2. **Inspect Legacy Code References**:
   - `PrintStation.tsx` (Lines 258-558) in `pagodaweb`.
   - `lineWeight.ts` (Lines 1-128) in `pagodaweb`.
   - `globals.css` (Lines 59-137) in `pagodaweb`.
3. **Invalidation Conditions**:
   - If `@react-pdf/renderer` were chosen, it would invalidate the unified HTML template engine requirement because `@react-pdf` cannot render HTML/CSS strings directly.
   - If `PHUNG_VI` mode included form codes or item numbers, it would violate the sacred spirit tablet domain rules.
