export function initCandles() {
    const micBtn = document.getElementById('btn-mic-permission');
    const blowBtn = document.getElementById('btn-manual-blow');
    const candles = document.querySelectorAll('.candle-flame');
    const message = document.getElementById('cake-message');

    let audioContext;
    let analyser;
    let microphone;
    let microphoneStream;
    let isBlowing = false;

    function extinguish() {
        isBlowing = true;
        candles.forEach(c => c.style.display = 'none');
        if (message) {
            message.textContent = "Yay! Happy Birthday!";
            message.classList.remove('hidden');
        }
        if (microphoneStream) {
            microphoneStream.getTracks().forEach(track => track.stop());
            microphoneStream = null;
        }
        if (audioContext) {
            audioContext.close();
            audioContext = null;
        }
    }

    if (blowBtn) blowBtn.addEventListener('click', extinguish);

    if (!micBtn) return;
    micBtn.addEventListener('click', async () => {
        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error('Microphone access is not available in this browser.');
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
            console.error("Microphone access denied or not supported.", err);
            alert("Microphone access denied. You can use the manual button instead.");
        }
    });
}
