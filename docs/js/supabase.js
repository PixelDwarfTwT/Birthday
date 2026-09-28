import { config } from './config.js';

// We assume supabase is loaded via CDN in index.html
// e.g. <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// This module exports the initialized client.

if (!window.supabase) {
    console.error("Supabase library is not loaded. Please ensure the CDN script is included.");
}

export const supabase = window.supabase ? window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY) : null;
