"""
07_Scripts/generate_music.py
Générateur de musique procédurale entièrement synthétique.
Crée une musique de fond tech/corporate depuis zéro (sans samples externes).

Usage CLI :
    python 07_Scripts/generate_music.py --style tech --duration 60 --out 01_Assets/Musiques/chatgpt_ad_60s_music.wav
    python 07_Scripts/generate_music.py --style chill --duration 30 --out output.wav
    python 07_Scripts/generate_music.py --list

Styles disponibles :
  tech       : Electro moderne, pulsé, synthétique - pour SaaS/tech/AI ads
  corporate  : Uplift propre, motivant, professionnel
  chill      : Ambient doux, lofi, détendu
  cinematic  : Épique, montée dramatique, impact
  dynamic    : Énergie, BPM élevé, action
"""

import sys
import os
import argparse
import numpy as np
from scipy.signal import butter, sosfilt, lfilter

SR = 44100
_rng = np.random.default_rng(42)


# ─── Utilitaires de base ───────────────────────────────────────────────────────

def t_(d):
    return np.linspace(0, d, int(round(d * SR)), endpoint=False)

def env_adsr(n, a=0.01, d=0.05, s=0.7, r=0.1, total=None):
    """Enveloppe ADSR normalisée"""
    total = total or (n / SR)
    tt = np.linspace(0, total, n)
    env = np.zeros(n)
    for i, t in enumerate(tt):
        if t < a:
            env[i] = t / a
        elif t < a + d:
            env[i] = 1.0 - (1 - s) * (t - a) / d
        elif t < total - r:
            env[i] = s
        else:
            env[i] = s * max(0, (total - t) / r)
    return env

def lp(x, f, order=2):
    sos = butter(order, min(f, SR / 2 - 1), 'low', fs=SR, output='sos')
    return sosfilt(sos, x)

def hp(x, f, order=2):
    sos = butter(order, max(f, 1), 'high', fs=SR, output='sos')
    return sosfilt(sos, x)

def bp(x, lo, hi, order=2):
    lo = max(lo, 1)
    hi = min(hi, SR / 2 - 1)
    sos = butter(order, [lo, hi], 'band', fs=SR, output='sos')
    return sosfilt(sos, x)

def norm(x, peak=0.9):
    m = np.abs(x).max()
    return x * (peak / m) if m > 0 else x

def mix(*tracks, weights=None):
    """Mixe plusieurs pistes de même longueur"""
    n = max(len(t) for t in tracks)
    out = np.zeros(n)
    if weights is None:
        weights = [1.0] * len(tracks)
    for t, w in zip(tracks, weights):
        out[:len(t)] += t * w
    return out

def fade_in(x, dur=0.5):
    n = int(dur * SR)
    x = x.copy()
    x[:n] *= np.linspace(0, 1, n)
    return x

def fade_out(x, dur=1.0):
    n = int(dur * SR)
    x = x.copy()
    x[-n:] *= np.linspace(1, 0, n)
    return x

def reverb(x, decay=0.3, delay_ms=30):
    """Simple reverb par comb filter"""
    delay = int(delay_ms * SR / 1000)
    b = np.zeros(delay + 1)
    b[0] = 1.0
    b[-1] = -decay
    return lfilter([1.0], b, x)

def noise_band(d, lo, hi):
    n = _rng.standard_normal(int(d * SR))
    return bp(n, lo, hi)


# ─── Oscillateurs ─────────────────────────────────────────────────────────────

def sine(freq, d, phase=0.0):
    tt = t_(d)
    return np.sin(2 * np.pi * freq * tt + phase)

def saw(freq, d):
    tt = t_(d)
    return 2 * (tt * freq % 1) - 1

def square(freq, d, duty=0.5):
    tt = t_(d)
    return np.where((tt * freq % 1) < duty, 1.0, -1.0).astype(float)

def tri(freq, d):
    tt = t_(d)
    return 2 * np.abs(2 * (tt * freq % 1) - 1) - 1

