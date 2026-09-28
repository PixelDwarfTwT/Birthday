import { playPopSound } from './audio.js';

export function initBalloons() {
    const container = document.getElementById('balloon-container');
    const scoreDisplay = document.getElementById('balloon-score');
    if (!container) return;

    let score = 0;
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

    function createBalloon() {
        const balloon = document.createElement('div');
        balloon.className = 'balloon floating';
        
        // Basic styling for a balloon
        balloon.style.width = '60px';
        balloon.style.height = '80px';
        const color = colors[Math.floor(Math.random() * colors.length)];
        balloon.style.backgroundColor = color;
        balloon.style.color = color;
        balloon.style.borderRadius = '50% 50% 50% 50% / 40% 40% 60% 60%';
        balloon.style.position = 'absolute';
        balloon.style.left = Math.random() * (container.clientWidth - 60) + 'px';
        balloon.style.bottom = '-100px';
        balloon.style.cursor = 'pointer';
        
        // Animate upwards
        const duration = 4000 + Math.random() * 3000;
        balloon.animate([
            { transform: 'translateY(0)' },
            { transform: `translateY(-${container.clientHeight + 100}px)` }
        ], {
            duration: duration,
            easing: 'linear'
        }).onfinish = () => {
            if (balloon.parentNode) balloon.remove();
        };

        balloon.addEventListener('click', () => {
            playPopSound();
            balloon.classList.remove('floating');
            balloon.classList.add('popping');
            score++;
            if (scoreDisplay) scoreDisplay.textContent = `Score: ${score}`;
            setTimeout(() => balloon.remove(), 300);
        });

        // Accessibility
        balloon.setAttribute('tabindex', '0');
        balloon.setAttribute('role', 'button');
        balloon.setAttribute('aria-label', 'Pop balloon');
        balloon.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                balloon.click();
            }
        });

        container.appendChild(balloon);
    }

    // Create balloons periodically
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            createBalloon();
        }
    }, 1500);
}
