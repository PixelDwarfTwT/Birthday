import { supabase } from '../js/supabase.js';
import * as lettersApi from '../js/api/letters.api.js';
import * as galleryApi from '../js/api/gallery.api.js';
import * as vouchersApi from '../js/api/vouchers.api.js';
import * as settingsApi from '../js/api/settings.api.js';

const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('btn-logout');

let currentSession = null;

// Auth check
supabase.auth.getSession().then(({ data: { session } }) => {
    currentSession = session;
    updateUI();
});

supabase.auth.onAuthStateChange((_event, session) => {
    currentSession = session;
    updateUI();
});

function updateUI() {
    if (currentSession) {
        loginScreen.classList.add('hidden');
        dashboardScreen.classList.remove('hidden');
        loadAllData();
    } else {
        loginScreen.classList.remove('hidden');
        dashboardScreen.classList.add('hidden');
    }
}

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) errorEl.textContent = error.message;
    else errorEl.textContent = '';
});

// Logout
logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
});

// Navigation
document.querySelectorAll('.admin-nav button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.admin-nav button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`section-${btn.dataset.target}`).classList.add('active');
    });
});

// Data Loading
async function loadAllData() {
    loadLetters();
    loadGallery();
    loadVouchers();
    loadSettings();
}

// --- Letters ---
async function loadLetters() {
    const letters = await lettersApi.fetchAllLetters();
    const list = document.getElementById('letters-list');
    list.innerHTML = letters.map(l => `
        <div class="item-row">
            <div>
                <strong>${l.title}</strong> (${l.published ? 'Published' : 'Draft'})
            </div>
            <div class="item-actions">
                <button onclick="editLetter('${l.id}')">Edit</button>
                <button class="btn-danger" onclick="deleteLetter('${l.id}')">Delete</button>
            </div>
        </div>
    `).join('');
    
    // Store in global scope for inline onclick handlers (quick hack for vanilla admin)
    window.allLetters = letters;
}

window.editLetter = (id) => {
    const l = window.allLetters.find(x => x.id === id);
    if (!l) return;
    document.getElementById('letter-id').value = l.id;
    document.getElementById('letter-title').value = l.title;
    document.getElementById('letter-author').value = l.author;
    document.getElementById('letter-body').value = l.body;
    document.getElementById('letter-published').checked = l.published;
    document.getElementById('letter-cancel').style.display = 'inline-block';
};

window.deleteLetter = async (id) => {
    if (confirm('Delete this letter?')) {
        await lettersApi.deleteLetter(id);
        loadLetters();
    }
};

document.getElementById('letter-cancel').addEventListener('click', () => {
    document.getElementById('form-letter').reset();
    document.getElementById('letter-id').value = '';
    document.getElementById('letter-cancel').style.display = 'none';
});

document.getElementById('form-letter').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('letter-id').value;
    const data = {
        title: document.getElementById('letter-title').value,
        author: document.getElementById('letter-author').value,
        body: document.getElementById('letter-body').value,
        published: document.getElementById('letter-published').checked
    };
    
    if (id) {
        await lettersApi.updateLetter(id, data);
    } else {
        await lettersApi.createLetter(data);
    }
    
    document.getElementById('form-letter').reset();
    document.getElementById('letter-id').value = '';
    document.getElementById('letter-cancel').style.display = 'none';
    loadLetters();
});


// --- Gallery ---
async function loadGallery() {
    const items = await galleryApi.fetchAllGalleryItems();
    const list = document.getElementById('gallery-list');
    list.innerHTML = items.map(i => `
        <div class="item-row">
            <div style="display:flex; align-items:center; gap: 10px;">
                <img src="${galleryApi.getImageUrl(i.storage_path)}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;">
                <strong>${i.caption || i.alt_text}</strong> (${i.published ? 'Published' : 'Draft'})
            </div>
            <div class="item-actions">
                <button class="btn-danger" onclick="deleteGallery('${i.id}', '${i.storage_path}')">Delete</button>
            </div>
        </div>
    `).join('');
}

