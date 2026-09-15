-- Libia Beauty Salon · esquema completo e idempotente. No borra historial.
create extension if not exists pgcrypto;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(), name text not null, phone text not null,
  referral_code text not null default upper(substr(md5(random()::text || clock_timestamp()::text),1,8)),
  source text not null default 'direct', referred_by uuid, created_at timestamptz not null default now()
);
alter table public.clients add column if not exists referral_code text;
alter table public.clients add column if not exists source text not null default 'direct';
alter table public.clients add column if not exists referred_by uuid;
alter table public.clients add column if not exists created_at timestamptz not null default now();
update public.clients set referral_code=upper(substr(md5(id::text || random()::text),1,8)) where referral_code is null or referral_code='';
create unique index if not exists clients_phone_unique on public.clients(phone);
create unique index if not exists clients_referral_code_unique on public.clients(referral_code);
create index if not exists clients_name_search on public.clients(lower(name));

create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id) on delete restrict,
  service text not null default 'Visita', registered_by text not null default 'counter', created_at timestamptz not null default now()
);
create index if not exists visits_client_created on public.visits(client_id,created_at);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(), referrer_id uuid not null references public.clients(id) on delete restrict,
  referred_client_id uuid not null references public.clients(id) on delete restrict,
  first_visit_completed boolean not null default false, discount_redeemed boolean not null default false,
  discount_redeemed_at timestamptz, qualifying_service text,
  referral_points numeric(2,1) not null default 0 check (referral_points between 0 and 1),
  created_at timestamptz not null default now(),
  constraint referrals_different_clients check (referrer_id <> referred_client_id),
  constraint referrals_one_referrer_per_client unique (referred_client_id)
);
create index if not exists referrals_referrer on public.referrals(referrer_id);

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id) on delete restrict,
  reward_type text not null check (reward_type in ('visit_color','referral_color')),
  status text not null default 'available' check (status in ('available','redeemed')),
  earned_at timestamptz not null default now(), redeemed_at timestamptz
);
create index if not exists rewards_client_status on public.rewards(client_id,reward_type,status);

create table if not exists public.loyalty_events (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id) on delete restrict,
  event_type text not null, points numeric(3,1) not null default 0,
  related_client_id uuid references public.clients(id) on delete restrict, service text, created_at timestamptz not null default now()
);
create index if not exists loyalty_events_client_created on public.loyalty_events(client_id,created_at);

create table if not exists public.salon_config (
  id integer primary key default 1 check (id=1),
  visit_text text not null default 'Completa 5 visitas y disfruta un tratamiento de color de cortesía.',
  ref_text text not null default 'Cada amiga que nos visite te acerca a tu próxima recompensa.',
  ref_reward text not null default '5 puntos de referidos = regalo especial',
  booking_label text not null default 'Agendar cita por WhatsApp',
  booking_url text not null default 'https://wa.me/13474727477?text=Hola%20Libia%20Beauty%20Salon%2C%20quisiera%20agendar%20una%20cita.',
  contact_label text not null default 'Contacto', contact_url text not null default 'tel:+13474727477',
  updated_at timestamptz not null default now()
);
insert into public.salon_config(id) values(1) on conflict(id) do nothing;

-- Solo las rutas server-side con service role acceden a los datos.
alter table public.clients enable row level security;
alter table public.visits enable row level security;
alter table public.referrals enable row level security;
alter table public.rewards enable row level security;
alter table public.loyalty_events enable row level security;
alter table public.salon_config enable row level security;
notify pgrst, 'reload schema';
