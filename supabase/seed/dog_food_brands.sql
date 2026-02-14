-- Seed data: Curated dog food products
-- All products are marked as curated and approved
-- Calories per cup values are realistic approximations

insert into public.food_products (brand, product_name, calories_per_cup, food_type, is_curated, approved) values

-- Purina Pro Plan (4 products)
('Purina Pro Plan', 'Savor Adult Shredded Blend Chicken & Rice', 413.0, 'dry', true, true),
('Purina Pro Plan', 'Sport Performance 30/20 Formula', 496.0, 'dry', true, true),
('Purina Pro Plan', 'Weight Management Chicken & Rice', 360.0, 'dry', true, true),
('Purina Pro Plan', 'Classic Adult Chicken & Rice Entree (Wet)', 280.0, 'wet', true, true),

-- Hill's Science Diet (4 products)
('Hill''s Science Diet', 'Adult Chicken & Barley Recipe', 370.0, 'dry', true, true),
('Hill''s Science Diet', 'Adult Perfect Weight', 321.0, 'dry', true, true),
('Hill''s Science Diet', 'Adult Large Breed Chicken & Barley', 363.0, 'dry', true, true),
('Hill''s Science Diet', 'Adult Savory Stew Chicken & Vegetables (Wet)', 265.0, 'wet', true, true),

-- Royal Canin (4 products)
('Royal Canin', 'Medium Adult Dry Dog Food', 348.0, 'dry', true, true),
('Royal Canin', 'Large Adult Dry Dog Food', 338.0, 'dry', true, true),
('Royal Canin', 'Small Adult Dry Dog Food', 362.0, 'dry', true, true),
('Royal Canin', 'Weight Care Adult Loaf in Sauce (Wet)', 252.0, 'wet', true, true),

-- Blue Buffalo (4 products)
('Blue Buffalo', 'Life Protection Formula Adult Chicken & Brown Rice', 378.0, 'dry', true, true),
('Blue Buffalo', 'Wilderness High Protein Chicken Recipe', 423.0, 'dry', true, true),
('Blue Buffalo', 'Life Protection Formula Healthy Weight', 325.0, 'dry', true, true),
('Blue Buffalo', 'Homestyle Recipe Chicken Dinner (Wet)', 295.0, 'wet', true, true),

-- Wellness (4 products)
('Wellness', 'Complete Health Adult Deboned Chicken & Oatmeal', 396.0, 'dry', true, true),
('Wellness', 'CORE Grain-Free Original Formula', 421.0, 'dry', true, true),
('Wellness', 'Complete Health Healthy Weight', 340.0, 'dry', true, true),
('Wellness', 'Stews Chicken Stew with Peas & Carrots (Wet)', 286.0, 'wet', true, true),

-- Orijen (4 products)
('Orijen', 'Original Dry Dog Food', 449.0, 'dry', true, true),
('Orijen', 'Six Fish Dry Dog Food', 443.0, 'dry', true, true),
('Orijen', 'Puppy Dry Dog Food', 453.0, 'dry', true, true),
('Orijen', 'Fit & Trim Dry Dog Food', 397.0, 'dry', true, true),

-- Acana (4 products)
('Acana', 'Heritage Red Meat Formula', 408.0, 'dry', true, true),
('Acana', 'Wild Prairie Dry Dog Food', 418.0, 'dry', true, true),
('Acana', 'Light & Fit Dry Dog Food', 345.0, 'dry', true, true),
('Acana', 'Grasslands Grain-Free', 410.0, 'dry', true, true),

-- Taste of the Wild (4 products)
('Taste of the Wild', 'High Prairie Canine Recipe', 370.0, 'dry', true, true),
('Taste of the Wild', 'Pacific Stream Canine Recipe', 360.0, 'dry', true, true),
('Taste of the Wild', 'Sierra Mountain Canine Recipe', 374.0, 'dry', true, true),
('Taste of the Wild', 'High Prairie Canine Recipe (Wet)', 310.0, 'wet', true, true),

-- Merrick (4 products)
('Merrick', 'Grain Free Real Texas Beef & Sweet Potato', 380.0, 'dry', true, true),
('Merrick', 'Classic Real Chicken + Green Peas', 387.0, 'dry', true, true),
('Merrick', 'Healthy Weight Recipe', 325.0, 'dry', true, true),
('Merrick', 'Grain Free Cowboy Cookout (Wet)', 340.0, 'wet', true, true),

-- Nutro (4 products)
('Nutro', 'Wholesome Essentials Adult Farm-Raised Chicken', 369.0, 'dry', true, true),
('Nutro', 'Ultra Adult Dry Dog Food', 352.0, 'dry', true, true),
('Nutro', 'Wholesome Essentials Healthy Weight', 307.0, 'dry', true, true),
('Nutro', 'Hearty Stew Adult Chunky Chicken Stew (Wet)', 275.0, 'wet', true, true),

