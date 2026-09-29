export function initCandles() {
    const micBtn = document.getElementById('btn-mic-permission');
    const blowBtn = document.getElementById('btn-manual-blow');
    const candles = document.querySelectorAll('.candle-flame');
    const message = document.getElementById('cake-message');
    const cake = document.getElementById('cake-interaction');
    const hint = document.getElementById('cake-hint');
    const confettiColors = ['#f472b6', '#facc15', '#a78bfa', '#34d399', '#60a5fa'];

    let audioContext;
    let analyser;
    let microphone;
    let microphoneStream;
    let isBlowing = false;

    function burstConfetti() {
        if (!cake) return;
        cake.classList.add('is-celebrating');
        for (let i = 0; i < 18; i++) {
            const piece = document.createElement('span');
            piece.className = 'cake-confetti';
            piece.setAttribute('aria-hidden', 'true');
            piece.style.setProperty('--confetti-color', confettiColors[i % confettiColors.length]);
            piece.style.setProperty('--confetti-x', `${Math.round((Math.random() - 0.5) * 300)}px`);
            piece.style.setProperty('--confetti-y', `${Math.round(55 + Math.random() * 120)}px`);
            piece.style.setProperty('--confetti-rotation', `${Math.round((Math.random() - 0.5) * 800)}deg`);
            cake.appendChild(piece);
            window.setTimeout(() => piece.remove(), 1200);
        }
    }

    function extinguish() {
        if (isBlowing) return;
        isBlowing = true;
        candles.forEach(c => c.classList.add('flame-out'));
        if (cake) {
            cake.classList.add('is-extinguished');
            cake.setAttribute('aria-pressed', 'true');
            cake.setAttribute('aria-label', 'Lilin sudah ditiup. Selamat ulang tahun!');
            burstConfetti();
        }
        if (hint) hint.textContent = 'Yeay! Lilinnya sudah padam!';
        if (message) {
            message.textContent = "Yeay! Selamat ulang tahun!";
            message.classList.remove('hidden');
            message.classList.add('fade-in');
        }
        window.setTimeout(() => candles.forEach(c => { c.style.display = 'none'; }), 450);
        if (microphoneStream) {
            microphoneStream.getTracks().forEach(track => track.stop());
            microphoneStream = null;
        }
        if (audioContext) {
            audioContext.close();
            audioContext = null;
        }
    }

    if (cake) {
        cake.addEventListener('click', extinguish);
        cake.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                extinguish();
            }
        });
    }

    if (blowBtn) blowBtn.addEventListener('click', extinguish);

    if (!micBtn) return;
    micBtn.addEventListener('click', async () => {
        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error('Mikrofon tidak tersedia di peramban ini.');
            }
            microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const stream = microphoneStream;
            micBtn.style.display = 'none';
            if (blowBtn) blowBtn.style.display = 'none';
            
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            function detectBlow() {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;
                
                if (average > 100 && !isBlowing) {
                    extinguish();
                } else if (!isBlowing) {
                    requestAnimationFrame(detectBlow);
                }
            }
            detectBlow();
            
        } catch (err) {
            if (microphoneStream) {
                microphoneStream.getTracks().forEach(track => track.stop());
                microphoneStream = null;
            }
            console.error("Akses mikrofon ditolak atau tidak didukung.", err);
            alert("Mikrofon tidak dapat digunakan. Kamu tetap bisa meniup lilin dengan tombol manual.");
        }
    });
}
