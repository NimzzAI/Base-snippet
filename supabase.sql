-- Jalankan sekali di SQL Editor Supabase
create table if not exists nimzz_kv (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Tabel hanya diakses lewat service role dari server
alter table nimzz_kv enable row level security;
