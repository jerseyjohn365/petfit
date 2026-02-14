create table public.reminder_settings (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references public.dogs(id) on delete cascade,
  frequency text not null default 'weekly' check (frequency in ('daily', 'weekly', 'biweekly', 'monthly')),
  day_of_week int check (day_of_week between 0 and 6),
  preferred_time time not null default '09:00',
  expo_push_token text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reminder_settings enable row level security;

create policy "Users can view own dog reminders" on public.reminder_settings
  for select using (
    exists (select 1 from public.dogs where dogs.id = reminder_settings.dog_id and dogs.user_id = auth.uid())
  );
create policy "Users can insert own dog reminders" on public.reminder_settings
  for insert with check (
    exists (select 1 from public.dogs where dogs.id = reminder_settings.dog_id and dogs.user_id = auth.uid())
  );
create policy "Users can update own dog reminders" on public.reminder_settings
  for update using (
    exists (select 1 from public.dogs where dogs.id = reminder_settings.dog_id and dogs.user_id = auth.uid())
  );
create policy "Users can delete own dog reminders" on public.reminder_settings
  for delete using (
    exists (select 1 from public.dogs where dogs.id = reminder_settings.dog_id and dogs.user_id = auth.uid())
  );

create index idx_reminder_settings_dog_id on public.reminder_settings(dog_id);
