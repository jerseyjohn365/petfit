create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references public.dogs(id) on delete cascade,
  milestone_type text not null,
  weight_at numeric(6,2),
  achieved_at timestamptz not null default now(),
  shared boolean not null default false,
  created_at timestamptz not null default now(),
  unique(dog_id, milestone_type)
);

alter table public.milestones enable row level security;

create policy "Users can view own dog milestones" on public.milestones
  for select using (
    exists (select 1 from public.dogs where dogs.id = milestones.dog_id and dogs.user_id = auth.uid())
  );
create policy "Users can insert own dog milestones" on public.milestones
  for insert with check (
    exists (select 1 from public.dogs where dogs.id = milestones.dog_id and dogs.user_id = auth.uid())
  );
create policy "Users can update own dog milestones" on public.milestones
  for update using (
    exists (select 1 from public.dogs where dogs.id = milestones.dog_id and dogs.user_id = auth.uid())
  );

create index idx_milestones_dog_id on public.milestones(dog_id);
