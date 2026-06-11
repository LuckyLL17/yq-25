import { loadSettings } from './utils/storage';

type SFXType = 'hit' | 'skill' | 'chest' | 'stairs' | 'damage' | 'death' | 'menu_click' | 'menu_hover' | 'level_up' | 'pickup' | 'shoot' | 'explosion';

class AudioManager {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmPlaying: boolean = false;
  private bgmOscillators: OscillatorNode[] = [];
  private bgmInterval: number | null = null;
  private bgmStep: number = 0;

  private ensureContext() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.bgmGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.bgmGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
      this.applyVolumes();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  applyVolumes() {
    const settings = loadSettings();
    if (this.bgmGain) {
      this.bgmGain.gain.value = settings.bgmEnabled ? settings.bgmVolume * 0.3 : 0;
    }
    if (this.sfxGain) {
      this.sfxGain.gain.value = settings.sfxEnabled ? settings.sfxVolume * 0.5 : 0;
    }
  }

  startBGM() {
    this.ensureContext();
    if (this.bgmPlaying) return;
    this.bgmPlaying = true;
    this.bgmStep = 0;

    const settings = loadSettings();
    if (!settings.bgmEnabled) return;

    this.playBGMLoop();
  }

  private playBGMLoop() {
    if (!this.ctx || !this.bgmGain) return;

    this.stopBGMOscillators();

    const bpm = 100;
    const stepDuration = (60 / bpm) * 1000;

    const scale = [130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63];
    const melody = [0, 2, 4, 5, 4, 2, 0, 4, 5, 7, 5, 4, 2, 0, 2, 4];
    const bass = [0, 0, 3, 3, 4, 4, 0, 0];

    this.bgmInterval = window.setInterval(() => {
      if (!this.bgmPlaying || !this.ctx || !this.bgmGain) {
        this.stopBGM();
        return;
      }

      const settings = loadSettings();
      if (!settings.bgmEnabled) return;

      const step = this.bgmStep % melody.length;

      const melodyFreq = scale[melody[step] % scale.length];
      this.playTone(melodyFreq, 'sine', stepDuration * 0.8, 0.15);

      if (step % 2 === 0) {
        const bassStep = (this.bgmStep / 2) % bass.length;
        const bassFreq = scale[bass[Math.floor(bassStep)] % scale.length] / 2;
        this.playTone(bassFreq, 'triangle', stepDuration * 1.6, 0.2);
      }

      if (step % 4 === 0) {
        this.playTone(scale[0] / 4, 'sine', stepDuration * 0.3, 0.05);
      }

      this.bgmStep++;
    }, stepDuration);
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number) {
    if (!this.ctx || !this.bgmGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;

    osc.connect(gain);
    gain.connect(this.bgmGain!);

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);

    osc.start(now);
    osc.stop(now + duration / 1000);

    this.bgmOscillators.push(osc);
    osc.onended = () => {
      const idx = this.bgmOscillators.indexOf(osc);
      if (idx >= 0) this.bgmOscillators.splice(idx, 1);
    };
  }

  private stopBGMOscillators() {
    for (const osc of this.bgmOscillators) {
      try { osc.stop(); } catch (_) {}
    }
    this.bgmOscillators = [];
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.stopBGMOscillators();
  }

  pauseBGM() {
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  resumeBGM() {
    if (this.bgmPlaying && !this.bgmInterval) {
      this.playBGMLoop();
    }
  }

  playSFX(type: SFXType) {
    this.ensureContext();
    const settings = loadSettings();
    if (!settings.sfxEnabled || !this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    switch (type) {
      case 'hit': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'skill': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
      case 'chest': {
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, now + i * 0.1);
          gain.gain.linearRampToValueAtTime(0.2, now + i * 0.1 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
          osc.connect(gain);
          gain.connect(this.sfxGain!);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.3);
        });
        break;
      }
      case 'stairs': {
        [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, now + i * 0.12);
          gain.gain.linearRampToValueAtTime(0.25, now + i * 0.12 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.35);
          osc.connect(gain);
          gain.connect(this.sfxGain!);
          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 0.35);
        });
        break;
      }
      case 'damage': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case 'death': {
        [400, 350, 300, 200, 150].forEach((freq, i) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sawtooth';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, now + i * 0.15);
          gain.gain.linearRampToValueAtTime(0.2, now + i * 0.15 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.3);
          osc.connect(gain);
          gain.connect(this.sfxGain!);
          osc.start(now + i * 0.15);
          osc.stop(now + i * 0.15 + 0.3);
        });
        break;
      }
      case 'menu_click': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = 600;
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }
      case 'menu_hover': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 500;
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }
      case 'level_up': {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, now + i * 0.08);
          gain.gain.linearRampToValueAtTime(0.25, now + i * 0.08 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);
          osc.connect(gain);
          gain.connect(this.sfxGain!);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.4);
        });
        break;
      }
      case 'pickup': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'shoot': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case 'explosion': {
        const bufferSize = this.ctx.sampleRate * 0.3;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const source = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        source.buffer = buffer;
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        source.connect(gain);
        gain.connect(this.sfxGain);
        source.start(now);
        break;
      }
    }
  }
}

let audioManagerInstance: AudioManager | null = null;

export const getAudioManager = (): AudioManager => {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager();
  }
  return audioManagerInstance;
};
