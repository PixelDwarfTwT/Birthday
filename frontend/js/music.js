import { config } from './config.js';

const MUSIC_PREFERENCE_KEY = 'birthday-website-music-url';

export function initMusicPlayer() {
    const audio = document.getElementById('birthday-song');
    const toggle = document.getElementById('music-toggle');
    const fileInput = document.getElementById('music-file');
    const urlForm = document.getElementById('music-url-form');
    const urlInput = document.getElementById('music-url');
    const resetButton = document.getElementById('music-reset');
    const trackName = document.getElementById('music-track-name');
    const status = document.getElementById('music-status');
    const spotifyPlayer = document.getElementById('spotify-player');
    const spotifyMount = document.getElementById('spotify-player-embed');
    const musicDock = document.getElementById('music-dock');
    const collapseButton = document.getElementById('music-collapse');
    const reopenButton = document.getElementById('music-reopen');

    if (!audio || !toggle || !fileInput || !urlForm || !urlInput || !resetButton || !spotifyPlayer || !spotifyMount || !musicDock || !collapseButton || !reopenButton) return;

    let objectUrl = null;
    let spotifyController = null;
    let spotifyApiRequested = false;
    let currentSpotifyUri = '';
    let spotifyPlaybackStarted = false;
    let spotifyAttemptId = 0;
    const defaultUrl = (config.DEFAULT_MUSIC_URL || '').trim();

    function collapseMusicDock() {
        // Keep the Spotify iframe mounted and playing; only move its panel offscreen.
        musicDock.classList.add('is-collapsed');
        musicDock.inert = true;
        musicDock.setAttribute('aria-hidden', 'true');
        reopenButton.hidden = false;
        reopenButton.focus();
    }

    function expandMusicDock() {
        musicDock.classList.remove('is-collapsed');
        musicDock.inert = false;
        musicDock.removeAttribute('aria-hidden');
        reopenButton.hidden = true;
        collapseButton.focus();
    }

    collapseButton.addEventListener('click', collapseMusicDock);
    reopenButton.addEventListener('click', expandMusicDock);

    function getSavedUrl() {
        try {
            return localStorage.getItem(MUSIC_PREFERENCE_KEY) || '';
        } catch {
            return '';
        }
    }

    function saveUrl(value) {
        try {
            localStorage.setItem(MUSIC_PREFERENCE_KEY, value);
        } catch {
            status.textContent = 'Tautan tidak bisa disimpan di peramban ini, tetapi tetap dapat diputar saat ini.';
        }
    }

    function releaseObjectUrl() {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        objectUrl = null;
    }

    function stopGestureRetries() {
        document.removeEventListener('pointerdown', retryPlaybackFromGesture, true);
        document.removeEventListener('keydown', retryPlaybackFromGesture, true);
    }

    function retryPlaybackFromGesture() {
        if (currentSpotifyUri && spotifyController) {
            requestSpotifyPlayback();
        } else if (!currentSpotifyUri && audio.hasAttribute('src') && audio.paused) {
            attemptAudioPlayback();
        }
    }

    async function attemptAudioPlayback() {
        try {
            await audio.play();
        } catch (error) {
            if (error?.name === 'NotAllowedError') {
                status.textContent = 'Browser memblokir putar otomatis. Lagu akan dicoba lagi saat kamu menyentuh halaman; jika belum berbunyi, tekan Putar.';
            } else {
                status.textContent = 'Lagu tidak dapat diputar. Periksa file atau tautan audionya.';
            }
        }
    }

    function requestSpotifyPlayback() {
        if (!spotifyController || !currentSpotifyUri) return;
        const attemptId = ++spotifyAttemptId;
        spotifyPlaybackStarted = false;
        status.textContent = 'Mencoba memutar lagu otomatis melalui Spotify...';
        try {
            spotifyController.play();
        } catch {
            status.textContent = 'Spotify belum dapat memutar otomatis. Gunakan tombol putar pada pemutar Spotify.';
        }
        window.setTimeout(() => {
            if (attemptId === spotifyAttemptId && !spotifyPlaybackStarted) {
                status.textContent = 'Jika lagu belum berbunyi, browser mungkin memblokir autoplay. Sentuh halaman atau tekan tombol putar Spotify.';
            }
        }, 3000);
    }

    function showStaticSpotifyEmbed() {
        const trackId = currentSpotifyUri.split(':').pop();
        if (!trackId) return;
        const iframe = document.createElement('iframe');
        iframe.title = 'Pemutar lagu Spotify';
        iframe.src = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
        iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
        iframe.loading = 'lazy';
        iframe.style.cssText = 'display:block;width:100%;height:152px;border:0;border-radius:0.8rem';
        spotifyMount.replaceChildren(iframe);
        status.textContent = 'Spotify tidak dapat memulai otomatis. Tekan tombol putar pada pemutar Spotify.';
    }

    function createSpotifyController(IFrameAPI) {
        if (!currentSpotifyUri || spotifyController) return;
        spotifyMount.replaceChildren();
        IFrameAPI.createController(spotifyMount, {
            uri: currentSpotifyUri,
            width: '100%',
            height: '152'
        }, (controller) => {
            spotifyController = controller;
            controller.addListener('playback_started', () => {
                spotifyPlaybackStarted = true;
                status.textContent = 'Sedang diputar melalui Spotify.';
                stopGestureRetries();
            });
            if (currentSpotifyUri) {
                controller.loadUri(currentSpotifyUri);
                requestSpotifyPlayback();
            }
        });
    }

    function loadSpotifyIframeApi() {
        if (spotifyApiRequested || spotifyController) return;
        spotifyApiRequested = true;
        window.onSpotifyIframeApiReady = (IFrameAPI) => {
            spotifyApiRequested = false;
            createSpotifyController(IFrameAPI);
        };

        const script = document.createElement('script');
        script.src = 'https://open.spotify.com/embed/iframe-api/v1';
        script.async = true;
        script.onerror = () => {
            spotifyApiRequested = false;
            if (currentSpotifyUri && !spotifyController) showStaticSpotifyEmbed();
        };
        document.head.appendChild(script);
    }

    document.addEventListener('pointerdown', retryPlaybackFromGesture, true);
    document.addEventListener('keydown', retryPlaybackFromGesture, true);

    function getSpotifyTrackId(source) {
        try {
            const url = new URL(source, window.location.href);
            if (url.hostname !== 'open.spotify.com') return null;
            return url.pathname.match(/\/track\/([A-Za-z0-9]+)/)?.[1] || null;
        } catch {
            return null;
        }
    }

    function setTrack(source, name) {
        audio.pause();
        releaseObjectUrl();
        const spotifyTrackId = getSpotifyTrackId(source);
        if (spotifyTrackId) {
            currentSpotifyUri = `spotify:track:${spotifyTrackId}`;
            audio.removeAttribute('src');
            audio.load();
            spotifyPlayer.hidden = false;
            toggle.hidden = true;
            toggle.disabled = true;
            trackName.textContent = name;
            status.textContent = 'Mencoba memutar lagu otomatis melalui Spotify...';
            if (spotifyController) {
                spotifyController.loadUri(currentSpotifyUri);
                requestSpotifyPlayback();
            } else {
                loadSpotifyIframeApi();
            }
            return;
        }

        currentSpotifyUri = '';
        spotifyAttemptId += 1;
        try { spotifyController?.pause(); } catch { /* Keep audio selection usable if Spotify is unavailable. */ }
        spotifyPlayer.hidden = true;
        toggle.hidden = false;
        audio.src = source;
        audio.load();
        if (source.startsWith('blob:')) objectUrl = source;
        trackName.textContent = name;
        toggle.disabled = false;
        toggle.textContent = 'Putar';
        status.textContent = 'Mencoba memutar lagu otomatis...';
        attemptAudioPlayback();
    }

    function getTrackName(source, fallback) {
        try {
            const spotifyTrackId = getSpotifyTrackId(source);
            if (spotifyTrackId) {
                if (spotifyTrackId === getSpotifyTrackId(config.DEFAULT_MUSIC_URL || '')) {
                    return config.DEFAULT_MUSIC_TITLE || fallback;
                }
                return 'Lagu Spotify';
            }
            const fileName = new URL(source, window.location.href).pathname.split('/').pop();
            return decodeURIComponent(fileName).replace(/\.[^.]+$/, '') || fallback;
        } catch {
            return fallback;
        }
    }

    function clearTrack(message) {
        currentSpotifyUri = '';
        spotifyAttemptId += 1;
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        releaseObjectUrl();
        try { spotifyController?.pause(); } catch { /* Ignore unavailable Spotify controller. */ }
        spotifyPlayer.hidden = true;
        toggle.hidden = false;
        trackName.textContent = 'Belum ada lagu yang dipilih';
        toggle.disabled = true;
        toggle.textContent = 'Putar';
        status.textContent = message;
    }

    toggle.addEventListener('click', async () => {
        if (audio.paused) {
            try {
                await audio.play();
            } catch {
                status.textContent = 'Lagu tidak dapat diputar. Coba file audio atau tautan langsung lainnya.';
            }
        } else {
            audio.pause();
        }
    });

    audio.addEventListener('play', () => {
        toggle.textContent = 'Jeda';
        status.textContent = 'Sedang diputar';
        stopGestureRetries();
    });
    audio.addEventListener('pause', () => {
        toggle.textContent = 'Putar';
    });
    audio.addEventListener('error', () => {
        if (audio.src) status.textContent = 'Lagu gagal dimuat. Pilih file MP3, OGG, atau WAV yang valid.';
    });

    fileInput.addEventListener('change', () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        if (file.type && !file.type.startsWith('audio/')) {
            status.textContent = 'Silakan pilih file audio.';
            fileInput.value = '';
            return;
        }

        setTrack(URL.createObjectURL(file), file.name);
        fileInput.value = '';
    });

    urlForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const value = urlInput.value.trim();
        if (!value) {
            status.textContent = 'Masukkan tautan lagu terlebih dahulu.';
            return;
        }

        let parsedUrl;
        try {
            parsedUrl = new URL(value);
        } catch {
            status.textContent = 'Masukkan URL lengkap yang diawali https://.';
            return;
        }
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            status.textContent = 'Tautan lagu harus menggunakan HTTP atau HTTPS.';
            return;
        }

        const spotifyTrackId = getSpotifyTrackId(parsedUrl.href);
        if (parsedUrl.hostname === 'open.spotify.com' && !spotifyTrackId) {
            status.textContent = 'Gunakan tautan Spotify yang langsung menuju ke satu lagu.';
            return;
        }

        saveUrl(parsedUrl.href);
        setTrack(parsedUrl.href, getTrackName(parsedUrl.href, spotifyTrackId ? 'Lagu Spotify' : 'Lagu pilihan'));
    });

    resetButton.addEventListener('click', () => {
        try {
            localStorage.removeItem(MUSIC_PREFERENCE_KEY);
        } catch {
            // The default can still be restored for this visit if storage is disabled.
        }
        urlInput.value = '';
        if (defaultUrl) {
            setTrack(defaultUrl, getTrackName(defaultUrl, 'Lagu ulang tahun'));
        } else {
            clearTrack('Pilih lagu untuk mulai.');
        }
    });

    const savedUrl = getSavedUrl();
    if (savedUrl && /^https?:\/\//i.test(savedUrl)) {
        urlInput.value = savedUrl;
        setTrack(savedUrl, getTrackName(savedUrl, 'Lagu pilihan'));
    } else if (defaultUrl) {
        setTrack(defaultUrl, getTrackName(defaultUrl, 'Lagu ulang tahun'));
    } else {
        clearTrack('Pilih lagu untuk mulai.');
    }
}
