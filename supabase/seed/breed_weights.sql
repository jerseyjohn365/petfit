-- Breed weights reference table and seed data
-- This table provides typical healthy weight ranges for common dog breeds

create table if not exists public.breed_weights (
  id uuid primary key default gen_random_uuid(),
  breed_name text not null unique,
  min_weight_lbs numeric(5,1) not null,
  max_weight_lbs numeric(5,1) not null,
  created_at timestamptz not null default now()
);

-- Allow all authenticated users to read breed weights (reference data)
alter table public.breed_weights enable row level security;

create policy "Anyone can view breed weights" on public.breed_weights
  for select using (true);

-- Seed ~50 common dog breeds with typical healthy weight ranges
insert into public.breed_weights (breed_name, min_weight_lbs, max_weight_lbs) values
('Labrador Retriever', 55.0, 80.0),
('Golden Retriever', 55.0, 75.0),
('German Shepherd', 50.0, 90.0),
('French Bulldog', 16.0, 28.0),
('Bulldog', 40.0, 50.0),
('Poodle (Standard)', 40.0, 70.0),
('Poodle (Miniature)', 10.0, 15.0),
('Poodle (Toy)', 4.0, 6.0),
('Beagle', 20.0, 30.0),
('Rottweiler', 80.0, 135.0),
('Dachshund (Standard)', 16.0, 32.0),
('Dachshund (Miniature)', 8.0, 11.0),
('Yorkshire Terrier', 4.0, 7.0),
('Boxer', 50.0, 80.0),
('Siberian Husky', 35.0, 60.0),
('Great Dane', 110.0, 175.0),
('Doberman Pinscher', 60.0, 100.0),
('Shih Tzu', 9.0, 16.0),
('Boston Terrier', 12.0, 25.0),
('Bernese Mountain Dog', 70.0, 115.0),
('Pomeranian', 3.0, 7.0),
('Havanese', 7.0, 13.0),
('Cavalier King Charles Spaniel', 13.0, 18.0),
('Cocker Spaniel (American)', 20.0, 30.0),
('Cocker Spaniel (English)', 26.0, 34.0),
('Australian Shepherd', 40.0, 65.0),
('Chihuahua', 3.0, 6.0),
('Maltese', 4.0, 7.0),
('Border Collie', 30.0, 55.0),
('Pembroke Welsh Corgi', 25.0, 30.0),
('Cardigan Welsh Corgi', 25.0, 38.0),
('German Shorthaired Pointer', 45.0, 70.0),
('Shetland Sheepdog', 15.0, 25.0),
('Miniature Schnauzer', 11.0, 20.0),
('English Springer Spaniel', 40.0, 50.0),
('Cane Corso', 88.0, 110.0),
('Brittany', 30.0, 40.0),
('Weimaraner', 55.0, 90.0),
('Vizsla', 44.0, 60.0),
('West Highland White Terrier', 15.0, 20.0),
('Rhodesian Ridgeback', 70.0, 85.0),
('Belgian Malinois', 40.0, 80.0),
('Basset Hound', 40.0, 65.0),
('Newfoundland', 100.0, 150.0),
('Bloodhound', 80.0, 110.0),
('Saint Bernard', 120.0, 180.0),
('Akita', 70.0, 130.0),
('Alaskan Malamute', 75.0, 100.0),
('Jack Russell Terrier', 13.0, 17.0),
('Bichon Frise', 12.0, 18.0),
('Papillon', 5.0, 10.0),
('Lhasa Apso', 12.0, 18.0),
('Australian Cattle Dog', 35.0, 50.0),
('Staffordshire Bull Terrier', 24.0, 38.0),
('Bull Terrier', 50.0, 70.0);
