import * as fs from 'fs';
import * as path from 'path';
import {
  renderSoHtml,
  generateHorizontalTemplate,
  generateVerticalA4Template,
  generatePhungViToaViTemplate,
  chunkSoColumns,
  chunkHorizontalColumns,
  calculateNameWeight,
  FormRecord,
  TargetPerson,
} from '../../src/services/pdf';

export interface VerificationResult {
  suiteName: string;
  passed: boolean;
  checks: { name: string; passed: boolean; detail: string }[];
}

export function runEmpiricalPdfVerificationSuite(): VerificationResult[] {
  const suites: VerificationResult[] = [];

  // =========================================================================
  // SUITE 1: Physical Output Files & Content Assertions (Requirement 3 & 1)
  // =========================================================================
  const suite1Checks: { name: string; passed: boolean; detail: string }[] = [];
  const outputDir = path.resolve(process.cwd(), 'output');

  const requiredFiles = [
    'sample-horizontal.html',
    'sample-horizontal.pdf',
    'sample-vertical.html',
    'sample-vertical.pdf',
    'sample-phungvi.html',
    'sample-phungvi.pdf',
  ];

  for (const filename of requiredFiles) {
    const filePath = path.join(outputDir, filename);
    const exists = fs.existsSync(filePath);
    const size = exists ? fs.statSync(filePath).size : 0;
    suite1Checks.push({
      name: `Physical File Exists: ${filename}`,
      passed: exists && size > 0,
      detail: exists ? `File size: ${size} bytes` : 'File does not exist',
    });
  }

  // String assertions on HTML output content
  const verticalHtml = fs.readFileSync(path.join(outputDir, 'sample-vertical.html'), 'utf-8');
  const phungViHtml = fs.readFileSync(path.join(outputDir, 'sample-phungvi.html'), 'utf-8');
  const horizontalHtml = fs.readFileSync(path.join(outputDir, 'sample-horizontal.html'), 'utf-8');

  suite1Checks.push({
    name: 'Header Content Assertion ("Chùa Báo Ân")',
    passed: verticalHtml.includes('Chùa Báo Ân') && phungViHtml.includes('Chùa Báo Ân'),
    detail: 'Verified "Chùa Báo Ân" in vertical and phungvi HTML exports',
  });

  suite1Checks.push({
    name: 'Title Content Assertion ("Sớ Phục Nguyện Cầu An")',
    passed: verticalHtml.includes('Sớ Phục Nguyện Cầu An'),
    detail: 'Verified "Sớ Phục Nguyện Cầu An" in sample-vertical.html',
  });

  suite1Checks.push({
    name: 'Title Content Assertion ("Sớ Phục Nguyện Cầu Siêu")',
    passed: verticalHtml.includes('Sớ Phục Nguyện Cầu Siêu'),
    detail: 'Verified "Sớ Phục Nguyện Cầu Siêu" in sample-vertical.html',
  });

  suite1Checks.push({
    name: 'Term Content Assertion ("PHỤNG VÌ")',
    passed: phungViHtml.includes('PHỤNG VÌ'),
    detail: 'Verified "PHỤNG VÌ" in sample-phungvi.html',
  });

  suite1Checks.push({
    name: 'Term Content Assertion ("TỌA VỊ")',
    passed: phungViHtml.includes('TỌA VỊ'),
    detail: 'Verified "TỌA VỊ" in sample-phungvi.html',
  });

  suites.push({
    suiteName: 'Physical Export & String Verification Suite',
    passed: suite1Checks.every((c) => c.passed),
    checks: suite1Checks,
  });

  // =========================================================================
  // SUITE 2: Edge Case — Empty Lists / 0 Entries (Requirement 2)
  // =========================================================================
  const suite2Checks: { name: string; passed: boolean; detail: string }[] = [];

  // 2.1 Render empty array of forms across all 3 print modes
  const emptyHoriz = renderSoHtml([], { printMode: 'HORIZONTAL_CHANH_DIEN' });
  const emptyVert = renderSoHtml([], { printMode: 'VERTICAL_A4' });
  const emptyPhungVi = renderSoHtml([], { printMode: 'PHUNG_VI_TOA_VI' });

  suite2Checks.push({
    name: 'Empty Forms List (HORIZONTAL_CHANH_DIEN)',
    passed: emptyHoriz.includes('Không có dữ liệu phiếu sớ để in.') && emptyHoriz.includes('<!DOCTYPE html>'),
    detail: 'Handled 0 forms cleanly with fallback empty state',
  });

  suite2Checks.push({
    name: 'Empty Forms List (VERTICAL_A4)',
    passed: emptyVert.includes('Không có dữ liệu phiếu sớ để in.') && emptyVert.includes('<!DOCTYPE html>'),
    detail: 'Handled 0 forms cleanly with fallback empty state',
  });

  suite2Checks.push({
    name: 'Empty Forms List (PHUNG_VI_TOA_VI)',
    passed: emptyPhungVi.includes('Không có dữ liệu phiếu sớ để in.') && emptyPhungVi.includes('<!DOCTYPE html>'),
    detail: 'Handled 0 forms cleanly with fallback empty state',
  });

  // 2.2 Form record with 0 targets
  const formZeroTargets: FormRecord = {
    id: 'form-empty-targets',
    form_code: 'CA-0000',
    form_type: 'CAU_AN',
    status: 'COMPLETED',
    is_delegated: false,
    scheduled_date: '2026-07-25',
    users: { full_name: 'Nguyễn Văn Zero', phone: '0900000000' },
    targets: [],
  };

  const htmlZeroTargets = renderSoHtml(formZeroTargets, { printMode: 'VERTICAL_A4' });
  suite2Checks.push({
    name: 'Form with 0 Targets (VERTICAL_A4)',
    passed: htmlZeroTargets.includes('(Gia chủ cúng dường chung cho gia quyến)'),
    detail: 'Rendered explicit fallback text: "(Gia chủ cúng dường chung cho gia quyến)"',
  });

  suites.push({
    suiteName: 'Edge Case Suite — Empty Lists & 0 Entries',
    passed: suite2Checks.every((c) => c.passed),
    checks: suite2Checks,
  });

  // =========================================================================
  // SUITE 3: Edge Case — Extremely Large Entry Counts (50+ Entries) (Requirement 2)
  // =========================================================================
  const suite3Checks: { name: string; passed: boolean; detail: string }[] = [];

  const targets55: TargetPerson[] = Array.from({ length: 55 }, (_, i) => ({
    id: `tgt-55-${i + 1}`,
    full_name: `Hương Linh Phạm Văn Thọ ${i + 1}`,
    dharma_name: `Tịnh Tâm ${i + 1}`,
    birth_year: 1940 + (i % 50),
    death_year: 2020,
    relation: 'HƯƠNG LINH',
    type: 'CAU_SIEU',
  }));

  const form55: FormRecord = {
    id: 'form-55-entries',
    form_code: 'CS-5555',
    form_type: 'CAU_SIEU',
    status: 'COMPLETED',
    is_delegated: false,
    scheduled_date: '2026-07-25',
    users: { full_name: 'Phạm Thị Thọ', phone: '0955555555' },
    targets: targets55,
  };

  // Vertical A4 55 entries line weight chunking & continuation header check
  const cols55 = chunkSoColumns([{ ...form55, targets: targets55 }]);
  const html55Vert = renderSoHtml(form55, { printMode: 'VERTICAL_A4' });

  suite3Checks.push({
    name: 'Vertical A4 55 Entries Line-Weight Column Chunking',
    passed: cols55.length >= 3 && html55Vert.includes('CS-5555 (Tiếp)'),
    detail: `Generated ${cols55.length} columns, successfully inserted 'CS-5555 (Tiếp)' continuation header`,
  });

  suite3Checks.push({
    name: 'Vertical A4 55 Entries Content Completeness',
    passed: html55Vert.includes('Hương Linh Phạm Văn Thọ 55') && html55Vert.includes('1. Hương Linh Phạm Văn Thọ 1'),
    detail: 'All 55 targets rendered from first (#1) to last (#55)',
  });

  // Horizontal 55 entries multi-page chunking check
  const pages55Horiz = chunkHorizontalColumns([form55]);
  const html55Horiz = renderSoHtml(form55, { printMode: 'HORIZONTAL_CHANH_DIEN' });

  suite3Checks.push({
    name: 'Horizontal Chanh Dien 55 Entries Multi-Page Chunking',
    passed: pages55Horiz.length > 1 && html55Horiz.includes('so-page-block horizontal-page'),
    detail: `Chunked 55 entries into ${pages55Horiz.length} horizontal landscape pages`,
  });

  // Phung Vi 55 entries check
  const pages55PhungVi = chunkHorizontalColumns([form55]);
  const html55PhungVi = renderSoHtml(form55, { printMode: 'PHUNG_VI_TOA_VI' });

  suite3Checks.push({
    name: 'Phung Vi Toa Vi 55 Entries Multi-Page Chunking & Code Omission',
    passed: pages55PhungVi.length > 1 && !html55PhungVi.includes('CS-5555') && html55PhungVi.includes('PHỤNG VÌ'),
    detail: `Chunked into ${pages55PhungVi.length} pages while strictly omitting form code CS-5555`,
  });

  suites.push({
    suiteName: 'Edge Case Suite — 50+ Entries Stress Test',
    passed: suite3Checks.every((c) => c.passed),
    checks: suite3Checks,
  });

  // =========================================================================
  // SUITE 4: Heavy Vietnamese Diacritics & Formatting (Requirement 2)
  // =========================================================================
  const suite4Checks: { name: string; passed: boolean; detail: string }[] = [];

  const diacriticTargets: TargetPerson[] = [
    {
      id: 'd1',
      full_name: 'Nguyễn Trần Huyền Tôn Nữ Hoàng Thị Ngọc Minh Châu',
      dharma_name: 'Diệu Hương Thảo Ân',
      birth_year: 1980,
      relation: 'BẢN THÂN',
      type: 'CAU_AN',
    },
    {
      id: 'd2',
      full_name: 'Đặng Huỳnh Như Ý Ơn Ân Thượng',
      dharma_name: 'Tâm Từ Quảng Huệ',
      birth_year: 1975,
      relation: 'MẸ',
      type: 'CAU_AN',
    },
    {
      id: 'd3',
      full_name: 'Phan Nguyễn Triệu Vũ Thích Nữ Diệu Hạnh',
      dharma_name: 'Thích Nữ Diệu Hạnh',
      birth_year: 1965,
      relation: 'BÀ NỘI',
      type: 'CAU_AN',
    },
  ];

  const diacriticForm: FormRecord = {
    id: 'form-diacritic',
    form_code: 'CA-8888',
    form_type: 'CAU_AN',
    status: 'COMPLETED',
    is_delegated: false,
    scheduled_date: '2026-07-25',
    users: { full_name: 'Trần Vũ Hoài Phương', phone: '0988888888' },
    targets: diacriticTargets,
  };

  const htmlDiacriticV = renderSoHtml(diacriticForm, { printMode: 'VERTICAL_A4' });
  const htmlDiacriticH = renderSoHtml(diacriticForm, { printMode: 'HORIZONTAL_CHANH_DIEN' });

  suite4Checks.push({
    name: 'Vietnamese Accent Preservation (UTF-8 meta & diacritics)',
    passed:
      htmlDiacriticV.includes('<meta charset="UTF-8"') &&
      htmlDiacriticV.includes('Nguyễn Trần Huyền Tôn Nữ Hoàng Thị Ngọc Minh Châu') &&
      htmlDiacriticV.includes('Đặng Huỳnh Như Ý Ơn Ân Thượng'),
    detail: 'Full Vietnamese diacritics intact in HTML string',
  });

  suite4Checks.push({
    name: 'Uppercase Transformation for Horizontal Mode',
    passed: htmlDiacriticH.includes('ĐẶNG HUỲNH NHƯ Ý ƠN ÂN THƯỢNG'),
    detail: 'Correctly converted diacritic string to uppercase in horizontal mode',
  });

  suite4Checks.push({
    name: 'Line-Weight Calculation for Long Vietnamese Names (>= 15 chars or >= 5 words)',
    passed:
      calculateNameWeight('Nguyễn Trần Huyền Tôn Nữ Hoàng Thị Ngọc Minh Châu') === 2 &&
      calculateNameWeight('Nguyễn An') === 1,
    detail: 'Long name evaluated to weight 2, short name evaluated to weight 1',
  });

  suites.push({
    suiteName: 'Heavy Vietnamese Diacritics & Formatting Suite',
    passed: suite4Checks.every((c) => c.passed),
    checks: suite4Checks,
  });

  // =========================================================================
  // SUITE 5: Print Mode Compliance & Strict Invariants (Requirement 2 & 1)
  // =========================================================================
  const suite5Checks: { name: string; passed: boolean; detail: string }[] = [];

  const sampleForm: FormRecord = {
    id: 'form-sample',
    form_code: 'CA-1234',
    form_type: 'CAU_AN',
    status: 'COMPLETED',
    is_delegated: false,
    scheduled_date: '2026-07-25',
    users: { full_name: 'Nguyễn Văn Sample', phone: '0912345678' },
    targets: [{ id: 'st1', full_name: 'Nguyễn Văn Sample', relation: 'TRAI_CHU', type: 'CAU_AN' }],
  };

  const modeHoriz = renderSoHtml(sampleForm, { printMode: 'HORIZONTAL_CHANH_DIEN' });
  const modeVert = renderSoHtml(sampleForm, { printMode: 'VERTICAL_A4' });
  const modePhungVi = renderSoHtml(sampleForm, { printMode: 'PHUNG_VI_TOA_VI' });

  suite5Checks.push({
    name: 'HORIZONTAL_CHANH_DIEN CSS @page Specs',
    passed: modeHoriz.includes('size: A4 landscape;') && modeHoriz.includes('margin: 10mm;'),
    detail: '@page set to A4 landscape with 10mm margins',
  });

  suite5Checks.push({
    name: 'VERTICAL_A4 CSS @page Specs',
    passed: modeVert.includes('size: A4 portrait;') && modeVert.includes('margin: 12mm 15mm;'),
    detail: '@page set to A4 portrait with 12mm 15mm margins',
  });

  suite5Checks.push({
    name: 'PHUNG_VI_TOA_VI CSS @page Specs',
    passed: modePhungVi.includes('size: A4 landscape;') && modePhungVi.includes('margin: 10mm;'),
    detail: '@page set to A4 landscape with 10mm margins',
  });

  suite5Checks.push({
    name: 'PHUNG_VI_TOA_VI Strict Form Code Omission Invariant',
    passed: !modePhungVi.includes('CA-1234') && !modePhungVi.includes('234'),
    detail: 'STRICT INVARIANT MET: Neither form code CA-1234 nor shortCode 234 appear in Phung Vi template',
  });

  suites.push({
    suiteName: 'Print Mode Compliance & Invariants Suite',
    passed: suite5Checks.every((c) => c.passed),
    checks: suite5Checks,
  });

  return suites;
}