def fm_synth(carrier, mod_ratio, mod_depth, d, env_a=0.01, env_r=0.1):
    """FM synthesis pour sons de synthé"""
    tt = t_(d)
    mod = sine(carrier * mod_ratio, d) * mod_depth
    sig = np.sin(2 * np.pi * carrier * tt + mod)
    env = env_adsr(len(tt), a=env_a, r=env_r, total=d)
    return sig * env

def pad_synth(freq, d, voices=4, detune=0.008):
    """Pad atmosphérique par superposition de sines avec léger détune"""
    n = int(round(d * SR))
    out = np.zeros(n)
    for i in range(voices):
        f = freq * (1 + (i - voices / 2) * detune)
        phase = _rng.random() * 2 * np.pi
        s = sine(f, d, phase)
        out += s[:n]  # Garantir la même longueur
    env = env_adsr(n, a=min(d * 0.4, 2.0), d=0.1, s=0.8, r=min(d * 0.3, 1.5), total=d)
    return lp(out / voices, 3000) * env


# ─── Batterie synthétique ─────────────────────────────────────────────────────

def kick(d=0.5, freq_start=180, freq_end=40, punch=1.0):
    tt = t_(d)
    freq_sweep = np.linspace(freq_start, freq_end, len(tt))
    phase = np.cumsum(2 * np.pi * freq_sweep / SR)
    body = np.sin(phase) * env_adsr(len(tt), a=0.003, d=0.15, s=0.0, r=0.3, total=d)
    click_n = _rng.standard_normal(len(tt))
    click_env = np.exp(-tt / 0.005) * punch
    transient = hp(click_n, 1500) * click_env * 0.4
    return norm(body + transient)

def snare(d=0.25, tune=1.0):
    tt = t_(d)
    body_f = 180 * tune
    body = sine(body_f, d) * np.exp(-tt / 0.03)
    noise_part = _rng.standard_normal(len(tt))
    noise_env = np.exp(-tt / 0.08)
    sn = bp(noise_part, 1500, 8000) * noise_env
    return norm(body * 0.4 + sn * 0.8)

def hihat_closed(d=0.08, v=1.0):
    n = _rng.standard_normal(int(d * SR))
    env = np.exp(-t_(d) / 0.015)
    return hp(n, 7000) * env * v

def hihat_open(d=0.4, v=0.7):
    n = _rng.standard_normal(int(d * SR))
    env = np.exp(-t_(d) / 0.15)
    return hp(n, 5000) * env * v

def clap(d=0.3, v=1.0):
    n = _rng.standard_normal(int(d * SR))
    env = np.exp(-t_(d) / 0.06) + 0.3 * np.exp(-t_(d) / 0.02)
    return bp(n, 800, 6000) * env * v

def build_drum_pattern(pattern_len_beats, bpm, beat_div=4):
    """Construit un buffer de batterie à partir d'un pattern rythmique"""
    beat_dur = 60.0 / bpm
    step_dur = beat_dur / beat_div
    total_dur = pattern_len_beats * beat_dur
    n_samples = int(total_dur * SR)
    buf = np.zeros(n_samples)
    n_steps = int(pattern_len_beats * beat_div)

    def place(sound, step, vol=1.0):
        pos = int(step * step_dur * SR)
        end = min(pos + len(sound), n_samples)
        buf[pos:end] += sound[:end - pos] * vol

    return buf, place, n_steps, step_dur


# ─── Styles musicaux ──────────────────────────────────────────────────────────

NOTES = {
    'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.0,
    'A2': 110.0, 'B2': 123.47,
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.0,
    'A3': 220.0, 'Bb3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.0,
    'A4': 440.0, 'Bb4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'G5': 783.99,
    'A5': 880.0,
}

