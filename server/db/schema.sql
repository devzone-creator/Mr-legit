create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  full_name text not null,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id serial primary key,
  name text not null unique,
  slug text not null unique check (slug in ('apples', 'oraimo', 'men-wear'))
);

create table if not exists products (
  id serial primary key,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  original_price numeric(10,2) check (original_price >= 0),
  image_url text,
  rating numeric(2,1) not null default 0 check (rating >= 0 and rating <= 5),
  review_count int not null default 0 check (review_count >= 0),
  discount int not null default 0 check (discount >= 0 and discount <= 100),
  is_new boolean not null default false,
  brand text,
  colors text[],
  sizes text[],
  is_active boolean not null default true,
  category_id int not null references categories(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount numeric(10,2) not null check (total_amount >= 0),
  phone_number text not null,
  delivery_address text not null,
  delivery_region text not null check (delivery_region in ('Northern', 'Upper East', 'Upper West', 'North East', 'Savannah')),
  delivery_notes text,
  payment_method text not null check (payment_method in ('stripe', 'momo')),
  payment_reference text,
  created_at timestamptz not null default now()
);

create table if not exists order_notifications (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id serial primary key,
  order_id uuid not null references orders(id) on delete cascade,
  product_id int not null references products(id) on delete restrict,
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0)
);