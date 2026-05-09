import { Provider, ProviderRecommendation } from './provider.model';
import { ProviderPreference } from './provider-preference.model';
import { PromptTemplate } from './prompt-template.model';
import { TaskHistory } from './task-history.model';
import { Task } from './task.model';
import { UserProfile } from './user-profile.model';

export interface CharaHubTables {
  user_profiles: UserProfile;
  providers: Provider;
  tasks: Task;
  provider_recommendations: ProviderRecommendation;
  prompt_templates: PromptTemplate;
  task_history: TaskHistory;
  provider_preferences: ProviderPreference;
}

export type CharaHubTableName = keyof CharaHubTables;

