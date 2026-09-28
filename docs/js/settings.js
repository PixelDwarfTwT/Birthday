export function applySettings(settings) {
    // Theme
    if (settings.public_theme) {
        document.body.className = `theme-${settings.public_theme.replace(/['"]/g, '')}`;
    }
    
    // Recipient Name
    if (settings.public_recipient_name) {
        const nameEls = document.querySelectorAll('.recipient-name');
        nameEls.forEach(el => el.textContent = settings.public_recipient_name.replace(/['"]/g, ''));
    }
    
    // Guestbook section toggle
    if (settings.public_enable_guestbook === 'false' || settings.public_enable_guestbook === false) {
        const gbSection = document.getElementById('guestbook-section');
        if (gbSection) gbSection.style.display = 'none';
    }
}
