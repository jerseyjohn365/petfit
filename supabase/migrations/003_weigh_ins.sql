create table public.weigh_ins (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references public.dogs(id) on delete cascade,
  weight numeric(6,2) not null,
  weighed_on date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.weigh_ins enable row level security;

create policy "Users can view own dog weigh-ins" on public.weigh_ins
  for select using (
    exists (select 1 from public.dogs where dogs.id = weigh_ins.dog_id and dogs.user_id = auth.uid())
  );
create policy "Users can insert own dog weigh-ins" on public.weigh_ins
  for insert with check (
    exists (select 1 from public.dogs where dogs.id = weigh_ins.dog_id and dogs.user_id = auth.uid())
  );
create policy "Users can update own dog weigh-ins" on public.weigh_ins
  for update using (
    exists (select 1 from public.dogs where dogs.id = weigh_ins.dog_id and dogs.user_id = auth.uid())
  );
create policy "Users can delete own dog weigh-ins" on public.weigh_ins
  for delete using (
    exists (select 1 from public.dogs where dogs.id = weigh_ins.dog_id and dogs.user_id = auth.uid())
  );

create index idx_weigh_ins_dog_id on public.weigh_ins(dog_id);
create index idx_weigh_ins_weighed_on on public.weigh_ins(dog_id, weighed_on);
