export function initFloatingFlowers() {
    const container = document.createElement('div');
    container.id = 'flower-background';
    document.body.appendChild(container);

    const flowers = ['🌸', '🌺', '🌼', '🌷', '✨', '🦋'];
    
    function createFlower() {
        const flower = document.createElement('div');
        flower.className = 'floating-flower';
        flower.innerText = flowers[Math.floor(Math.random() * flowers.length)];
        
        // Random starting position, size, and animation duration
        const left = Math.random() * 100;
        const size = Math.random() * 1.5 + 0.8; // 0.8rem to 2.3rem
        const duration = Math.random() * 12 + 10; // 10s to 22s
        const direction = Math.random() > 0.5 ? 1 : -1;
        const sway = Math.random() * 100 * direction;
        
        flower.style.left = `${left}vw`;
        flower.style.fontSize = `${size}rem`;
        flower.style.animationDuration = `${duration}s`;
        flower.style.setProperty('--sway', `${sway}px`);
        
        container.appendChild(flower);
        
        // Remove after animation completes
        setTimeout(() => {
            if(flower.parentNode) {
                flower.remove();
            }
        }, duration * 1000);
    }

    // Create a new flower every 600ms
    setInterval(() => {
        if (document.body.classList.contains('theme-flower-field') && document.visibilityState === 'visible') {
            createFlower();
        }
    }, 600);
    
    // Create initial batch
    if (document.body.classList.contains('theme-flower-field')) {
        for(let i=0; i<15; i++) {
            setTimeout(createFlower, Math.random() * 3000);
        }
    }
}
