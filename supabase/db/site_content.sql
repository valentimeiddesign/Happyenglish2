-- Editable site content — applied to project mpyrezevqoynwcpejgzt.
-- Key/JSONB store that powers the landing page texts (Hero, Statistics,
-- contacts/footer) and SEO. Public read; only admins can write.
-- Seeded keys: seo, hero, stats, contacts (see the admin "Контент сайту" page).

create table public.site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create trigger trg_site_content_updated
  before update on public.site_content
  for each row execute function public.set_updated_at();

alter table public.site_content enable row level security;

create policy site_content_public_read on public.site_content
  for select using (true);
create policy site_content_admin_write on public.site_content
  for all using (public.is_admin()) with check (public.is_admin());
