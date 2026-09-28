import { supabase } from '../supabase.js';

export async function fetchApprovedGuestbookEntries() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('guestbook_entries')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching guestbook:', error);
        return [];
    }
    return data;
}

export async function fetchAllGuestbookEntries() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('guestbook_entries')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function createGuestbookEntry(entryData) {
    const { data, error } = await supabase.from('guestbook_entries').insert([{...entryData, approved: false}]).select();
    if (error) throw error;
    return data[0];
}

export async function updateGuestbookEntry(id, entryData) {
    const { data, error } = await supabase.from('guestbook_entries').update(entryData).eq('id', id).select();
    if (error) throw error;
    return data[0];
}

export async function deleteGuestbookEntry(id) {
    const { error } = await supabase.from('guestbook_entries').delete().eq('id', id);
    if (error) throw error;
}
