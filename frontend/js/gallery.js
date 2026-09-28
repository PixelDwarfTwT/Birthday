import { getImageUrl } from './api/gallery.api.js';

export function renderGallery(items) {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    grid.innerHTML = '';
    
    if (items.length === 0) {
        grid.innerHTML = '<p>Belum ada foto.</p>';
        return;
    }
    
    // Add simple grid styling if not in css
    grid.style.display = 'grid';
    grid.style.gap = '1rem';
    grid.className = 'gallery-grid'; // will be responsive via CSS

    items.forEach(item => {
        const url = getImageUrl(item.storage_path);
        
        const img = document.createElement('img');
        img.src = url;
        img.alt = item.alt_text || 'Foto galeri';
        img.loading = 'lazy';
        img.style.width = '100%';
        img.style.height = '200px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '8px';
        img.style.cursor = 'pointer';
        img.setAttribute('tabindex', '0');

        img.addEventListener('click', () => openLightbox(url, item.caption));
        img.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(url, item.caption);
            }
        });

        grid.appendChild(img);
    });
}

function openLightbox(url, caption) {
    const overlay = document.getElementById('lightbox-overlay');
    const img = document.getElementById('lightbox-img');
    const cap = document.getElementById('lightbox-caption');
    
    if (!overlay) return;
    
    img.src = url;
    cap.textContent = caption || '';
    
    overlay.classList.add('active');
    
    const closeBtn = document.getElementById('lightbox-close');
    if (closeBtn) closeBtn.focus();

    function closeLightbox() {
        overlay.classList.remove('active');
        document.removeEventListener('keydown', escHandler);
    }
    function escHandler(event) {
        if (event.key === 'Escape') closeLightbox();
    }
    closeBtn.onclick = closeLightbox;
    overlay.onclick = (e) => {
        if (e.target === overlay) closeLightbox();
    };

    document.addEventListener('keydown', escHandler);
}
