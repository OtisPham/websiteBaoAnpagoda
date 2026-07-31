import { renderSoHtml } from './renderSoHtml';
import { mockCauAnForm, mockCauSieuForm, mockPhungViForm, mockFormsList } from './mockData';
import { FormRecord } from './types';

export function runPdfEngineSelfCheck(): { success: boolean; results: Record<string, boolean> } {
  const results: Record<string, boolean> = {};

  // Test 1: Vertical A4 (Cau An)
  const verticalCauAnHtml = renderSoHtml(mockCauAnForm, { printMode: 'VERTICAL_A4' });
  results.verticalCauAn =
    verticalCauAnHtml.includes('Sớ Cầu An') &&
    verticalCauAnHtml.includes('Giáo Hội Phật Giáo Việt Nam') &&
    verticalCauAnHtml.includes('Chùa Báo Ân') &&
    verticalCauAnHtml.includes('CA-0001') &&
    verticalCauAnHtml.includes('Nguyễn Văn An');

  // Test 2: Vertical A4 (Cau Sieu)
  const verticalCauSieuHtml = renderSoHtml(mockCauSieuForm, { printMode: 'VERTICAL_A4' });
  results.verticalCauSieu =
    verticalCauSieuHtml.includes('Sớ Cầu Siêu') &&
    verticalCauSieuHtml.includes('Nam Mô Tiếp Dẫn Đạo Sư A Di Đà Phật') &&
    verticalCauSieuHtml.includes('CS-0002');

  // Test 3: Horizontal Chanh Dien
  const horizontalHtml = renderSoHtml(mockFormsList, { printMode: 'HORIZONTAL_CHANH_DIEN' });
  results.horizontalChanhDien =
    horizontalHtml.includes('60pt') &&
    horizontalHtml.includes('✂') &&
    horizontalHtml.includes('001') && // shortCode for CA-0001
    horizontalHtml.includes('002');   // shortCode for CS-0002

  // Test 4: Phung Vi Toa Vi (Strictly NO form code numbers)
  const phungViHtml = renderSoHtml(mockPhungViForm, { printMode: 'PHUNG_VI_TOA_VI' });
  results.phungViToaVi =
    phungViHtml.includes('PHỤNG VÌ') &&
    phungViHtml.includes('TỌA VỊ') &&
    phungViHtml.includes('Chùa Báo Ân • Linh Vị') &&
    !phungViHtml.includes('PV-0003') && // STRICT OMISSION OF FORM CODE
    !phungViHtml.includes('003');       // STRICT OMISSION OF SHORT CODE

  // Test 5: Vertical A4 Large List (>30 items) line-weight splitting & (Tiếp) continuation header
  const largeTargets = Array.from({ length: 32 }, (_, i) => ({
    id: `tgt-large-${i}`,
    full_name: `Nguyễn Văn ${i + 1}`,
    type: 'CAU_AN' as const,
  }));
  const mockLargeForm: FormRecord = {
    ...mockCauAnForm,
    id: 'form-large-001',
    form_code: 'CA-9999',
    targets: largeTargets,
  };
  const verticalLargeHtml = renderSoHtml(mockLargeForm, { printMode: 'VERTICAL_A4' });
  results.verticalA4LargeList =
    verticalLargeHtml.includes('CA-9999 (Tiếp)') &&
    verticalLargeHtml.includes('Nguyễn Văn 32');

  const allPassed = Object.values(results).every(Boolean);
  return { success: allPassed, results };
}

