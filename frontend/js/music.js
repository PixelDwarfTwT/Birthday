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

    if (!audio || !toggle || !fileInput || !urlForm || !urlInput || !resetButton) return;

    let objectUrl = null;
    const defaultUrl = (config.DEFAULT_MUSIC_URL || '').trim();

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
            status.textContent = 'This browser could not save the song link. It will still play for this visit.';
        }
    }

    function releaseObjectUrl() {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        objectUrl = null;
    }

    function setTrack(source, name) {
        audio.pause();
        releaseObjectUrl();
        audio.src = source;
        audio.load();
        if (source.startsWith('blob:')) objectUrl = source;
        trackName.textContent = name;
        toggle.disabled = false;
        toggle.textContent = 'Play';
        status.textContent = 'Song ready. Press Play when you are ready.';
    }

    function getTrackName(source, fallback) {
        try {
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
        trackName.textContent = 'No song selected yet';
        toggle.disabled = true;
        toggle.textContent = 'Play';
        status.textContent = message;
    }

    toggle.addEventListener('click', async () => {
        if (audio.paused) {
            try {
                await audio.play();
            } catch {
                status.textContent = 'This song could not be played. Try another audio file or direct audio link.';
            }
        } else {
            audio.pause();
        }
    });

    audio.addEventListener('play', () => {
        toggle.textContent = 'Pause';
        status.textContent = 'Now playing';
    });
    audio.addEventListener('pause', () => {
        toggle.textContent = 'Play';
    });
    audio.addEventListener('error', () => {
        if (audio.src) status.textContent = 'Could not load this song. Use an audio file or a direct MP3, OGG, or WAV link.';
    });

    fileInput.addEventListener('change', () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        if (file.type && !file.type.startsWith('audio/')) {
            status.textContent = 'Please choose an audio file.';
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
            status.textContent = 'Paste a direct link to an audio file first.';
            return;
        }

        let parsedUrl;
        try {
            parsedUrl = new URL(value);
        } catch {
            status.textContent = 'Enter a complete audio URL beginning with https://.';
            return;
        }
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            status.textContent = 'The song link must use HTTP or HTTPS.';
            return;
        }

        saveUrl(parsedUrl.href);
        setTrack(parsedUrl.href, parsedUrl.pathname.split('/').pop() || 'Favorite song');
    });

    resetButton.addEventListener('click', () => {
        try {
            localStorage.removeItem(MUSIC_PREFERENCE_KEY);
        } catch {
            // The default can still be restored for this visit if storage is disabled.
        }
        urlInput.value = '';
        if (defaultUrl) {
            setTrack(defaultUrl, getTrackName(defaultUrl, 'Birthday song'));
        } else {
            clearTrack('Choose a song to get started.');
        }
    });

    const savedUrl = getSavedUrl();
    if (savedUrl && /^https?:\/\//i.test(savedUrl)) {
        urlInput.value = savedUrl;
        setTrack(savedUrl, getTrackName(savedUrl, 'Favorite song'));
    } else if (defaultUrl) {
        setTrack(defaultUrl, getTrackName(defaultUrl, 'Birthday song'));
    } else {
        clearTrack('Choose a song to get started.');
    }
}
