create table public.dogs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  breed text,
  date_of_birth date,
  photo_url text,
  initial_weight numeric(6,2) not null,
  target_weight numeric(6,2) not null,
  weight_unit text not null default 'lbs' check (weight_unit in ('lbs', 'kg')),
  activity_level text not null default 'maintenance' check (activity_level in ('weight_loss', 'maintenance', 'active')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.dogs enable row level security;

create policy "Users can view own dogs" on public.dogs
  for select using (auth.uid() = user_id);
create policy "Users can insert own dogs" on public.dogs
  for insert with check (auth.uid() = user_id);
create policy "Users can update own dogs" on public.dogs
  for update using (auth.uid() = user_id);
create policy "Users can delete own dogs" on public.dogs
  for delete using (auth.uid() = user_id);

create index idx_dogs_user_id on public.dogs(user_id);