-- Iams (4 products)
('Iams', 'ProActive Health Adult MiniChunks', 361.0, 'dry', true, true),
('Iams', 'ProActive Health Adult Large Breed', 337.0, 'dry', true, true),
('Iams', 'ProActive Health Healthy Weight', 298.0, 'dry', true, true),
('Iams', 'ProActive Health Classic Ground with Chicken (Wet)', 258.0, 'wet', true, true),

-- Eukanuba (4 products)
('Eukanuba', 'Adult Medium Breed Dry Dog Food', 378.0, 'dry', true, true),
('Eukanuba', 'Adult Large Breed Dry Dog Food', 358.0, 'dry', true, true),
('Eukanuba', 'Fit Body Weight Control Medium Breed', 313.0, 'dry', true, true),
('Eukanuba', 'Adult Small Breed Dry Dog Food', 392.0, 'dry', true, true),

-- Natural Balance (4 products)
('Natural Balance', 'L.I.D. Sweet Potato & Chicken', 380.0, 'dry', true, true),
('Natural Balance', 'L.I.D. Sweet Potato & Fish', 370.0, 'dry', true, true),
('Natural Balance', 'Fat Dogs Low Calorie Dry Formula', 279.0, 'dry', true, true),
('Natural Balance', 'L.I.D. Chicken & Sweet Potato (Wet)', 295.0, 'wet', true, true),

-- Fromm (4 products)
('Fromm', 'Four-Star Grain-Free Game Bird Recipe', 410.0, 'dry', true, true),
('Fromm', 'Gold Adult Dry Dog Food', 387.0, 'dry', true, true),
('Fromm', 'Gold Weight Management', 341.0, 'dry', true, true),
('Fromm', 'Four-Star Shredded Chicken Entree (Wet)', 310.0, 'wet', true, true),

-- Rachael Ray Nutrish (4 products)
('Rachael Ray Nutrish', 'Real Chicken & Veggies Recipe', 349.0, 'dry', true, true),
('Rachael Ray Nutrish', 'PEAK Open Prairie Recipe', 398.0, 'dry', true, true),
('Rachael Ray Nutrish', 'Just 6 Lamb Meal & Brown Rice', 336.0, 'dry', true, true),
('Rachael Ray Nutrish', 'Hearty Recipes Chicken Paw Pie (Wet)', 268.0, 'wet', true, true),

-- Diamond Naturals (4 products)
('Diamond Naturals', 'Adult Chicken & Rice Formula', 368.0, 'dry', true, true),
('Diamond Naturals', 'All Life Stages Chicken & Rice', 379.0, 'dry', true, true),
('Diamond Naturals', 'Lite Lamb Meal & Rice Formula', 308.0, 'dry', true, true),
('Diamond Naturals', 'Large Breed Adult Lamb & Rice', 355.0, 'dry', true, true),

-- Canidae (4 products)
('Canidae', 'PURE Real Salmon & Sweet Potato', 399.0, 'dry', true, true),
('Canidae', 'All Life Stages Multi-Protein Formula', 389.0, 'dry', true, true),
('Canidae', 'PURE Healthy Weight Real Chicken', 340.0, 'dry', true, true),
('Canidae', 'PURE Foundations Puppy Formula', 415.0, 'dry', true, true),

-- Nulo (4 products)
('Nulo', 'Freestyle Adult Turkey & Sweet Potato', 407.0, 'dry', true, true),
('Nulo', 'Freestyle Adult Salmon & Peas', 415.0, 'dry', true, true),
('Nulo', 'Freestyle Adult Trim Cod & Lentils', 339.0, 'dry', true, true),
('Nulo', 'Freestyle Turkey, Cod & Sweet Potato Stew (Wet)', 312.0, 'wet', true, true),

-- Open Farm (4 products)
('Open Farm', 'Homestead Turkey & Chicken Dry Dog Food', 402.0, 'dry', true, true),
('Open Farm', 'Catch-of-the-Season Whitefish Dry Dog Food', 389.0, 'dry', true, true),
('Open Farm', 'Grass-Fed Beef Rustic Stew (Wet)', 315.0, 'wet', true, true),
('Open Farm', 'RawMix Front Range Recipe', 438.0, 'dry', true, true),

-- Instinct (4 products)
('Instinct', 'Original Grain-Free Chicken Recipe', 445.0, 'dry', true, true),
('Instinct', 'Raw Boost Whole Grain Real Chicken', 421.0, 'dry', true, true),
('Instinct', 'Healthy Weight Grain-Free Chicken', 368.0, 'dry', true, true),
('Instinct', 'Original Real Chicken Recipe (Wet)', 332.0, 'wet', true, true);
