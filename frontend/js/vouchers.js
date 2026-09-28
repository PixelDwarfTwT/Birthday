export function renderVouchers(vouchers) {
    const grid = document.getElementById('vouchers-grid');
    if (!grid) return;

    grid.innerHTML = '';
    
    if (vouchers.length === 0) {
        grid.innerHTML = '<p>Belum ada voucher.</p>';
        return;
    }

    grid.className = 'vouchers-grid';
    grid.style.display = 'grid';
    grid.style.gap = '1rem';

    vouchers.forEach(voucher => {
        const card = document.createElement('div');
        card.className = `card voucher-card ${voucher.is_used ? 'used' : ''}`;
        
        card.innerHTML = `
            <h3>${escapeHtml(voucher.title)}</h3>
            <p>${escapeHtml(voucher.description)}</p>
            ${voucher.expiry_text ? `<small>Berlaku: ${escapeHtml(voucher.expiry_text)}</small>` : ''}
            ${voucher.is_used ? '<p><strong>(Sudah digunakan)</strong></p>' : ''}
        `;

        grid.appendChild(card);
    });
}

function escapeHtml(unsafe) {
    return (unsafe || "").toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
