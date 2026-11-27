-- ============================================================
-- えぬﾀﾝｺ公式サイト 管理画面用 Supabase セットアップ
-- Supabase の SQL Editor に「まるごと貼って Run」してください(何回実行してもOK)。
-- 最後の「合言葉」の行だけ、好きな言葉に書き換えてから実行します。
-- ============================================================

-- 1) データ置き場(お知らせ・配信予定・曲リスト など)
create table if not exists enu_kv(
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- 2) 受信箱(匿名メッセージ・お問い合わせ・曲のリクエスト)
create table if not exists enu_inbox(
  id bigserial primary key,
  kind text not null check (kind in ('message','contact','request')),
  name text,
  contact text,
  body text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3) 合言葉(1行だけ)
create table if not exists enu_secret(
  id int primary key default 1 check (id = 1),
  pass text not null
);

-- テーブルは直接さわれないようにして、下の関数だけを通す
alter table enu_kv enable row level security;
alter table enu_inbox enable row level security;
alter table enu_secret enable row level security;

-- 合言葉チェック(内部用)
create or replace function enu__auth(p text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p is null or not exists (select 1 from enu_secret where pass = p) then
    raise exception 'auth';
  end if;
end $$;
revoke all on function enu__auth(text) from public, anon, authenticated;

-- サイトが読み込む(だれでも読める)
create or replace function enu_get() returns jsonb
language sql security definer set search_path = public as $$
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb) from enu_kv
$$;

-- 管理画面: 保存・もとに戻す
create or replace function enu_admin(p_pass text, p_action text, p_key text default null, p_data jsonb default null)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform enu__auth(p_pass);
  if p_action = 'get' then
    return enu_get();
  end if;
  if p_key is null or p_key not in ('news','schedule','archive','songs','works','videos','profile') then
    raise exception 'bad key';
  end if;
  if p_action = 'save' then
    if p_data is null or length(p_data::text) > 200000 then raise exception 'too big'; end if;
    insert into enu_kv(key, value, updated_at) values (p_key, p_data, now())
      on conflict (key) do update set value = excluded.value, updated_at = now();
  elsif p_action = 'reset' then
    delete from enu_kv where key = p_key;
  else
    raise exception 'bad action';
  end if;
  return enu_get();
end $$;

-- サイトから送信(メッセージ・お問い合わせ・リクエスト)
create or replace function enu_send(p_kind text, p_name text default null, p_contact text default null, p_body text default null)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if p_kind not in ('message','contact','request') then raise exception 'bad kind'; end if;
  if p_body is null or length(btrim(p_body)) = 0 or length(p_body) > 1000 then raise exception 'bad body'; end if;
  if length(coalesce(p_name,'')) > 60 or length(coalesce(p_contact,'')) > 120 then raise exception 'too long'; end if;
  -- 連投よけ(10分に40件まで)
  if (select count(*) from enu_inbox where created_at > now() - interval '10 minutes') >= 40 then
    raise exception 'busy';
  end if;
  insert into enu_inbox(kind, name, contact, body) values (p_kind, nullif(btrim(p_name),''), nullif(btrim(p_contact),''), btrim(p_body));
  return true;
end $$;

-- 管理画面: 受信箱の一覧・済み・消す
create or replace function enu_inbox_admin(p_pass text, p_action text, p_id bigint default null, p_value boolean default null)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform enu__auth(p_pass);
  if p_action = 'done' then
    update enu_inbox set done = coalesce(p_value, true) where id = p_id;
  elsif p_action = 'delete' then
    delete from enu_inbox where id = p_id;
  elsif p_action = 'clear_done' then
    delete from enu_inbox where done;
  elsif p_action <> 'list' then
    raise exception 'bad action';
  end if;
  return coalesce((select jsonb_agg(to_jsonb(t) order by t.created_at desc)
    from (select id, kind, name, contact, body, done, created_at from enu_inbox order by created_at desc limit 300) t), '[]'::jsonb);
end $$;

-- だれが呼べるか
grant execute on function enu_get() to anon, authenticated;
grant execute on function enu_admin(text,text,text,jsonb) to anon, authenticated;
grant execute on function enu_send(text,text,text,text) to anon, authenticated;
grant execute on function enu_inbox_admin(text,text,bigint,boolean) to anon, authenticated;

-- ============================================================
-- ★合言葉(ここを書き換えて Run)。管理画面にはこれを入れます。
-- 変えたいときは、この行だけ書き換えてもう一度 Run すればOK。
-- ============================================================
insert into enu_secret(id, pass) values (1, 'ここに合言葉')
  on conflict (id) do update set pass = excluded.pass;
