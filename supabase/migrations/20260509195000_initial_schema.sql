-- Chara Hub initial database schema.
-- This migration is intended for Supabase Postgres.

create extension if not exists "pgcrypto";

create table public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  default_work_mode text not null default 'CHARA',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_default_work_mode_check check (
    default_work_mode in ('CHARA', 'CHARA_WORK', 'CHARA_RUSHING')
  )
);

create table public.providers (
  id text primary key,
  name text not null,
  provider_type text not null,
  handoff_url text,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint providers_provider_type_check check (
    provider_type in ('WEB', 'CODING_TOOL', 'COMPANY_GROUNDED', 'LOCAL')
  )
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null references public.user_profiles (id) on delete cascade,
  title text,
  raw_prompt text not null,
  prepared_prompt text,
  work_mode text not null default 'CHARA',
  category text not null default 'GENERAL',
  status text not null default 'DRAFT',
  detected_category text,
  selected_category text,
  confidence numeric(4, 3),
  matched_signals jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_work_mode_check check (
    work_mode in ('CHARA', 'CHARA_WORK', 'CHARA_RUSHING')
  ),
  constraint tasks_category_check check (
    category in ('GENERAL', 'REASONING', 'CODING_LOGICAL', 'DOCUMENT_EMAIL', 'COMPANY_GROUNDED')
  ),
  constraint tasks_detected_category_check check (
    detected_category is null
    or detected_category in ('GENERAL', 'REASONING', 'CODING_LOGICAL', 'DOCUMENT_EMAIL', 'COMPANY_GROUNDED')
  ),
  constraint tasks_selected_category_check check (
    selected_category is null
    or selected_category in ('GENERAL', 'REASONING', 'CODING_LOGICAL', 'DOCUMENT_EMAIL', 'COMPANY_GROUNDED')
  ),
  constraint tasks_status_check check (
    status in ('DRAFT', 'PREPARED', 'SENT', 'ARCHIVED')
  ),
  constraint tasks_confidence_check check (
    confidence is null
    or (confidence >= 0 and confidence <= 1)
  )
);

create table public.provider_recommendations (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  primary_provider_id text not null references public.providers (id),
  alternative_provider_ids text[] not null default '{}'::text[],
  confidence numeric(4, 3) not null,
  reason text not null,
  created_at timestamptz not null default now(),
  constraint provider_recommendations_confidence_check check (
    confidence >= 0 and confidence <= 1
  )
);

create table public.prompt_templates (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid references public.user_profiles (id) on delete cascade,
  name text not null,
  description text,
  category text not null,
  work_mode text,
  body text not null,
  is_built_in boolean not null default false,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint prompt_templates_category_check check (
    category in ('GENERAL', 'REASONING', 'CODING_LOGICAL', 'DOCUMENT_EMAIL', 'COMPANY_GROUNDED')
  ),
  constraint prompt_templates_work_mode_check check (
    work_mode is null
    or work_mode in ('CHARA', 'CHARA_WORK', 'CHARA_RUSHING')
  ),
  constraint prompt_templates_owner_check check (
    (is_built_in = true and user_profile_id is null)
    or (is_built_in = false and user_profile_id is not null)
  )
);

create table public.task_history (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  event_type text not null,
  provider_id text references public.providers (id),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint task_history_event_type_check check (
    event_type in ('CREATED', 'CLASSIFIED', 'TEMPLATE_APPLIED', 'COPIED_PROMPT', 'OPENED_PROVIDER', 'ARCHIVED')
  )
);

create table public.provider_preferences (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null references public.user_profiles (id) on delete cascade,
  category text not null,
  work_mode text,
  provider_order text[] not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint provider_preferences_category_check check (
    category in ('GENERAL', 'REASONING', 'CODING_LOGICAL', 'DOCUMENT_EMAIL', 'COMPANY_GROUNDED')
  ),
  constraint provider_preferences_work_mode_check check (
    work_mode is null
    or work_mode in ('CHARA', 'CHARA_WORK', 'CHARA_RUSHING')
  ),
  constraint provider_preferences_provider_order_check check (
    array_length(provider_order, 1) > 0
  )
);

create index tasks_user_profile_id_created_at_idx
  on public.tasks (user_profile_id, created_at desc);

create index tasks_user_profile_id_category_idx
  on public.tasks (user_profile_id, category);

create index provider_recommendations_task_id_created_at_idx
  on public.provider_recommendations (task_id, created_at desc);

create index prompt_templates_user_profile_id_category_idx
  on public.prompt_templates (user_profile_id, category);

create index prompt_templates_built_in_category_idx
  on public.prompt_templates (category)
  where is_built_in = true;

create index task_history_task_id_created_at_idx
  on public.task_history (task_id, created_at desc);

create unique index provider_preferences_unique_mode_idx
  on public.provider_preferences (user_profile_id, category, coalesce(work_mode, ''));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

create trigger set_providers_updated_at
before update on public.providers
for each row execute function public.set_updated_at();

create trigger set_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create trigger set_prompt_templates_updated_at
before update on public.prompt_templates
for each row execute function public.set_updated_at();

create trigger set_provider_preferences_updated_at
before update on public.provider_preferences
for each row execute function public.set_updated_at();

