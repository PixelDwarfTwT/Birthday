import { supabase } from '../supabase.js';

export async function fetchPublishedGalleryItems() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function fetchAllGalleryItems() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function createGalleryItem(itemData, file) {
    if (!supabase) throw new Error("Supabase not initialized");
    
    let storagePath = itemData.storage_path;
    
    if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from('gallery')
            .upload(fileName, file);
        if (uploadError) throw uploadError;
        storagePath = fileName;
    }

    const { data, error } = await supabase.from('gallery_items').insert([{...itemData, storage_path: storagePath}]).select();
    
    // Cleanup storage on db failure
    if (error && file) {
        await supabase.storage.from('gallery').remove([storagePath]);
        throw error;
    }
    
    return data[0];
}

export async function updateGalleryItem(id, itemData) {
    const { data, error } = await supabase.from('gallery_items').update(itemData).eq('id', id).select();
    if (error) throw error;
    return data[0];
}

export async function deleteGalleryItem(id, storagePath) {
    const { error: dbError } = await supabase.from('gallery_items').delete().eq('id', id);
    if (dbError) throw dbError;
    
    if (storagePath) {
        const { error: storageError } = await supabase.storage.from('gallery').remove([storagePath]);
        if (storageError) console.error("Warning: Failed to delete image from storage:", storageError);
    }
}

export function getImageUrl(storagePath) {
    if (!supabase) return '';
    const { data } = supabase.storage.from('gallery').getPublicUrl(storagePath);
    return data.publicUrl;
}
