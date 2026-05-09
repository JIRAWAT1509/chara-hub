import { TaskCategory } from './task-category';
import { WorkMode } from './work-mode';

export interface PromptTemplate {
  id: string;
  user_profile_id: string | null;
  name: string;
  description: string | null;
  category: TaskCategory;
  work_mode: WorkMode | null;
  body: string;
  is_built_in: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePromptTemplateInput {
  user_profile_id: string;
  name: string;
  description?: string | null;
  category: TaskCategory;
  work_mode?: WorkMode | null;
  body: string;
  is_built_in?: false;
  is_favorite?: boolean;
}

