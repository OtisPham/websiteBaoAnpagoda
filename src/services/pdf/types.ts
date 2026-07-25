export type FormType = 'CAU_AN' | 'CAU_SIEU';

export type PrintMode = 'HORIZONTAL_CHANH_DIEN' | 'VERTICAL_A4' | 'PHUNG_VI_TOA_VI';

export interface TargetPerson {
  id: string;
  full_name: string;
  dharma_name?: string | null;
  birth_year?: number | null;
  death_year?: number | null;
  relation?: string | null;
  type: FormType;
}

export interface FormRecord {
  id: string;
  form_code: string;
  form_type: FormType;
  status: string;
  is_delegated: boolean;
  scheduled_date: string;
  selected_time_slot?: string | null;
  note?: string | null;
  created_at?: string;
  users?: { full_name: string; phone: string } | null;
  targets: TargetPerson[];
}

export interface TemplateOptions {
  templateUrl?: string | null;
  printMode?: PrintMode;
}
