import { supabase } from '../supabase.js';

export async function fetchPublishedLetters() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('letters')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function fetchAllLetters() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('letters')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function createLetter(letterData) {
    const { data, error } = await supabase.from('letters').insert([letterData]).select();
    if (error) throw error;
    return data[0];
}

export async function updateLetter(id, letterData) {
    const { data, error } = await supabase.from('letters').update(letterData).eq('id', id).select();
    if (error) throw error;
    return data[0];
}

export async function deleteLetter(id) {
    const { error } = await supabase.from('letters').delete().eq('id', id);
    if (error) throw error;
}
