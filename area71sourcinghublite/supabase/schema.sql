create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  role text not null check (role in ('Owner', 'Operations', 'Sourcing', 'Client', 'Supplier')),
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_person text,
  email text,
  phone text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_person text,
  email text,
  phone text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  product_name text not null,
  sku text,
  description text,
  client_id uuid not null references public.clients(id),
  supplier_id uuid not null references public.suppliers(id),
  sourcing_user_id uuid references public.profiles(id),
  min_order_quantity numeric(18,2) not null default 0,
  actual_quantity numeric(18,2) not null default 0,
  currency text not null default 'USD',
  client_unit_price numeric(18,2) not null default 0,
  supplier_unit_price numeric(18,2) not null default 0,
  approved boolean default false,
  status text not null default 'Awaiting approval',
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  type text not null check (type in ('clientCollection', 'supplierPayment')),
  amount numeric(18,2) not null default 0,
  currency text not null default 'USD',
  payment_date date not null,
  reference text,
  note text,
  author text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.confirmations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  party text not null check (party in ('client', 'supplier')),
  amount numeric(18,2) not null default 0,
  currency text not null default 'USD',
  payment_date date not null,
  reference text,
  note text,
  status text not null default 'Awaiting matching',
  author text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  role text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  action text not null,
  details text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.suppliers enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.confirmations enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_log enable row level security;

create policy "Profiles are readable by authenticated users" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "Clients are readable by authenticated users" on public.clients
  for select using (auth.role() = 'authenticated');

create policy "Suppliers are readable by authenticated users" on public.suppliers
  for select using (auth.role() = 'authenticated');

create policy "Orders are readable by authenticated users" on public.orders
  for select using (auth.role() = 'authenticated');

create policy "Payments are readable by authenticated users" on public.payments
  for select using (auth.role() = 'authenticated');

create policy "Confirmations are readable by authenticated users" on public.confirmations
  for select using (auth.role() = 'authenticated');

create policy "Notifications are readable by authenticated users" on public.notifications
  for select using (auth.role() = 'authenticated');

create policy "Activity log is readable by authenticated users" on public.activity_log
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert profiles" on public.profiles
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can insert clients" on public.clients
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can insert suppliers" on public.suppliers
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can insert orders" on public.orders
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can insert payments" on public.payments
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can insert confirmations" on public.confirmations
  for insert with check (auth.role() = 'authenticated');
