import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase =
    supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey)
        : {
              auth: {
                  signInWithOAuth: async () => ({
                      error: new Error(
                          'Supabase belum dikonfigurasi. Set VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.',
                      ),
                  }),
                  getSessionFromUrl: async () => ({
                      data: null,
                      error: new Error(
                          'Supabase belum dikonfigurasi. Set VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.',
                      ),
                  }),
              },
          };

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        'Supabase tidak dikonfigurasi. Tambahkan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY ke .env Anda.',
    );
}

export { supabase };
