/**
 * Web Audio API Sound Effects and Ambient Music Synthesizer
 * Zero-dependency, lightweight, instant, cross-browser audio engine
 */

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.6;
  private musicVolume: number = 0.4;
  private activeMusicTimer: number | null = null;
  private currentPreset: string | null = null;
  private customAudioElement: HTMLAudioElement | null = null;
  private isMusicActive: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('panther_sound_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('panther_sound_muted', String(muted));
    }
    if (muted) {
      this.stopMusic();
    }
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.customAudioElement) {
      this.customAudioElement.volume = this.musicVolume;
    }
  }

  // --- SOUND EFFECTS ---

  /** Soft page/slide flip rustle */
  public playPageTurn() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // White noise swoosh with low-pass filter
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + 0.12);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  }

  /** Magical sparkling chime arpeggio */
  public playSparkle() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.18 * this.volume, now + idx * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.4);
    });
  }

  /** Sweet flower pluck / pop chime */
  public playFlowerPop(noteIndex = 0) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const scale = [440, 493.88, 554.37, 659.25, 739.99, 880]; // A major pentatonic
    const freq = scale[noteIndex % scale.length];
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + 0.08);

    gain.gain.setValueAtTime(0.25 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /** Warm kiss / heart pop */
  public playKissHeart() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);

    gain.gain.setValueAtTime(0.22 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  /** Tactile button tap */
  public playButtonClick() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.04);

    gain.gain.setValueAtTime(0.15 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  /** Celebratory sealed gift chord */
  public playSuccessChime() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const chord = [392.0, 493.88, 587.33, 783.99]; // G maj7
    const now = ctx.currentTime;

    chord.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.04);

      gain.gain.setValueAtTime(0, now + i * 0.04);
      gain.gain.linearRampToValueAtTime(0.15 * this.volume, now + i * 0.04 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 1.3);
    });
  }

  /** Beep for voice note recording start/stop */
  public playRecordBeep(isStart = true) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const freq = isStart ? 880 : 440;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.2 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  // --- AMBIENT SYNTHESIZER & MUSIC ENGINE ---

  public startMusicPreset(presetId: string) {
    if (this.isMuted) return;
    this.stopMusic();

    this.currentPreset = presetId;
    this.isMusicActive = true;
    const ctx = this.initContext();
    if (!ctx) return;

    // Pattern definitions (frequencies in Hz)
    const patterns: Record<string, { chords: number[][]; interval: number; type: OscillatorType }> = {
      lullaby: {
        chords: [
          [261.63, 329.63, 392.0, 523.25], // C
          [220.0, 261.63, 329.63, 440.0],  // Am
          [174.61, 220.0, 261.63, 349.23], // F
          [196.0, 246.94, 293.66, 392.0],  // G
        ],
        interval: 3200,
        type: 'sine',
      },
      lofi: {
        chords: [
          [293.66, 349.23, 440.0, 523.25], // Dm7
          [196.0, 246.94, 293.66, 392.0],  // G7
          [261.63, 329.63, 392.0, 493.88], // Cmaj7
          [220.0, 261.63, 329.63, 415.3],  // Am(maj7)
        ],
        interval: 3000,
        type: 'triangle',
      },
      sunset: {
        chords: [
          [329.63, 415.3, 493.88, 659.25], // E
          [277.18, 349.23, 415.3, 554.37], // C#m
          [220.0, 277.18, 329.63, 440.0],  // A
          [246.94, 311.13, 369.99, 493.88], // B
        ],
        interval: 3400,
        type: 'sine',
      },
      rain_piano: {
        chords: [
          [261.63, 392.0, 523.25, 659.25],
          [220.0, 329.63, 440.0, 523.25],
          [174.61, 261.63, 349.23, 440.0],
          [196.0, 293.66, 392.0, 493.88],
        ],
        interval: 2800,
        type: 'sine',
      },
    };

    const pattern = patterns[presetId] || patterns['lullaby'];
    let chordIdx = 0;

    const playChordStep = () => {
      if (!this.isMusicActive || this.isMuted) return;
      const currentCtx = this.initContext();
      if (!currentCtx) return;

      const currentChord = pattern.chords[chordIdx % pattern.chords.length];
      chordIdx++;
      const now = currentCtx.currentTime;

      currentChord.forEach((freq, noteIdx) => {
        const osc = currentCtx.createOscillator();
        const gain = currentCtx.createGain();

        osc.type = pattern.type;
        osc.frequency.setValueAtTime(freq, now + noteIdx * 0.18);

        gain.gain.setValueAtTime(0, now + noteIdx * 0.18);
        gain.gain.linearRampToValueAtTime(0.06 * this.musicVolume, now + noteIdx * 0.18 + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + noteIdx * 0.18 + 2.8);

        osc.connect(gain);
        gain.connect(currentCtx.destination);

        osc.start(now + noteIdx * 0.18);
        osc.stop(now + noteIdx * 0.18 + 3.0);
      });
    };

    // Play first chord immediately
    playChordStep();
    this.activeMusicTimer = window.setInterval(playChordStep, pattern.interval);
  }

  public playCustomAudio(audioUrl: string): HTMLAudioElement | null {
    this.stopMusic();
    if (this.isMuted || !audioUrl) return null;
    try {
      this.customAudioElement = new Audio(audioUrl);
      this.customAudioElement.volume = this.musicVolume;
      this.customAudioElement.loop = true;
      this.customAudioElement.preload = 'auto';
      
      const playPromise = this.customAudioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isMusicActive = true;
          })
          .catch((e) => {
            console.warn('Audio auto-play waiting for user interaction:', e);
            this.isMusicActive = false;
          });
      }
      return this.customAudioElement;
    } catch (e) {
      console.error('Failed to play custom audio:', e);
      return null;
    }
  }

  public stopMusic() {
    this.isMusicActive = false;
    if (this.activeMusicTimer !== null) {
      clearInterval(this.activeMusicTimer);
      this.activeMusicTimer = null;
    }
    if (this.customAudioElement) {
      this.customAudioElement.pause();
      this.customAudioElement.currentTime = 0;
      this.customAudioElement = null;
    }
  }

  public toggleMusic(presetOrUrl?: string): boolean {
    if (this.isMusicActive) {
      this.stopMusic();
      return false;
    } else {
      if (presetOrUrl && presetOrUrl.startsWith('http')) {
        this.playCustomAudio(presetOrUrl);
      } else {
        this.startMusicPreset(presetOrUrl || 'lullaby');
      }
      return true;
    }
  }

  public isPlaying(): boolean {
    return this.isMusicActive;
  }

  public getCurrentPreset(): string | null {
    return this.currentPreset;
  }
}

export const soundFx = new SoundEffectsEngine();

export const MUSIC_PRESETS = [
  { id: 'lullaby', name: 'Starlight Lullaby', icon: 'nightlight', desc: 'Calm ambient Rhodes chords with gentle celestial tones' },
  { id: 'lofi', name: 'Cozy Lofi Sunset', icon: 'coffee', desc: 'Warm 7th chords with relaxed, nostalgic tempo' },
  { id: 'sunset', name: 'Golden Hour Dream', icon: 'wb_sunny', desc: 'Bright acoustic harmonies filled with romantic warmth' },
  { id: 'rain_piano', name: 'Gentle Rain Chimes', icon: 'water_drop', desc: 'Peaceful piano notes drifting like soft raindrops' },
];