def note_seq(notes_list, durations, bpm, synth_fn, octave_shift=0):
    """Génère une séquence de notes avec un synthétiseur donné"""
    beat = 60.0 / bpm
    parts = []
    for note, dur_beats in zip(notes_list, durations):
        d = dur_beats * beat
        freq = NOTES.get(note, 261.63) * (2 ** octave_shift)
        s = synth_fn(freq, d)
        parts.append(s)
    return np.concatenate(parts)


# ─── Style TECH (AI / SaaS ad, 60s) ─────────────────────────────────────────

def generate_tech(duration=60.0, bpm=124):
    """
    Musique tech moderne pour pub AI/SaaS.
    Structure : Intro(8s) → Build(16s) → Drop/Peak(24s) → Breakdown(8s) → Final(4s)
    """
    total_n = int(duration * SR)
    out = np.zeros(total_n)

    beat = 60.0 / bpm
    bar = beat * 4

    def place(buf, start_s, vol=1.0):
        pos = int(start_s * SR)
        end = min(pos + len(buf), total_n)
        out[pos:end] += buf[:end - pos] * vol

    # ── Pad ambiant (toute la durée) ──
    pad_notes = [NOTES['A3'], NOTES['E4'], NOTES['A4'], NOTES['C5']]
    for pn in pad_notes:
        pad = pad_synth(pn, duration * 1.02, voices=6, detune=0.005)[:total_n]
        pad_env = np.ones(total_n)
        # Fade in 4s, fade out 4s
        pad_env[:int(4 * SR)] = np.linspace(0, 1, int(4 * SR))
        pad_env[-int(4 * SR):] = np.linspace(1, 0, int(4 * SR))
        place(pad * pad_env, 0.0, vol=0.08)

    # ── Basse synthétique ──
    # Ligne de basse Am pentatonique
    bass_pattern_notes = ['A2', 'A2', 'E3', 'G2', 'A2', 'A2', 'C3', 'A2']
    bass_durs = [0.5, 0.5, 0.25, 0.25, 0.5, 0.5, 0.5, 0.5]

    def bass_note(freq, d):
        s = saw(freq, d) * 0.5 + sine(freq, d) * 0.5
        env = env_adsr(len(s), a=0.01, d=0.08, s=0.6, r=0.1, total=d)
        return lp(s * env, 400)

    bass_buf = note_seq(bass_pattern_notes, bass_durs, bpm, bass_note)
    bass_total_beats = sum(bass_durs)
    n_bass_loops = int(np.ceil((duration - 4) * bpm / 60 / bass_total_beats))
    bass_long = np.tile(bass_buf, n_bass_loops)[:int((duration - 4) * SR)]
    bass_long = fade_in(bass_long, 2.0)
    bass_long = fade_out(bass_long, 2.0)
    place(bass_long, 4.0, vol=0.55)

    # ── Batterie ──
    n_beats_total = int(duration * bpm / 60)
    kick_snd = kick(0.4, 160, 45, 1.2)
    snare_snd = snare(0.3, 1.0)
    hh_c = hihat_closed(0.07)
    hh_o = hihat_open(0.3)

    # Kick pattern : beats 1 & 3 of each bar + extra sur les drops
    # Snare : beats 2 & 4
    # HH closed : toutes les 8th (double temps)

    for bar_idx in range(int(duration / bar)):
        t0 = bar_idx * bar
        kick_times = [t0, t0 + beat * 2]
        snare_times = [t0 + beat, t0 + beat * 3]
        hh_times = [t0 + beat * k / 2 for k in range(8)]

        # Intro légère (premiers 2 bars)
        if bar_idx < 2:
            place(kick_snd, kick_times[0], 0.4)
            place(snare_snd, snare_times[0], 0.2)
            place(hh_c, hh_times[0], 0.2)
            continue

        # Build progressif bars 2-6
        vol_k = min(1.0, 0.5 + bar_idx * 0.1)
        vol_s = min(1.0, 0.3 + bar_idx * 0.1)
        vol_h = min(0.8, 0.2 + bar_idx * 0.08)

        for kt in kick_times:
            if kt + 0.4 <= duration:
                place(kick_snd, kt, vol_k)
        for st in snare_times:
            if st + 0.3 <= duration:
                place(snare_snd, st, vol_s)
        for ht in hh_times:
            if ht + 0.1 <= duration:
                vol_hh = vol_h * (0.7 if int(ht / (beat / 2)) % 2 == 1 else 1.0)
                place(hh_c, ht, vol_hh)

        # Open hihat sur offbeats en phase de peak (bars 6-18)
        if 6 <= bar_idx <= 18:
            for ht in [t0 + beat * 1.5, t0 + beat * 3.5]:
                if ht + 0.3 <= duration:
                    place(hh_o, ht, 0.5)

        # Clap sur snare en phase peak
        if 6 <= bar_idx:
            for st in snare_times:
                if st + 0.3 <= duration:
                    place(clap(0.3), st, 0.4)

    # ── Lead Synthé (arpeggios AM) ──
    arp_notes = ['A4', 'C5', 'E5', 'G5', 'A5', 'G5', 'E5', 'C5']
    arp_dur_beat = 0.25
    arp_step = arp_dur_beat * beat

    def lead_note(freq, d):
        s = fm_synth(freq, 2.0, 2.5, d, env_a=0.005, env_r=0.08)
        return lp(s, 6000)

    arp_buf_parts = []
    for n in arp_notes:
        arp_buf_parts.append(lead_note(NOTES[n], arp_step * 0.9))

    arp_buf = np.concatenate(arp_buf_parts)
    n_arp_loops = int(np.ceil((duration - 8) * SR / len(arp_buf))) + 1
    arp_long = np.tile(arp_buf, n_arp_loops)[:int((duration - 8) * SR)]
    arp_long = fade_in(arp_long, 1.5)
    arp_long = fade_out(arp_long, 2.0)
    place(arp_long, 8.0, vol=0.28)

    # ── Chords plaqués ──
    chord_freqs = [
        [NOTES['A3'], NOTES['C4'], NOTES['E4']],  # Am
        [NOTES['G3'], NOTES['B3'], NOTES['D4']],  # G
        [NOTES['F3'], NOTES['A3'], NOTES['C4']],  # F
        [NOTES['E3'], NOTES['G3'], NOTES['B3']],  # Em
    ]
    chord_dur_beats = 4
    chord_dur_s = chord_dur_beats * beat

    def chord_note(freq, d):
        s = pad_synth(freq, d, voices=3, detune=0.004)
        return s

    for ci, chord in enumerate(chord_freqs * int(np.ceil(duration / (chord_dur_s * 4)))):
        t_start = ci * chord_dur_s + 8.0
        if t_start >= duration - 1:
            break
        d = min(chord_dur_s, duration - t_start - 0.1)
        for freq in chord:
            cs = chord_note(freq, d)
            cs = fade_in(cs, 0.05)
            cs = fade_out(cs, 0.3)
            place(cs, t_start, vol=0.12)

    # ── Risers & Impacts ──
    # Riser à t=24s (Drop principal)
    def riser(d=4.0):
        tt = t_(d)
        freq = 200 + 2000 * tt / d
        sig = np.sin(2 * np.pi * np.cumsum(freq) / SR)
        n = _rng.standard_normal(len(tt))
        filtered = bp(n, 200, 4000)
        env = tt / d
        return norm(sig * 0.3 + filtered * 0.7) * env

    place(riser(4.0), 20.0, vol=0.35)

    # Impact à t=24s
    def impact(d=1.5):
        tt = t_(d)
        sub = sine(60, d) * np.exp(-tt / 0.3)
        noise_impact = lp(_rng.standard_normal(len(tt)), 300) * np.exp(-tt / 0.05)
        return norm(sub * 0.8 + noise_impact * 0.5)

    place(impact(1.5), 24.0, vol=0.6)

    # Riser final à t=52s
    place(riser(3.0), 52.0, vol=0.25)

    # ── Reverb globale légère ──
    out = out * 0.7  # headroom avant reverb
    out_wet = reverb(out, decay=0.15, delay_ms=25)
    out = out * 0.85 + out_wet * 0.15

    # ── Fade in/out global ──
    out = fade_in(out, 1.5)
    out = fade_out(out, 2.0)

    # ── Normalisation finale ──
    return norm(out, peak=0.82)


