-- Supabase init SQL for MunchiesOrder
-- Paste this into Supabase SQL editor (or run via psql). It creates all tables and basic indexes.
-- Note: This mirrors the Drizzle schema (types/defaults). Foreign keys are included for data integrity.

set search_path to public;

-- sessions
create table if not exists sessions (
  sid varchar primary key,
  sess jsonb not null,
  expire timestamp not null
);
create index if not exists "IDX_session_expire" on sessions(expire);

-- users
create table if not exists users (
  id varchar primary key,
  username varchar unique not null,
  email varchar unique not null,
  password varchar not null,
  first_name varchar,
  last_name varchar,
  profile_image_url varchar,
  phone varchar,
  role varchar not null default 'student',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- addresses
create table if not exists addresses (
  id serial primary key,
  user_id varchar not null references users(id) on delete cascade,
  title varchar not null,
  address_line_1 text not null,
  address_line_2 text,
  city varchar not null default 'Kalkanlı',
  country varchar not null default 'TRNC',
  is_default boolean default false,
  created_at timestamp default now()
);

-- restaurants
create table if not exists restaurants (
  id serial primary key,
  owner_id varchar not null references users(id) on delete cascade,
  name varchar not null,
  description text,
  cuisine varchar not null,
  address text,
  phone varchar,
  opening_hours varchar not null default '9:00-22:00',
  delivery_radius integer not null default 5,
  image_url text,
  rating numeric(3,2) default '0',
  review_count integer default 0,
  delivery_time varchar not null,
  delivery_fee numeric(8,2) not null,
  minimum_order numeric(8,2) default '0',
  is_active boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- couriers
create table if not exists couriers (
  id serial primary key,
  user_id varchar not null references users(id) on delete cascade,
  vehicle_type varchar not null,
  license_plate varchar,
  phone_number varchar not null,
  is_available boolean default true,
  current_latitude numeric(10,8),
  current_longitude numeric(11,8),
  delivery_radius integer not null default 5,
  rating numeric(3,2) default '5.0',
  total_deliveries integer default 0,
  is_online boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- courier_restaurant_assignments
create table if not exists courier_restaurant_assignments (
  id serial primary key,
  courier_id integer not null references couriers(id) on delete cascade,
  restaurant_id integer not null references restaurants(id) on delete cascade,
  assigned_at timestamp default now(),
  is_active boolean default true
);

-- menu_categories
create table if not exists menu_categories (
  id serial primary key,
  restaurant_id integer not null references restaurants(id) on delete cascade,
  name varchar not null,
  display_order integer default 0,
  is_active boolean default true
);

-- menu_items
create table if not exists menu_items (
  id serial primary key,
  restaurant_id integer not null references restaurants(id) on delete cascade,
  category_id integer references menu_categories(id) on delete set null,
  name varchar not null,
  description text,
  price numeric(8,2) not null,
  image_url text,
  is_available boolean default true,
  is_popular boolean default false,
  created_at timestamp default now()
);

-- orders
create table if not exists orders (
  id serial primary key,
  user_id varchar not null references users(id) on delete cascade,
  restaurant_id integer not null references restaurants(id) on delete cascade,
  address_id integer not null references addresses(id) on delete restrict,
  status varchar not null default 'pending',
  subtotal numeric(8,2) not null,
  delivery_fee numeric(8,2) not null,
  service_fee numeric(8,2) default '0',
  total numeric(8,2) not null,
  payment_method varchar not null,
  payment_status varchar not null default 'pending',
  iyzico_payment_id varchar,
  iyzico_conversation_id varchar,
  special_instructions text,
  estimated_delivery_time timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- order_items
create table if not exists order_items (
  id serial primary key,
  order_id integer not null references orders(id) on delete cascade,
  menu_item_id integer not null references menu_items(id) on delete restrict,
  quantity integer not null,
  price numeric(8,2) not null,
  notes text
);

-- cart_items
create table if not exists cart_items (
  id serial primary key,
  user_id varchar not null references users(id) on delete cascade,
  restaurant_id integer not null references restaurants(id) on delete cascade,
  menu_item_id integer not null references menu_items(id) on delete cascade,
  quantity integer not null,
  created_at timestamp default now()
);

-- courier_assignments (user-based)
create table if not exists courier_assignments (
  id serial primary key,
  courier_id varchar not null references users(id) on delete cascade,
  restaurant_id integer not null references restaurants(id) on delete cascade,
  is_active boolean default true,
  assigned_at timestamp default now()
);

-- courier_locations (user-based)
create table if not exists courier_locations (
  id serial primary key,
  courier_id varchar not null references users(id) on delete cascade,
  latitude numeric(10,8),
  longitude numeric(11,8),
  last_updated timestamp default now()
);

-- reviews
create table if not exists reviews (
  id serial primary key,
  user_id varchar not null references users(id) on delete cascade,
  restaurant_id integer not null references restaurants(id) on delete cascade,
  order_id integer references orders(id) on delete set null,
  rating integer not null,
  comment text,
  created_at timestamp default now()
);

-- security_logs
create table if not exists security_logs (
  id serial primary key,
  user_id varchar references users(id) on delete set null,
  event varchar not null,
  ip_address varchar,
  user_agent text,
  details jsonb,
  created_at timestamp default now()
);

-- helpful indexes
create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_orders_restaurant on orders(restaurant_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_menu_items_restaurant on menu_items(restaurant_id);
create index if not exists idx_cart_items_user on cart_items(user_id);
create index if not exists idx_reviews_restaurant on reviews(restaurant_id);

-- done