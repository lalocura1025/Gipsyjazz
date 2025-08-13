import { STRING_FREQUENCIES } from './config.js';

export class AudioPlayer {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = true;
  }

  toggleSound(isEnabled) {
    this.soundEnabled = isEnabled;
  }

  playNote(stringIndex, fret) {
    if (!this.soundEnabled) return;

    if (!this.audioCtx) {
      try {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.error('Web Audio API is not supported in this browser.');
        return;
      }
    }

    const frequency = STRING_FREQUENCIES[stringIndex] * Math.pow(2, fret / 12);
    const oscillator = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    gain.connect(this.audioCtx.destination);

    gain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, this.audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1);

    oscillator.start(this.audioCtx.currentTime);
    oscillator.stop(this.audioCtx.currentTime + 1);
  }
}