# ─── Style CORPORATE ──────────────────────────────────────────────────────────

def generate_corporate(duration=60.0, bpm=112):
    """Uplift motivant, propre, pour présentations et pubs corporate"""
    total_n = int(duration * SR)
    out = np.zeros(total_n)
    beat = 60.0 / bpm

    def place(buf, start_s, vol=1.0):
        pos = int(start_s * SR)
        end = min(pos + len(buf), total_n)
        out[pos:end] += buf[:end - pos] * vol

    # Pad chaleureux (C major)
    for freq in [NOTES['C4'], NOTES['E4'], NOTES['G4']]:
        pad = pad_synth(freq, duration, voices=5, detune=0.006)
        pad_env = np.ones(total_n)
        pad_env[:int(3 * SR)] = np.linspace(0, 1, int(3 * SR))
        pad_env[-int(4 * SR):] = np.linspace(1, 0, int(4 * SR))
        place(pad * pad_env, 0.0, vol=0.1)

    # Basse simple
    def bass_note(freq, d):
        s = sine(freq, d) + saw(freq, d) * 0.3
        env = env_adsr(len(s), a=0.02, d=0.1, s=0.7, r=0.15, total=d)
        return lp(s * env, 350)

    bass_notes = ['C3', 'C3', 'G2', 'G2', 'F3', 'F3', 'G2', 'G2']
    bass_durs = [1, 1, 1, 1, 1, 1, 1, 1]
    bass_buf = note_seq(bass_notes, bass_durs, bpm, bass_note)
    n_loops = int(np.ceil(duration * SR / len(bass_buf))) + 1
    bass_long = np.tile(bass_buf, n_loops)[:total_n]
    bass_long = fade_in(bass_long, 3.0)
    bass_long = fade_out(bass_long, 3.0)
    place(bass_long, 0.0, vol=0.5)

    # Batterie légère
    kick_snd = kick(0.5, 140, 50, 1.0)
    snare_snd = snare(0.4, 0.9)
    hh_c = hihat_closed(0.08, 0.5)

    bar = beat * 4
    for bar_idx in range(int(duration / bar)):
        t0 = bar_idx * bar
        vol_prog = min(1.0, 0.4 + bar_idx * 0.07)
        if bar_idx >= 2:
            place(kick_snd, t0, vol_prog * 0.7)
            place(kick_snd, t0 + beat * 2, vol_prog * 0.7)
            place(snare_snd, t0 + beat, vol_prog * 0.6)
            place(snare_snd, t0 + beat * 3, vol_prog * 0.6)
            for k in range(8):
                place(hh_c, t0 + k * beat / 2, vol_prog * 0.4)

    # Mélodie simple piano-like
    mel_notes = ['E5', 'D5', 'C5', 'D5', 'E5', 'E5', 'E5', 'D5', 'D5', 'D5', 'E5', 'G5', 'G5']
    mel_durs = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1.0, 0.5, 0.5, 1.0, 0.5, 0.5, 2.0]

    def piano_note(freq, d):
        s = sine(freq, d) + sine(freq * 2, d) * 0.4 + sine(freq * 3, d) * 0.15
        env = env_adsr(len(s), a=0.005, d=0.3, s=0.3, r=0.4, total=d)
        return s * env

    mel_buf = note_seq(mel_notes, mel_durs, bpm, piano_note)
    n_loops = int(np.ceil((duration - 6) * SR / len(mel_buf))) + 1
    mel_long = np.tile(mel_buf, n_loops)[:int((duration - 6) * SR)]
    mel_long = fade_in(mel_long, 2.0)
    mel_long = fade_out(mel_long, 3.0)
    place(mel_long, 6.0, vol=0.35)

    out = fade_in(out, 2.0)
    out = fade_out(out, 3.0)
    return norm(out, peak=0.82)


