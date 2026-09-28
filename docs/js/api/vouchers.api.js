import { supabase } from '../supabase.js';

export async function fetchPublishedVouchers() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function fetchAllVouchers() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function createVoucher(voucherData) {
    const { data, error } = await supabase.from('vouchers').insert([voucherData]).select();
    if (error) throw error;
    return data[0];
}

export async function updateVoucher(id, voucherData) {
    const { data, error } = await supabase.from('vouchers').update(voucherData).eq('id', id).select();
    if (error) throw error;
    return data[0];
}

export async function deleteVoucher(id) {
    const { error } = await supabase.from('vouchers').delete().eq('id', id);
    if (error) throw error;
}
