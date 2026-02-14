create table public.feeding_logs (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references public.dogs(id) on delete cascade,
  food_product_id uuid references public.food_products(id),
  portion_size numeric(5,2) not null,
  portion_unit text not null default 'cups' check (portion_unit in ('cups', 'grams', 'oz')),
  calories numeric(6,1) not null,
  meal_type text not null default 'meal' check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack', 'meal')),
  fed_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.feeding_logs enable row level security;

create policy "Users can view own dog feeding logs" on public.feeding_logs
  for select using (
    exists (select 1 from public.dogs where dogs.id = feeding_logs.dog_id and dogs.user_id = auth.uid())
  );
create policy "Users can insert own dog feeding logs" on public.feeding_logs
  for insert with check (
    exists (select 1 from public.dogs where dogs.id = feeding_logs.dog_id and dogs.user_id = auth.uid())
  );
create policy "Users can update own dog feeding logs" on public.feeding_logs
  for update using (
    exists (select 1 from public.dogs where dogs.id = feeding_logs.dog_id and dogs.user_id = auth.uid())
  );
create policy "Users can delete own dog feeding logs" on public.feeding_logs
  for delete using (
    exists (select 1 from public.dogs where dogs.id = feeding_logs.dog_id and dogs.user_id = auth.uid())
  );

create index idx_feeding_logs_dog_id on public.feeding_logs(dog_id);
create index idx_feeding_logs_fed_at on public.feeding_logs(dog_id, fed_at);
