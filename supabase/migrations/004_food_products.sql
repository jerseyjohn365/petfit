create table public.food_products (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  product_name text not null,
  calories_per_cup numeric(6,1) not null,
  food_type text not null default 'dry' check (food_type in ('dry', 'wet', 'raw', 'dehydrated')),
  is_curated boolean not null default false,
  approved boolean not null default false,
  submitted_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.food_products enable row level security;

-- Everyone can see curated and approved products
create policy "Anyone can view curated or approved products" on public.food_products
  for select using (is_curated = true or approved = true or submitted_by = auth.uid());

create policy "Users can submit products" on public.food_products
  for insert with check (auth.uid() = submitted_by and is_curated = false);

create policy "Users can update own submitted products" on public.food_products
  for update using (auth.uid() = submitted_by and is_curated = false);

-- Full text search index
create index idx_food_products_search on public.food_products
  using gin (to_tsvector('english', brand || ' ' || product_name));
