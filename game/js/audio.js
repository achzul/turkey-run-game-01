// SoundEngine: every sound in Gobble Dash is synthesized live with WebAudio.
// No audio files, no network: short oscillator envelopes only.
export class SoundEngine {
  constructor() {
    this.context = null;
    this.muted = false;
  }

  ensureContext() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      this.context = new AudioContextClass();
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
    return this.context;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playTone(freqStart, freqEnd, duration, wave, volume, delay) {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const startAt = ctx.currentTime + (delay || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = wave || 'sine';
    osc.frequency.setValueAtTime(freqStart, startAt);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), startAt + duration);
    gain.gain.setValueAtTime(volume || 0.12, startAt);
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + duration + 0.02);
  }

  playJump() {
    this.playTone(280, 620, 0.16, 'sine', 0.12, 0);
  }

  playGobble() {
    this.playTone(520, 340, 0.07, 'square', 0.07, 0);
    this.playTone(460, 300, 0.07, 'square', 0.07, 0.08);
    this.playTone(560, 380, 0.09, 'square', 0.07, 0.16);
  }

  playCorn() {
    this.playTone(880, 1320, 0.1, 'triangle', 0.1, 0);
  }

  playStumble() {
    this.playTone(220, 90, 0.25, 'sawtooth', 0.12, 0);
  }

  playKnifeWhistle() {
    this.playTone(1400, 500, 0.3, 'sine', 0.05, 0);
  }

  playSpotted() {
    this.playTone(180, 180, 0.12, 'square', 0.1, 0);
    this.playTone(180, 180, 0.12, 'square', 0.1, 0.16);
  }

  playCaught() {
    this.playTone(392, 392, 0.18, 'triangle', 0.12, 0);
    this.playTone(330, 330, 0.18, 'triangle', 0.12, 0.2);
    this.playTone(262, 180, 0.5, 'triangle', 0.12, 0.4);
  }

  playEscaped() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, index) => {
      this.playTone(freq, freq, 0.22, 'triangle', 0.12, index * 0.14);
    });
  }

  playClick() {
    this.playTone(700, 700, 0.05, 'square', 0.06, 0);
  }
}
