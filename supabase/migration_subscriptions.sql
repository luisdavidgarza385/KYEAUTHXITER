alter table admin_users add column if not exists subscription_end timestamptz;
alter table admin_users add column if not exists subscription_app_id uuid references applications(id) on delete set null;
alter table admin_users add column if not exists seller_label text default 'keyauthpro';
