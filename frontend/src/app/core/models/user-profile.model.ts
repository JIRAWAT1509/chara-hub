import { WorkMode } from './work-mode';

export interface UserProfile {
  id: string;
  display_name: string | null;
  default_work_mode: WorkMode;
  created_at: string;
  updated_at: string;
}

