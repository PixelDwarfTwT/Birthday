export function initShare() {
    const btn = document.getElementById('btn-share');
    if (!btn) return;

    async function copyLink(url) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(url);
            } else {
                const input = document.createElement('textarea');
                input.value = url;
                input.setAttribute('readonly', '');
                input.style.position = 'fixed';
                input.style.opacity = '0';
                document.body.appendChild(input);
                input.select();
                const copied = document.execCommand('copy');
                input.remove();
                if (!copied) throw new Error('Copy command was not available');
            }
            alert('Tautan berhasil disalin!');
        } catch {
            window.prompt('Salin tautan ulang tahun ini:', url);
        }
    }

    btn.addEventListener('click', async () => {
        const url = window.location.href;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Selamat Ulang Tahun!',
                    text: 'Yuk, rayakan ulang tahun di situs interaktif ini!',
                    url: url
                });
            } catch (err) {
                console.log("Share failed", err);
            }
        } else {
            await copyLink(url);
        }
    });
}