# ─── Style CHILL ─────────────────────────────────────────────────────────────

def generate_chill(duration=60.0, bpm=90):
    """Ambient doux, lofi, détendu"""
    total_n = int(duration * SR)
    out = np.zeros(total_n)
    beat = 60.0 / bpm

    def place(buf, start_s, vol=1.0):
        pos = int(start_s * SR)
        end = min(pos + len(buf), total_n)
        out[pos:end] += buf[:end - pos] * vol

    for freq in [NOTES['F3'], NOTES['A3'], NOTES['C4'], NOTES['E4']]:
        pad = pad_synth(freq, duration, voices=8, detune=0.007)
        pad_env = np.ones(total_n)
        pad_env[:int(5 * SR)] = np.linspace(0, 1, int(5 * SR))
        pad_env[-int(5 * SR):] = np.linspace(1, 0, int(5 * SR))
        place(pad * pad_env, 0.0, vol=0.09)

    def bass_note(freq, d):
        s = sine(freq * 0.5, d) + sine(freq, d) * 0.4
        env = env_adsr(len(s), a=0.05, d=0.2, s=0.6, r=0.5, total=d)
        return lp(s * env, 250)

    bass_notes = ['F2', 'C3', 'A2', 'E3', 'F2', 'C3', 'D3', 'C3']
    bass_durs = [2, 1, 1, 2, 1, 1, 1, 1]
    bass_buf = note_seq(bass_notes, bass_durs, bpm, bass_note)
    n_loops = int(np.ceil(duration * SR / len(bass_buf))) + 1
    bass_long = np.tile(bass_buf, n_loops)[:total_n]
    bass_long = fade_in(bass_long, 4.0)
    bass_long = fade_out(bass_long, 4.0)
    place(bass_long, 0.0, vol=0.4)

    # Hihat lofi jitter
    for i in range(int(duration / (beat / 2))):
        t_hh = i * beat / 2 + _rng.uniform(-0.01, 0.01)
        v = _rng.uniform(0.1, 0.4)
        if t_hh >= 0 and t_hh + 0.08 < duration:
            place(hihat_closed(0.08), t_hh, v)

    out = fade_in(out, 3.0)
    out = fade_out(out, 4.0)
    return norm(out, peak=0.75)


