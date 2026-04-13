-- Run this in your Supabase SQL editor (Database → SQL Editor)

create table if not exists jobs (
  id                      uuid primary key default gen_random_uuid(),
  status                  text not null default 'pending',

  heygen_preview_video_id text,
  heygen_full_video_id    text,
  preview_url             text,
  full_video_url          text,

  elevenlabs_voice_id     text,
  audio_url               text,

  photo_url               text,

  paid                    boolean default false,
  paid_at                 timestamptz,
  stripe_session_id       text,

  email                   text,
  error_message           text,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

-- Auto-update updated_at on row changes
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger jobs_updated_at
  before update on jobs
  for each row execute function update_updated_at_column();

-- Disable RLS for MVP (jobs accessed via service role key only)
alter table jobs disable row level security;
