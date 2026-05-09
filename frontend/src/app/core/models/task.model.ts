import { TaskCategory } from './task-category';
import { TaskStatus } from './task-status';
import { WorkMode } from './work-mode';

export type MatchedSignals = string[];

export interface Task {
  id: string;
  user_profile_id: string;
  title: string | null;
  raw_prompt: string;
  prepared_prompt: string | null;
  work_mode: WorkMode;
  category: TaskCategory;
  status: TaskStatus;
  detected_category: TaskCategory | null;
  selected_category: TaskCategory | null;
  confidence: number | null;
  matched_signals: MatchedSignals;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  user_profile_id: string;
  title?: string | null;
  raw_prompt: string;
  prepared_prompt?: string | null;
  work_mode: WorkMode;
  category: TaskCategory;
  status?: TaskStatus;
  detected_category?: TaskCategory | null;
  selected_category?: TaskCategory | null;
  confidence?: number | null;
  matched_signals?: MatchedSignals;
}