# ─── Style CINEMATIC ─────────────────────────────────────────────────────────

def generate_cinematic(duration=60.0, bpm=96):
    """Épique, dramatique, orchestral synthétique"""
    total_n = int(duration * SR)
    out = np.zeros(total_n)
    beat = 60.0 / bpm

    def place(buf, start_s, vol=1.0):
        pos = int(start_s * SR)
        end = min(pos + len(buf), total_n)
        out[pos:end] += buf[:end - pos] * vol

    # Strings synthétiques
    for freq in [NOTES['D3'], NOTES['A3'], NOTES['D4'], NOTES['F4']]:
        s = pad_synth(freq, duration, voices=10, detune=0.012)
        env = np.ones(total_n)
        env[:int(8 * SR)] = np.linspace(0, 1, int(8 * SR))
        env[-int(6 * SR):] = np.linspace(1, 0, int(6 * SR))
        place(s * env, 0.0, vol=0.12)

    # Kick épique
    kick_epic = kick(0.8, 200, 30, 1.5)
    bar = beat * 4
    for bar_idx in range(int(duration / bar)):
        t0 = bar_idx * bar
        if bar_idx >= 4:
            place(kick_epic, t0, 0.8)
            place(kick_epic, t0 + beat * 2, 0.6)
            place(snare(0.5), t0 + beat * 2, 0.7)

    # Riser progressif
    riser_dur = min(duration * 0.5, 30.0)
    tt = t_(riser_dur)
    freq = 100 * np.exp(np.log(1000 / 100) * tt / riser_dur)
    riser = np.sin(2 * np.pi * np.cumsum(freq) / SR) * (tt / riser_dur) * 0.4
    place(riser, 0.0, vol=0.3)

    out = fade_in(out, 4.0)
    out = fade_out(out, 5.0)
    return norm(out, peak=0.82)


