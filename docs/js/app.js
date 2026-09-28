import { config } from './config.js';
import { supabase } from './supabase.js';
import { fetchPublishedLetters } from './api/letters.api.js';
import { fetchPublishedGalleryItems } from './api/gallery.api.js';
import { fetchPublishedVouchers } from './api/vouchers.api.js';
import { fetchPublicSettings } from './api/settings.api.js';
import { initCandles } from './candles.js';
import { initBalloons } from './balloons.js';
import { initGift } from './gift.js';
import { renderGallery } from './gallery.js';
import { renderLetters } from './letters.js';
import { renderVouchers } from './vouchers.js';
import { applySettings } from './settings.js';
import { initShare } from './share.js';
import { initFloatingFlowers } from './flowers.js';
import { initMusicPlayer } from './music.js';

async function init() {
    // 1. Fetch settings or fallback
    let settings = {};
    if (supabase) {
        try {
            settings = await fetchPublicSettings();
        } catch (error) {
            console.warn('Could not load site settings; using defaults.', error);
        }
    }
    
    // Apply defaults if missing
    if (!settings.public_theme) settings.public_theme = config.DEFAULT_THEME;
    const currentRecipient = String(settings.public_recipient_name || '').replace(/^['"]|['"]$/g, '').trim();
    if (!currentRecipient || /^(our dear friend|friend|test(?:ing)?)$/i.test(currentRecipient)) {
        settings.public_recipient_name = config.DEFAULT_RECIPIENT_NAME;
    }
    
    applySettings(settings);

    // 2. Initialize interactive features
    initCandles();
    initBalloons();
    initGift();
    initShare();
    initFloatingFlowers();
    initMusicPlayer();
    initNavigation();

    // 3. Fetch data (Letters, Gallery, Vouchers)
    if (supabase) {
        try {
            const [letters, gallery, vouchers] = await Promise.all([
                fetchPublishedLetters(),
                fetchPublishedGalleryItems(),
                fetchPublishedVouchers()
            ]);
            
            renderLetters(letters);
            renderGallery(gallery);
            renderVouchers(vouchers);
        } catch (e) {
            console.error("Error fetching data, using fallback", e);
            loadFallback();
        }
    } else {
        loadFallback();
    }
    
}

function initNavigation() {
    const pages = document.querySelectorAll('.page-section');
    let currentIndex = 0;

    function showPage(index) {
        pages.forEach((page, i) => {
            if (i === index) {
                page.classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                page.classList.remove('active');
            }
        });
    }

    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentIndex < pages.length - 1) {
                currentIndex++;
                showPage(currentIndex);
            }
        });
    });

    document.querySelectorAll('.prev-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                showPage(currentIndex);
            }
        });
    });
}

async function loadFallback() {
    try {
        const res = await fetch('data/fallback-content.json');
        if (!res.ok) throw new Error(`Fallback content request failed (${res.status})`);
        const data = await res.json();
        renderLetters(data.letters || []);
        renderGallery(data.gallery || []);
        renderVouchers(data.vouchers || []);
    } catch (e) {
        console.error("Fallback load failed", e);
    }
}

document.addEventListener('DOMContentLoaded', init);
