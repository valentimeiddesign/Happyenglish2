-- Reviews / testimonials — applied to project mpyrezevqoynwcpejgzt.
-- Reference copy of the schema that powers the site's "Відгуки" section
-- and the admin Reviews page. Images are stored in the public `testimonials`
-- storage bucket; only admins can write.

create type public.testimonial_type as enum ('image','text');

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  type public.testimonial_type not null default 'text',
  author_name text,
  author_role text,
  avatar_url text,
  image_url text,
  rating integer check (rating between 1 and 5),
  text text,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_testimonials_pub on public.testimonials (is_published, sort_order);

create trigger trg_testimonials_updated
  before update on public.testimonials
  for each row execute function public.set_updated_at();

alter table public.testimonials enable row level security;

create policy testimonials_public_read on public.testimonials
  for select using (is_published = true);
create policy testimonials_admin_read on public.testimonials
  for select using (public.is_admin());
create policy testimonials_admin_write on public.testimonials
  for all using (public.is_admin()) with check (public.is_admin());

-- Public storage bucket for review images
insert into storage.buckets (id, name, public)
values ('testimonials', 'testimonials', true)
on conflict (id) do nothing;

create policy testi_obj_public_read on storage.objects
  for select using (bucket_id = 'testimonials');
create policy testi_obj_admin_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'testimonials' and public.is_admin());
create policy testi_obj_admin_update on storage.objects
  for update to authenticated using (bucket_id = 'testimonials' and public.is_admin());
create policy testi_obj_admin_delete on storage.objects
  for delete to authenticated using (bucket_id = 'testimonials' and public.is_admin());