# ─── Style DYNAMIC ───────────────────────────────────────────────────────────

def generate_dynamic(duration=60.0, bpm=140):
    """Énergie, BPM élevé, action"""
    total_n = int(duration * SR)
    out = np.zeros(total_n)
    beat = 60.0 / bpm

    def place(buf, start_s, vol=1.0):
        pos = int(start_s * SR)
        end = min(pos + len(buf), total_n)
        out[pos:end] += buf[:end - pos] * vol

    # Bass drive
    def bass_note(freq, d):
        s = saw(freq, d) * 0.8 + square(freq, d) * 0.2
        env = env_adsr(len(s), a=0.005, d=0.05, s=0.7, r=0.05, total=d)
        return lp(s * env, 500)

    bass_notes = ['A2', 'A2', 'G2', 'G2', 'E2', 'E2', 'F2', 'G2']
    bass_durs = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]
    bass_buf = note_seq(bass_notes, bass_durs, bpm, bass_note)
    n_loops = int(np.ceil(duration * SR / len(bass_buf))) + 1
    bass_long = np.tile(bass_buf, n_loops)[:total_n]
    bass_long = fade_in(bass_long, 1.0)
    bass_long = fade_out(bass_long, 1.5)
    place(bass_long, 0.0, vol=0.6)

    # Batterie agressive
    kick_snd = kick(0.3, 200, 40, 1.4)
    snare_snd = snare(0.2, 1.1)
    hh = hihat_closed(0.05)

    bar = beat * 4
    for bar_idx in range(int(duration / bar)):
        t0 = bar_idx * bar
        for b in [0, 0.5, 1.5, 2, 2.5, 3]:
            if t0 + b * beat + 0.3 < duration:
                place(kick_snd, t0 + b * beat, 0.9)
        for b in [1, 3]:
            if t0 + b * beat + 0.2 < duration:
                place(snare_snd, t0 + b * beat, 0.85)
        for b in range(8):
            if t0 + b * beat / 2 + 0.05 < duration:
                place(hh, t0 + b * beat / 2, 0.5)

    # Lead agressive
    def lead_note(freq, d):
        s = square(freq, d) * 0.6 + saw(freq, d) * 0.4
        env = env_adsr(len(s), a=0.003, d=0.05, s=0.6, r=0.08, total=d)
        return lp(s * env, 4000)

    lead_notes = ['A4', 'A4', 'G4', 'E4', 'G4', 'A4']
    lead_durs = [0.25, 0.25, 0.5, 0.25, 0.25, 0.5]
    lead_buf = note_seq(lead_notes, lead_durs, bpm, lead_note)
    n_loops = int(np.ceil((duration - 4) * SR / len(lead_buf))) + 1
    lead_long = np.tile(lead_buf, n_loops)[:int((duration - 4) * SR)]
    lead_long = fade_in(lead_long, 1.0)
    lead_long = fade_out(lead_long, 1.5)
    place(lead_long, 4.0, vol=0.35)

    out = fade_in(out, 1.0)
    out = fade_out(out, 2.0)
    return norm(out, peak=0.82)


# ─── Catalogue de styles ─────────────────────────────────────────────────────

STYLES = {
    'tech': (generate_tech, 124),
    'saas': (generate_tech, 124),
    'ai': (generate_tech, 124),
    'corporate': (generate_corporate, 112),
    'chill': (generate_chill, 90),
    'lofi': (generate_chill, 85),
    'cinematic': (generate_cinematic, 96),
    'epic': (generate_cinematic, 96),
    'dynamic': (generate_dynamic, 140),
    'action': (generate_dynamic, 140),
}