alter table public.user_profiles enable row level security;
alter table public.providers enable row level security;
alter table public.tasks enable row level security;
alter table public.provider_recommendations enable row level security;
alter table public.prompt_templates enable row level security;
alter table public.task_history enable row level security;
alter table public.provider_preferences enable row level security;

create policy "Users can read their own profile"
on public.user_profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can insert their own profile"
on public.user_profiles for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.user_profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Authenticated users can read enabled providers"
on public.providers for select
to authenticated
using (is_enabled = true);

create policy "Users can read their own tasks"
on public.tasks for select
to authenticated
using ((select auth.uid()) = user_profile_id);

create policy "Users can insert their own tasks"
on public.tasks for insert
to authenticated
with check ((select auth.uid()) = user_profile_id);

create policy "Users can update their own tasks"
on public.tasks for update
to authenticated
using ((select auth.uid()) = user_profile_id)
with check ((select auth.uid()) = user_profile_id);

create policy "Users can read recommendations for their own tasks"
on public.provider_recommendations for select
to authenticated
using (
  exists (
    select 1
    from public.tasks
    where tasks.id = provider_recommendations.task_id
      and tasks.user_profile_id = (select auth.uid())
  )
);

create policy "Users can insert recommendations for their own tasks"
on public.provider_recommendations for insert
to authenticated
with check (
  exists (
    select 1
    from public.tasks
    where tasks.id = provider_recommendations.task_id
      and tasks.user_profile_id = (select auth.uid())
  )
);

create policy "Users can read built-in and own templates"
on public.prompt_templates for select
to authenticated
using (is_built_in = true or user_profile_id = (select auth.uid()));

create policy "Users can insert their own templates"
on public.prompt_templates for insert
to authenticated
with check (is_built_in = false and user_profile_id = (select auth.uid()));

create policy "Users can update their own templates"
on public.prompt_templates for update
to authenticated
using (is_built_in = false and user_profile_id = (select auth.uid()))
with check (is_built_in = false and user_profile_id = (select auth.uid()));

create policy "Users can read history for their own tasks"
on public.task_history for select
to authenticated
using (
  exists (
    select 1
    from public.tasks
    where tasks.id = task_history.task_id
      and tasks.user_profile_id = (select auth.uid())
  )
);

create policy "Users can insert history for their own tasks"
on public.task_history for insert
to authenticated
with check (
  exists (
    select 1
    from public.tasks
    where tasks.id = task_history.task_id
      and tasks.user_profile_id = (select auth.uid())
  )
);

create policy "Users can read their own provider preferences"
on public.provider_preferences for select
to authenticated
using ((select auth.uid()) = user_profile_id);

create policy "Users can insert their own provider preferences"
on public.provider_preferences for insert
to authenticated
with check ((select auth.uid()) = user_profile_id);

create policy "Users can update their own provider preferences"
on public.provider_preferences for update
to authenticated
using ((select auth.uid()) = user_profile_id)
with check ((select auth.uid()) = user_profile_id);

grant select on public.providers to authenticated;
grant select, insert, update on public.user_profiles to authenticated;
grant select, insert, update on public.tasks to authenticated;
grant select, insert on public.provider_recommendations to authenticated;
grant select, insert, update on public.prompt_templates to authenticated;
grant select, insert on public.task_history to authenticated;
grant select, insert, update on public.provider_preferences to authenticated;

insert into public.providers (id, name, provider_type, handoff_url, is_enabled)
values
  ('chatgpt', 'ChatGPT', 'WEB', 'https://chatgpt.com/', true),
  ('claude', 'Claude', 'WEB', 'https://claude.ai/', true),
  ('microsoft_copilot', 'Microsoft Copilot / Teams AI', 'COMPANY_GROUNDED', 'https://copilot.microsoft.com/', true),
  ('codex', 'Codex', 'CODING_TOOL', null, true),
  ('claude_code', 'Claude Code', 'CODING_TOOL', null, true)
on conflict (id) do update
set
  name = excluded.name,
  provider_type = excluded.provider_type,
  handoff_url = excluded.handoff_url,
  is_enabled = excluded.is_enabled;

insert into public.prompt_templates (name, description, category, work_mode, body, is_built_in)
values
  (
    'Analyze and propose a small patch',
    'For serious coding/debugging tasks that should be inspected before editing.',
    'CODING_LOGICAL',
    'CHARA_WORK',
    'Analyze this task first, identify the likely cause, list the files to inspect, propose the smallest safe fix, and wait for approval before editing.\n\nTask:\n{{rawPrompt}}',
    true
  ),
  (
    'Polite professional rewrite',
    'For email and document rewriting with a clear tone target.',
    'DOCUMENT_EMAIL',
    'CHARA',
    'Rewrite the following message to be polite, clear, and professional. Keep the original meaning and avoid unnecessary fluff.\n\nMessage:\n{{rawPrompt}}',
    true
  ),
  (
    'Reasoned comparison',
    'For planning, tradeoff, and decision-support tasks.',
    'REASONING',
    'CHARA_WORK',
    'Compare the realistic options for this task. Explain tradeoffs, risks, and the recommended next step.\n\nTask:\n{{rawPrompt}}',
    true
  )
on conflict do nothing;
