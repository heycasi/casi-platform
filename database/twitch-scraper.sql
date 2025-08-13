-- Table to store discovered Twitch streamer metadata
create table if not exists twitch_streamers (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  login text not null,
  display_name text,
  game_id text,
  game_name text,
  description text,
  email text,
  current_viewer_count integer,
  avg_viewer_count integer,
  last_seen_at timestamptz default now(),
  created_at timestamptz default now()
);

create unique index if not exists ux_twitch_streamers_user on twitch_streamers(user_id);