# ─── Export WAV ──────────────────────────────────────────────────────────────

def save_wav(filename, data, sr=SR):
    import wave
    os.makedirs(os.path.dirname(os.path.abspath(filename)), exist_ok=True)
    samples = np.clip(data, -1.0, 1.0)
    int16 = (samples * 32767).astype(np.int16)
    # Stereo légère (légère modulation L/R pour l'espace)
    delay_samp = int(0.012 * sr)  # 12ms delay pour widening
    right = np.concatenate([np.zeros(delay_samp), int16[:len(int16) - delay_samp]])
    stereo = np.stack([int16, right.astype(np.int16)], axis=-1)
    with wave.open(filename, 'w') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(stereo.tobytes())
    return filename


# ─── CLI ─────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Générateur de musique procédurale 100% synthétique')
    parser.add_argument('--style', '-s', type=str, default='tech',
                        choices=list(STYLES.keys()),
                        help='Style musical (défaut: tech)')
    parser.add_argument('--duration', '-d', type=float, default=60.0,
                        help='Durée en secondes (défaut: 60.0)')
    parser.add_argument('--bpm', type=int, default=0,
                        help='BPM personnalisé (0 = utiliser le BPM par défaut du style)')
    parser.add_argument('--out', '-o', type=str, default=None,
                        help='Fichier de sortie .wav (défaut: 01_Assets/Musiques/<style>_<duration>s.wav)')
    parser.add_argument('--list', '-l', action='store_true',
                        help='Lister les styles disponibles')
    args = parser.parse_args()

    if args.list:
        print('\n🎵 STYLES DE MUSIQUE PROCÉDURALE DISPONIBLES :')
        print('=' * 50)
        style_info = {
            'tech/saas/ai': 'Electro moderne, pulsé — SaaS/AI ads (124 BPM)',
            'corporate':    'Uplift motivant, propre — présentations (112 BPM)',
            'chill/lofi':   'Ambient doux, lofi — fond discret (85-90 BPM)',
            'cinematic/epic':'Épique, dramatique — trailers/docs (96 BPM)',
            'dynamic/action':'Énergie, BPM élevé — sports/action (140 BPM)',
        }
        for name, desc in style_info.items():
            print(f'  {name:<20} → {desc}')
        print('=' * 50)
        sys.exit(0)

    gen_fn, default_bpm = STYLES[args.style]
    bpm = args.bpm if args.bpm > 0 else default_bpm

    out_path = args.out
    if not out_path:
        # Chemin par défaut relatif au projet
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(script_dir)
        style_safe = args.style.replace('/', '_')
        out_path = os.path.join(project_root, '01_Assets', 'Musiques',
                                f'{style_safe}_{int(args.duration)}s.wav')

    print(f'\n{"=" * 56}')
    print(f'🎵 GÉNÉRATION DE MUSIQUE PROCÉDURALE')
    print(f'{"=" * 56}')
    print(f'  Style    : {args.style.upper()} | BPM: {bpm}')
    print(f'  Durée    : {args.duration}s')
    print(f'  Sortie   : {out_path}')
    print(f'  SR       : {SR} Hz (stéréo, WAV 16-bit)')
    print(f'{"=" * 56}')
    print(f'⏳ Génération en cours...')

    audio = gen_fn(args.duration, bpm)
    save_wav(out_path, audio, SR)

    size_kb = os.path.getsize(out_path) // 1024
    print(f'✅ Musique générée avec succès !')
    print(f'   📁 Fichier : {out_path} ({size_kb} Ko)')
    print(f'   🎼 Style   : {args.style.upper()} | {bpm} BPM | {args.duration}s | Stéréo WAV 16-bit')
    print(f'{"=" * 56}\n')