window.deleteGallery = async (id, path) => {
    if (confirm('Delete this image?')) {
        await galleryApi.deleteGalleryItem(id, path);
        loadGallery();
    }
};

document.getElementById('form-gallery').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('gallery-file').files[0];
    const data = {
        caption: document.getElementById('gallery-caption').value,
        alt_text: document.getElementById('gallery-alt').value,
        published: document.getElementById('gallery-published').checked
    };
    
    // Simplification for vanilla: we only create, not edit image metadata here.
    if (!file) {
        alert("Please select a file.");
        return;
    }
    
    try {
        await galleryApi.createGalleryItem(data, file);
        document.getElementById('form-gallery').reset();
        loadGallery();
    } catch (err) {
        alert("Error saving image: " + err.message);
    }
});

// --- Vouchers ---
async function loadVouchers() {
    const items = await vouchersApi.fetchAllVouchers();
    const list = document.getElementById('vouchers-list');
    list.innerHTML = items.map(v => `
        <div class="item-row">
            <div>
                <strong>${v.title}</strong> (${v.published ? 'Published' : 'Draft'} | ${v.is_used ? 'Used' : 'Unused'})
            </div>
            <div class="item-actions">
                <button onclick="editVoucher('${v.id}')">Edit</button>
                <button class="btn-danger" onclick="deleteVoucher('${v.id}')">Delete</button>
            </div>
        </div>
    `).join('');
    
    window.allVouchers = items;
}

window.editVoucher = (id) => {
    const v = window.allVouchers.find(x => x.id === id);
    if (!v) return;
    document.getElementById('voucher-id').value = v.id;
    document.getElementById('voucher-title').value = v.title;
    document.getElementById('voucher-desc').value = v.description;
    document.getElementById('voucher-expiry').value = v.expiry_text || '';
    document.getElementById('voucher-published').checked = v.published;
    document.getElementById('voucher-used').checked = v.is_used;
    document.getElementById('voucher-cancel').style.display = 'inline-block';
};

window.deleteVoucher = async (id) => {
    if (confirm('Delete this voucher?')) {
        await vouchersApi.deleteVoucher(id);
        loadVouchers();
    }
};

document.getElementById('voucher-cancel').addEventListener('click', () => {
    document.getElementById('form-voucher').reset();
    document.getElementById('voucher-id').value = '';
    document.getElementById('voucher-cancel').style.display = 'none';
});

document.getElementById('form-voucher').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('voucher-id').value;
    const data = {
        title: document.getElementById('voucher-title').value,
        description: document.getElementById('voucher-desc').value,
        expiry_text: document.getElementById('voucher-expiry').value,
        published: document.getElementById('voucher-published').checked,
        is_used: document.getElementById('voucher-used').checked
    };
    
    if (id) {
        await vouchersApi.updateVoucher(id, data);
    } else {
        await vouchersApi.createVoucher(data);
    }
    
    document.getElementById('form-voucher').reset();
    document.getElementById('voucher-id').value = '';
    document.getElementById('voucher-cancel').style.display = 'none';
    loadVouchers();
});

// --- Settings ---
async function loadSettings() {
    // Only loads public settings as per RLS
    const settings = await settingsApi.fetchPublicSettings();
    if (settings.public_recipient_name) document.getElementById('setting-recipient').value = JSON.parse(settings.public_recipient_name);
    if (settings.public_theme) document.getElementById('setting-theme').value = JSON.parse(settings.public_theme);
    if (settings.public_enable_guestbook) document.getElementById('setting-guestbook').checked = JSON.parse(settings.public_enable_guestbook);
}

document.getElementById('form-settings').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const recipient = JSON.stringify(document.getElementById('setting-recipient').value);
    const theme = JSON.stringify(document.getElementById('setting-theme').value);
    const guestbook = JSON.stringify(document.getElementById('setting-guestbook').checked);
    
    try {
        await settingsApi.updateSetting('public_recipient_name', recipient);
        await settingsApi.updateSetting('public_theme', theme);
        await settingsApi.updateSetting('public_enable_guestbook', guestbook);
        alert('Settings saved!');
    } catch (err) {
        alert("Error saving settings. Make sure you have admin rights.");
    }
});
