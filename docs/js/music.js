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
    const musicDock = document.getElementById('music-dock');
    const collapseButton = document.getElementById('music-collapse');
    const reopenButton = document.getElementById('music-reopen');

    if (!audio || !toggle || !fileInput || !urlForm || !urlInput || !resetButton || !spotifyPlayer || !musicDock || !collapseButton || !reopenButton) return;

    let objectUrl = null;
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
            audio.removeAttribute('src');
            audio.load();
            spotifyPlayer.src = `https://open.spotify.com/embed/track/${spotifyTrackId}?utm_source=generator&theme=0`;
            spotifyPlayer.hidden = false;
            toggle.hidden = true;
            toggle.disabled = true;
            trackName.textContent = name;
            status.textContent = 'Putar lagu melalui pemutar Spotify.';
            return;
        }

        spotifyPlayer.removeAttribute('src');
        spotifyPlayer.hidden = true;
        toggle.hidden = false;
        audio.src = source;
        audio.load();
        if (source.startsWith('blob:')) objectUrl = source;
        trackName.textContent = name;
        toggle.disabled = false;
        toggle.textContent = 'Putar';
        status.textContent = 'Lagu siap. Tekan Putar untuk mulai mendengarkan.';
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
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        releaseObjectUrl();
        spotifyPlayer.removeAttribute('src');
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
