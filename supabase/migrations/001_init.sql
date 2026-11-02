-- Menu MPASI Personal 30 Hari — skema awal
-- Jalankan di Supabase Dashboard → SQL Editor → New query → Run.

create extension if not exists pgcrypto;

-- Satu baris per keluarga/anak yang membeli (pemegang akses)
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  access_token text not null unique,
  wa text not null,
  email text,
  child_name text not null,
  answers jsonb not null,
  package text not null default 'dasar' check (package in ('dasar','lengkap','tigabulan')),
  snack_plus boolean not null default false,
  paid boolean not null default false,
  plans jsonb not null default '[]'::jsonb,   -- array Plan (bulan 1..3)
  swaps_used int not null default 0,
  favorites text[] not null default '{}',
  consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Satu baris per transaksi QRIS (pembelian pertama, upsell, perpanjangan)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  customer_id uuid not null references public.customers(id) on delete cascade,
  kind text not null check (kind in ('main','upsell','renewal')),
  package text not null,
  bump boolean not null default false,
  amount int not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending','paid','expired','failed','refunded')),
  payment_id text,
  payment_url text,
  paid_at timestamptz,
  utm jsonb not null default '{}'::jsonb,
  fbp text,
  fbc text,
  client_ip text,
  user_agent text,
  meta_sent boolean not null default false,
  raw_webhook jsonb,
  created_at timestamptz not null default now()
);

create index if not exists orders_customer_idx on public.orders(customer_id);
create index if not exists orders_status_idx on public.orders(status, created_at desc);

-- RLS aktif tanpa policy publik: semua akses lewat server (secret key).
alter table public.customers enable row level security;
alter table public.orders enable row level security;

-- Ringkasan harian untuk dashboard (dibaca dari Table Editor / SQL)
create or replace view public.daily_sales with (security_invoker = true) as
select date_trunc('day', paid_at at time zone 'Asia/Jakarta') as day,
       count(*) filter (where kind = 'main') as pembeli_baru,
       count(*) filter (where kind = 'upsell') as upsell,
       count(*) filter (where kind = 'renewal') as perpanjangan,
       count(*) filter (where bump) as order_bump,
       sum(amount) as pendapatan
from public.orders
where status = 'paid'
group by 1
order by 1 desc;
