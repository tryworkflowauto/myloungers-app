import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
const get = (k) => {
  const line = env.split('\n').find(l => l.startsWith(k + '='));
  if (!line) return null;
  return line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
};

const url = get('NEXT_PUBLIC_SUPABASE_URL');
const key = get('SUPABASE_SERVICE_ROLE_KEY');
const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const USER_ID = 'cc1bebba-7972-42bb-9a36-de90267561bf';
const PASSWORD = '12345678';

const { data, error } = await admin.auth.admin.updateUserById(USER_ID, { password: PASSWORD, email_confirm: true });
if (error) { console.error('Guncelleme hatasi:', error.message); process.exit(1); }
console.log('BASARILI: ' + (data?.user?.email ?? USER_ID) + ' sifresi guncellendi -> ' + PASSWORD);
