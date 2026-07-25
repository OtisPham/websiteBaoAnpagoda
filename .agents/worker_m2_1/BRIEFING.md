# BRIEFING — 2026-07-24T23:37:00Z

## Mission
Implement Template Restoration & Engine for Milestone M2.

## 🔒 My Identity
- Archetype: implementer
- Roles: implementer, qa, specialist
- Working directory: c:\Users\ADMIN\Desktop\pagodaweb\.agents\worker_m2_1
- Original parent: d1d1b23f-6aeb-4bd7-be8a-6c091e5284dc
- Milestone: M2 - Template Restoration & Engine

## 🔒 Key Constraints
- CODE_ONLY network mode: No external URL access or network downloads.
- DO NOT CHEAT: Genuine implementations only, no hardcoded verification strings or facade implementations.
- Enforce strict cultural requirements for temple sớ (Times New Roman, correct Vietnamese text, strict form code omission for Phụng Vì - Tọa Vị).

## Current Parent
- Conversation ID: d1d1b23f-6aeb-4bd7-be8a-6c091e5284dc
- Updated: 2026-07-24T23:37:00Z

## Task Summary
- **What to build**: Full template rendering engine in `src/services/pdf/`
  - `types.ts`: FormRecord, TargetPerson, PrintMode, FormType, TemplateOptions
  - `lineWeight.ts`: Line-weight calculation (28 lines/col max for vertical, 13 lines/col for horizontal, form code weight=4, long name=2, short name=1)
  - `templates/horizontal.ts`: Horizontal / Ngang dán chánh điện HTML/CSS generator
  - `templates/verticalA4.ts`: Vertical A4 / Dọc A4 HTML/CSS generator
  - `templates/phungViToaVi.ts`: Phụng Vì - Tọa Vị HTML/CSS generator (strictly omitting form codes)
  - `renderSoHtml.ts`: Main entry point returning standalone HTML with `@page` setup, Times New Roman, and print-color-adjust
  - `mockData.ts`: Mock test records for Cầu An, Cầu Siêu, and Phụng Vì modes
  - `testEngine.ts`: Automated self-check test suite
  - `index.ts`: Barrel export file
- **Success criteria**: Clean TypeScript types, correct line-weight chunking, faithful HTML layout generation, zero lint/build errors.

## Key Decisions Made
- Structured PDF service module under `src/services/pdf/` with separate modular template generators for `horizontal`, `verticalA4`, and `phungViToaVi`.
- Implemented robust line-weight calculations supporting both vertical (28 lines/col max, form code weight=4, long name=2, short name=1) and horizontal (13 lines/col max, 4 cols/page max).
- Built automated self-check test suite (`testEngine.ts`) verifying all 4 print render modes and strict omission of form code numbers in `PHUNG_VI_TOA_VI` mode.

## Change Tracker
- **Files created**:
  - `src/services/pdf/types.ts`
  - `src/services/pdf/lineWeight.ts`
  - `src/services/pdf/templates/horizontal.ts`
  - `src/services/pdf/templates/verticalA4.ts`
  - `src/services/pdf/templates/phungViToaVi.ts`
  - `src/services/pdf/renderSoHtml.ts`
  - `src/services/pdf/mockData.ts`
  - `src/services/pdf/testEngine.ts`
  - `src/services/pdf/index.ts`
- **Build status**: All newly added TypeScript files pass clean without any errors.

## Quality Status
- **Build/test result**: All 4 template modes tested via `runPdfEngineSelfCheck()` pass 100%.

## Artifact Index
- `.agents/worker_m2_1/handoff.md` — Final worker handoff report
- `.agents/worker_m2_1/progress.md` — Progress tracker and heartbeat
