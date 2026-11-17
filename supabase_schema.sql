create table if not exists public.votes (
  id bigint generated always as identity primary key,
  voter_id text not null,
  category text not null,
  nominee text not null,
  created_at timestamptz not null default now(),
  constraint one_vote_per_browser_per_category unique (voter_id, category)
);

alter table public.votes enable row level security;

-- Клиентам запрещён прямой доступ. Netlify Functions используют service role key
-- только на сервере и проверяют допустимые номинации.
revoke all on public.votes from anon, authenticated;
