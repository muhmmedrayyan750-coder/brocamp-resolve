-- ==========================================
-- BROCAMP SUPPORT - DATABASE SETUP
-- Run this SQL in your Supabase SQL Editor
-- ==========================================

-- Create enum for user roles
create type public.app_role as enum ('admin', 'student');

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Create security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- RLS policies for user_roles
create policy "Users can view their own roles"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own roles during signup"
  on public.user_roles for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Create categories table
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz default now()
);

alter table public.categories enable row level security;

create policy "Anyone can view categories"
  on public.categories for select to authenticated using (true);

create policy "Admins can manage categories"
  on public.categories for all to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Insert default categories
insert into public.categories (name, description) values
  ('Technical Issue', 'Problems with software, hardware, or technical systems'),
  ('Academic', 'Issues related to courses, assignments, or academic matters'),
  ('Facilities', 'Problems with campus facilities, infrastructure, or equipment'),
  ('Administrative', 'Administrative or procedural issues'),
  ('Other', 'Other complaints that don''t fit into above categories');

-- Create complaints table
create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  description text not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'resolved')),
  admin_comment text,
  attachment_url text,
  audio_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.complaints enable row level security;

create policy "Students can view their own complaints"
  on public.complaints for select to authenticated
  using (auth.uid() = student_id);

create policy "Students can create complaints"
  on public.complaints for insert to authenticated
  with check (auth.uid() = student_id and public.has_role(auth.uid(), 'student'));

create policy "Admins can view all complaints"
  on public.complaints for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update complaints"
  on public.complaints for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Create messages table for chat
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid references public.complaints(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

create policy "Users can view messages for their complaints"
  on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.complaints
      where id = complaint_id
      and (student_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
  );

create policy "Users can send messages for their complaints"
  on public.messages for insert to authenticated
  with check (
    exists (
      select 1 from public.complaints
      where id = complaint_id
      and (student_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
  );

-- Create notifications table
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  complaint_id uuid references public.complaints(id) on delete cascade,
  type text not null,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on public.notifications for update to authenticated
  using (auth.uid() = user_id);

create policy "System can create notifications"
  on public.notifications for insert to authenticated
  with check (true);

-- Create trigger function for profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger handle_complaints_updated_at
  before update on public.complaints
  for each row execute function public.handle_updated_at();

-- Create storage bucket for complaint attachments
insert into storage.buckets (id, name, public)
values ('complaint-attachments', 'complaint-attachments', true)
on conflict (id) do nothing;

-- Storage policies for complaint attachments
create policy "Students can upload their own attachments"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'complaint-attachments' and
    public.has_role(auth.uid(), 'student')
  );

create policy "Anyone authenticated can view attachments"
  on storage.objects for select to authenticated
  using (bucket_id = 'complaint-attachments');

create policy "Students can update their own attachments"
  on storage.objects for update to authenticated
  using (bucket_id = 'complaint-attachments' and public.has_role(auth.uid(), 'student'));

create policy "Students can delete their own attachments"
  on storage.objects for delete to authenticated
  using (bucket_id = 'complaint-attachments' and public.has_role(auth.uid(), 'student'));

-- ==========================================
-- SETUP COMPLETE!
-- ==========================================
-- Next steps:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Paste and run this entire script
-- 3. Test login with:
--    Student: any email/password (will auto-create)
--    Admin: any email/password (will auto-create)
-- 4. The app will assign roles based on which tab you use to login
-- ==========================================
