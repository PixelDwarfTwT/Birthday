export function initGift() {
    const giftBox = document.getElementById('interactive-gift');
    const surpriseContent = document.getElementById('surprise-content');
    if (!giftBox) return;

    function openGift() {
        if (giftBox.classList.contains('opened')) return;
        giftBox.classList.add('opened');
        giftBox.style.pointerEvents = 'none'; // prevent multiple clicks
        
        setTimeout(() => {
            if (!surpriseContent) return;
            surpriseContent.classList.remove('hidden');
            surpriseContent.classList.add('fade-in');
        }, 600);
    }

    giftBox.addEventListener('click', openGift);
    giftBox.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openGift();
        }
    });
}
