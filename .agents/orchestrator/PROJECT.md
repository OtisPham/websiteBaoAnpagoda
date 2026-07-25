# Project: Pagoda PDF Printing Station & Template Restoration

## Architecture & Requirements
- **Next.js legacy project (`c:/Users/ADMIN/Desktop/pagodaweb`)**: Contains existing print templates / layouts (e.g. sớ cầu an, sớ cầu siêu, phụng vì, horizontal, vertical layouts).
- **React Native project (`c:/Users/ADMIN/Desktop/pagoda-app`)**: Cross-platform app needing PDF Printing Station (Preview + Print).
- **Supported Modes**:
  1. Horizontal (Ngang dán chánh điện)
  2. Vertical A4 (Dọc A4)
  3. Phụng Vì - Tọa Vị
- **Verification**:
  - Dummy export HTML/PDF script/test function producing physical file.
  - Verification of static text ("Chùa Báo Ân", "Sớ Cầu An/Cầu Siêu", template details).
  - TypeScript build / type-check pass clean.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Exploration & Analysis | Find legacy Next.js print templates in `pagodaweb`, inspect `pagoda-app` structure | None | DONE |
| M2 | Template Restoration & Engine | Recreate print templates (Horizontal, Vertical A4, Phụng Vì) and HTML/PDF generation logic | M1 | DONE |
| M3 | PDF Printing Station UI | Build React Native preview & print interface supporting 3 modes | M2 | DONE |
| M4 | Verification & Audit | Create dummy export script, execute physical PDF file generation, run TS check, perform agent audit | M3 | DONE |

## Interface Contracts
- **PDF Engine Contract**:
  - Inputs: Template Mode (`horizontal_chanh_dien` | `vertical_a4` | `phung_vi_toa_vi`), Sớ Data (Tên chùa, Loại sớ [Cầu An/Cầu Siêu], Gia chủ, Địa chỉ, Danh sách hương linh/cầu an...).
  - Outputs: HTML string / PDF file path / base64 for preview and printing.
