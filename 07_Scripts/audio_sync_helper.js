/**
 * AUDIO_SYNC_HELPER.JS — Moteur Universel de Synchronisation Audio sans Saccades
 * Développé pour VibeEditor / Studio Player
 * 
 * RÈGLE D'OR :
 * 1. En lecture continue (`playing === true`), NE JAMAIS réassigner `audio.currentTime`
 *    pour de simples micro-fluctuations d'horloge (< 1.2s). Réassigner `currentTime`
 *    pendant la lecture purge le buffer audio matériel de Chromium et produit des micro-coupures audibles !
 * 2. On n'aligne `audio.currentTime` que si :
 *    - L'utilisateur effectue un saut de timeline (scrubbing / seek explicite)
 *    - La vidéo passe de pause à play
 *    - Le décalage réel dépasse le seuil critique de sécurité (1.5s)
 * 3. Utiliser impérativement des fichiers compressés (.mp3 192k) mis en mémoire tampon complète.
 */

class AudioSyncManager {
    constructor(options = {}) {
        this.tracks = new Map();
        this.lastTime = 0;
        this.wasPlaying = false;
        this.driftThreshold = options.driftThreshold || 1.5; // Seuil de tolérance anti-saccades en seconde
    }

    /**
     * Enregistrer une piste audio (voix off ou musique)
     * @param {string} id - Identifiant de la piste ('voice', 'bgm', etc.)
     * @param {HTMLAudioElement} audioElement - Élément <audio> du DOM
     * @param {Object} opts - Options : { start: 0, end: DURATION, volume: 1.0, loop: false }
     */
    addTrack(id, audioElement, opts = {}) {
        if (!audioElement) return;
        this.tracks.set(id, {
            el: audioElement,
            start: opts.start || 0,
            end: opts.end || 9999,
            defaultVolume: opts.volume ?? 1.0,
            loop: !!opts.loop
        });
    }

    /**
     * Synchroniser l'ensemble des pistes audio sur le temps courant de la timeline
     * Appelé à chaque frame ou tick de timeline
     * @param {number} timeInSeconds - Temps de la vidéo en secondes
     * @param {boolean} playing - État de lecture (true si play, false si pause)
     */
    sync(timeInSeconds, playing) {
        // Détection d'un saut de timeline volontaire (seek / scrub) par l'utilisateur
        const timeJump = Math.abs(timeInSeconds - this.lastTime) > 0.8;
        const playStateChanged = playing !== this.wasPlaying;

        for (const [id, track] of this.tracks.entries()) {
            const { el, start, end, defaultVolume, loop } = track;
            const trackElapsed = timeInSeconds - start;
            const inTimeRange = timeInSeconds >= start && timeInSeconds < end;

            if (inTimeRange) {
                const trackDuration = el.duration || (end - start);
                const expectedTime = loop ? (trackElapsed % trackDuration) : trackElapsed;

                // On ne force currentTime QUE lors d'un saut, d'un changement d'état ou d'un drift massif (> 1.5s)
                if (timeJump || playStateChanged || Math.abs(el.currentTime - expectedTime) > this.driftThreshold) {
                    el.currentTime = Math.max(0, expectedTime);
                }

                if (playing) {
                    if (el.paused && typeof el.play === 'function') {
                        el.play().catch(() => {});
                    }
                } else {
                    if (!el.paused && typeof el.pause === 'function') {
                        el.pause();
                    }
                }
            } else {
                // Hors plage temporelle de la piste
                if (!el.paused && typeof el.pause === 'function') {
                    el.pause();
                }
            }
        }

        this.lastTime = timeInSeconds;
        this.wasPlaying = playing;
    }

    /**
     * Ajuster le volume dynamique d'une piste (ex: ducking musique)
     */
    setVolume(id, volume) {
        const track = this.tracks.get(id);
        if (track && track.el) {
            track.el.volume = Math.max(0, Math.min(1, volume));
        }
    }

    /**
     * Stopper toutes les pistes
     */
    stopAll() {
        for (const track of this.tracks.values()) {
            if (track.el && !track.el.paused) {
                track.el.pause();
            }
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AudioSyncManager };
}

