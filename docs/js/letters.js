export function renderLetters(letters) {
    const grid = document.getElementById('letters-grid');
    if (!grid) return;

    grid.innerHTML = '';
    
    if (letters.length === 0) {
        grid.innerHTML = '<p>Belum ada surat.</p>';
        return;
    }

    grid.className = 'letters-grid';
    grid.style.display = 'grid';
    grid.style.gap = '1rem';

    letters.forEach(letter => {
        const card = document.createElement('div');
        card.className = 'card letter-card';
        card.style.cursor = 'pointer';
        card.setAttribute('tabindex', '0');
        
        card.innerHTML = `
            <h3>${escapeHtml(letter.title)}</h3>
            <p>Dari: ${escapeHtml(letter.author)}</p>
        `;

        card.addEventListener('click', () => openLetter(letter));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLetter(letter);
            }
        });

        grid.appendChild(card);
    });
}

function openLetter(letter) {
    const modal = document.getElementById('letter-modal');
    const title = document.getElementById('letter-title');
    const author = document.getElementById('letter-author');
    const body = document.getElementById('letter-body');
    
    if (!modal) return;
    
    title.textContent = letter.title;
    author.textContent = `Dari: ${letter.author}`;
    
    // Preserve paragraphs
    body.innerHTML = escapeHtml(letter.body).replace(/\n/g, '<br>');
    
    modal.classList.add('active');
    
    const closeBtn = document.getElementById('letter-close');
    if (closeBtn) closeBtn.focus();

    function closeLetter() {
        modal.classList.remove('active');
        document.removeEventListener('keydown', escHandler);
    }
    function escHandler(event) {
        if (event.key === 'Escape') closeLetter();
    }
    closeBtn.onclick = closeLetter;
    modal.onclick = (e) => {
        if (e.target === modal) closeLetter();
    };
    document.addEventListener('keydown', escHandler);
}

function escapeHtml(unsafe) {
    return (unsafe || "").toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
