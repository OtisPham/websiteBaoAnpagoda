## 2026-07-24T23:49:55Z
You are Worker 3 for Milestone M3 (PDF Printing Station UI & Integration).
Your designated working directory is c:\Users\ADMIN\Desktop\pagodaweb\.agents\worker_m3_1. Please maintain progress.md and write your handoff.md there.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Task details:
1. Target workspace: `c:\Users\ADMIN\Desktop\pagoda-app`.
2. Check and install/ensure required dependencies (`expo-print`, `expo-sharing`, `react-native-webview`) in `c:\Users\ADMIN\Desktop\pagoda-app` package.json if needed.
3. Build & Integrate the PDF Printing Station UI at `c:\Users\ADMIN\Desktop\pagoda-app\src\app\(dashboard)\print\index.tsx`:
   - Mode switcher: Segmented buttons / tabs to switch between:
     - 1. Ngang dán chánh điện (`HORIZONTAL_CHANH_DIEN`)
     - 2. Dọc A4 (`VERTICAL_A4`)
     - 3. Phụng Vì - Tọa Vị (`PHUNG_VI_TOA_VI`)
   - Form selector / Data controls: Select between mock forms (Cầu An, Cầu Siêu, Phụng Vì) or adjust form fields (Chùa, Gia chủ, Địa chỉ, Danh sách cầu an/cầu siêu).
   - Live Preview Component: Render `renderSoHtml(data, options)` directly in `WebView` or interactive HTML view so users can preview exact layout.
   - Action Bar:
     - "In sớ" button: triggers `printAsync` via `expo-print` (or graceful web/fallback print window).
     - "Xuất file PDF" / "Chia sẻ" button: generates physical PDF file via `printToFileAsync` and opens native share dialog via `expo-sharing` (or saves file).
   - Styled nicely using `pagoda-app`'s NativeWind theme (buddhist gold `#D69F4C`, dark `#081B24`, background `#faf8f5`).
4. Ensure TypeScript type check passes clean for `src/app/(dashboard)/print/index.tsx` and all imported components.
5. Record your work in `c:\Users\ADMIN\Desktop\pagodaweb\.agents\worker_m3_1\handoff.md` and send a message back when done.
