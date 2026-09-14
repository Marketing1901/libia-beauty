-- Run once in Supabase SQL Editor before testing V5.
create table if not exists public.salon_config (
  id integer primary key default 1 check (id = 1),
  visit_text text not null default 'Completa 5 visitas y disfruta un tratamiento de color de cortesía.',
  ref_text text not null default 'Cada amiga que nos visite te acerca a tu próxima recompensa.',
  ref_reward text not null default '5 referidos → regalo especial',
  booking_label text not null default 'Agendar cita por WhatsApp',
  booking_url text not null default 'https://wa.me/13474727477?text=Hola%20Libia%20Beauty%20Salon%2C%20quisiera%20agendar%20una%20cita.',
  contact_label text not null default 'Contáctanos',
  contact_url text not null default 'tel:+13474727477',
  updated_at timestamptz not null default now()
);
insert into public.salon_config (id) values (1) on conflict (id) do nothing;
alter table public.salon_config enable row level security;
