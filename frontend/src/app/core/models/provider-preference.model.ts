import { ProviderId } from './provider.model';
import { TaskCategory } from './task-category';
import { WorkMode } from './work-mode';

export interface ProviderPreference {
  id: string;
  user_profile_id: string;
  category: TaskCategory;
  work_mode: WorkMode | null;
  provider_order: ProviderId[];
  created_at: string;
  updated_at: string;
}

