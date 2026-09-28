import { supabase } from '../supabase.js';

export async function fetchPublicSettings() {
    if (!supabase) return {};
    const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .like('key', 'public_%');

    if (error) {
        console.error('Error fetching settings:', error);
        return {};
    }
    
    const settings = {};
    (data || []).forEach(item => {
        settings[item.key] = item.value;
    });
    return settings;
}

export async function updateSetting(key, value) {
    const { data, error } = await supabase.from('site_settings').upsert({ key, value }).select();
    if (error) throw error;
    return data[0];
}
