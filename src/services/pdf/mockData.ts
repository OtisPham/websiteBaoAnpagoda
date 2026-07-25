import { FormRecord } from './types';

export const mockCauAnForm: FormRecord = {
  id: 'form-ca-001',
  form_code: 'CA-0001',
  form_type: 'CAU_AN',
  status: 'Accepted',
  is_delegated: false,
  scheduled_date: '15/07/2026',
  selected_time_slot: '09:00 - 10:30',
  note: 'Cầu cho gia đạo bình an, tai qua nạn khỏi, công danh thành đạt.',
  created_at: '2026-07-20T08:00:00Z',
  users: {
    full_name: 'Nguyễn Văn An',
    phone: '0901234567',
  },
  targets: [
    {
      id: 'tgt-ca-0',
      full_name: 'Nguyễn Văn An',
      dharma_name: 'Thiện Tâm',
      birth_year: 1975,
      relation: 'TRAI_CHU',
      type: 'CAU_AN',
    },
    {
      id: 'tgt-ca-1',
      full_name: 'Trần Thị Mai',
      dharma_name: 'Diệu Hương',
      birth_year: 1978,
      relation: 'Vợ',
      type: 'CAU_AN',
    },
    {
      id: 'tgt-ca-2',
      full_name: 'Nguyễn Minh Trí',
      dharma_name: 'Minh Trí',
      birth_year: 2005,
      relation: 'Con trai',
      type: 'CAU_AN',
    },
    {
      id: 'tgt-ca-3',
      full_name: 'Nguyễn Ngọc Trinh',
      dharma_name: 'Diệu Thảo',
      birth_year: 2008,
      relation: 'Con gái',
      type: 'CAU_AN',
    },
    {
      id: 'tgt-ca-4',
      full_name: 'Lê Văn Bình',
      dharma_name: 'Thiện Từ',
      birth_year: 1950,
      relation: 'Ông ngoại',
      type: 'CAU_AN',
    },
  ],
};

export const mockCauSieuForm: FormRecord = {
  id: 'form-cs-001',
  form_code: 'CS-0002',
  form_type: 'CAU_SIEU',
  status: 'Accepted',
  is_delegated: true,
  scheduled_date: '15/07/2026',
  selected_time_slot: null,
  note: 'Nguyện cầu chư hương linh trút bỏ trần duyên, vãn sinh Tây Phương Cực Lạc.',
  created_at: '2026-07-21T09:30:00Z',
  users: {
    full_name: 'Phạm Thị Hoa',
    phone: '0987654321',
  },
  targets: [
    {
      id: 'tgt-cs-0',
      full_name: 'Phạm Thị Hoa',
      dharma_name: 'Diệu Pháp',
      relation: 'TRAI_CHU',
      type: 'CAU_SIEU',
    },
    {
      id: 'tgt-cs-1',
      full_name: 'Phạm Văn Thành',
      dharma_name: 'Thiện Đức',
      birth_year: 1942,
      death_year: 2024,
      relation: 'Thân phụ',
      type: 'CAU_SIEU',
    },
    {
      id: 'tgt-cs-2',
      full_name: 'Hoàng Thị Tuyết',
      dharma_name: 'Diệu Vân',
      birth_year: 1945,
      death_year: 2025,
      relation: 'Thân mẫu',
      type: 'CAU_SIEU',
    },
    {
      id: 'tgt-cs-3',
      full_name: 'Phạm Quốc Hùng',
      dharma_name: 'Minh Đức',
      birth_year: 1970,
      death_year: 2020,
      relation: 'Anh trai',
      type: 'CAU_SIEU',
    },
    {
      id: 'tgt-cs-4',
      full_name: 'Nguyễn Thị Cúc',
      dharma_name: 'Diệu Nghiêm',
      birth_year: 1920,
      death_year: 1998,
      relation: 'Bà nội',
      type: 'CAU_SIEU',
    },
  ],
};

export const mockPhungViForm: FormRecord = {
  id: 'form-pv-001',
  form_code: 'PV-0003',
  form_type: 'CAU_SIEU',
  status: 'Accepted',
  is_delegated: false,
  scheduled_date: '15/07/2026',
  selected_time_slot: '14:00 - 15:30',
  note: 'Linh vị phụng vì gia tiên nội ngoại.',
  created_at: '2026-07-22T10:00:00Z',
  users: {
    full_name: 'Trần Văn Đức',
    phone: '0912345678',
  },
  targets: [
    {
      id: 'tgt-pv-0',
      full_name: 'Trần Văn Đức',
      relation: 'TRAI_CHU',
      type: 'CAU_SIEU',
    },
    {
      id: 'tgt-pv-1',
      full_name: 'Cụ Ông Trần Văn Ninh',
      dharma_name: 'Thiện Phúc',
      type: 'CAU_SIEU',
    },
    {
      id: 'tgt-pv-2',
      full_name: 'Cụ Bà Võ Thị Thắm',
      dharma_name: 'Diệu Nhẫn',
      type: 'CAU_SIEU',
    },
    {
      id: 'tgt-pv-3',
      full_name: 'Hương Linh Trần Văn Hải',
      dharma_name: 'Minh Thông',
      type: 'CAU_SIEU',
    },
  ],
};

export const mockFormsList: FormRecord[] = [
  mockCauAnForm,
  mockCauSieuForm,
  mockPhungViForm,
];
