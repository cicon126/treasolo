let synth: SpeechSynthesis | null = null;
let speechSupported = false;
let audioCtx: AudioContext | null = null;

if (typeof window !== 'undefined') {
  if ('speechSynthesis' in window) {
    synth = window.speechSynthesis;
    speechSupported = true;
  }
}

function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AC();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function speak(text: string, rate: number = 1.0, pitch: number = 1.0, volume: number = 0.8): void {
  if (!synth || !speechSupported) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;
  synth.speak(utterance);
}

interface Note {
  freq: number;
  start: number;
  dur: number;
  type?: OscillatorType;
  vol?: number;
}

function playMelody(notes: Note[]): void {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  notes.forEach(n => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = n.type ?? 'sine';
    osc.frequency.setValueAtTime(n.freq, now + n.start);
    const vol = n.vol ?? 0.18;
    gain.gain.setValueAtTime(0, now + n.start);
    gain.gain.linearRampToValueAtTime(vol, now + n.start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + n.start + n.dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + n.start);
    osc.stop(now + n.start + n.dur + 0.05);
  });
}

function playVictoryMusic(): void {
  const C5 = 523.25, E5 = 659.25, G5 = 783.99, C6 = 1046.5, E6 = 1318.51, G6 = 1567.98;
  const melody: Note[] = [
    { freq: C5, start: 0.00, dur: 0.15, type: 'triangle', vol: 0.22 },
    { freq: E5, start: 0.14, dur: 0.15, type: 'triangle', vol: 0.22 },
    { freq: G5, start: 0.28, dur: 0.15, type: 'triangle', vol: 0.22 },
    { freq: C6, start: 0.42, dur: 0.25, type: 'triangle', vol: 0.25 },
    { freq: E6, start: 0.70, dur: 0.18, type: 'triangle', vol: 0.22 },
    { freq: G6, start: 0.90, dur: 0.45, type: 'triangle', vol: 0.28 },
  ];
  const bass: Note[] = [
    { freq: 130.81, start: 0.00, dur: 0.30, type: 'sine', vol: 0.12 },
    { freq: 196.00, start: 0.30, dur: 0.30, type: 'sine', vol: 0.12 },
    { freq: 261.63, start: 0.60, dur: 0.30, type: 'sine', vol: 0.12 },
    { freq: 392.00, start: 0.90, dur: 0.50, type: 'sine', vol: 0.14 },
  ];
  const sparkle: Note[] = [
    { freq: 2093.0, start: 0.45, dur: 0.10, type: 'sine', vol: 0.08 },
    { freq: 2637.0, start: 0.60, dur: 0.10, type: 'sine', vol: 0.08 },
    { freq: 3136.0, start: 0.95, dur: 0.15, type: 'sine', vol: 0.10 },
  ];
  playMelody([...melody, ...bass, ...sparkle]);
}

function playGameOverMusic(): void {
  const E4 = 329.63, D4 = 293.66, C4 = 261.63, B3 = 246.94, A3 = 220.0, G3 = 196.0, F3 = 174.61, E3 = 164.81;
  const melody: Note[] = [
    { freq: E4, start: 0.00, dur: 0.35, type: 'sawtooth', vol: 0.14 },
    { freq: D4, start: 0.32, dur: 0.35, type: 'sawtooth', vol: 0.14 },
    { freq: C4, start: 0.64, dur: 0.45, type: 'sawtooth', vol: 0.14 },
    { freq: B3, start: 1.10, dur: 0.30, type: 'triangle', vol: 0.16 },
    { freq: A3, start: 1.38, dur: 0.30, type: 'triangle', vol: 0.16 },
    { freq: G3, start: 1.66, dur: 0.60, type: 'triangle', vol: 0.18 },
  ];
  const bass: Note[] = [
    { freq: 82.41,  start: 0.00, dur: 0.50, type: 'sine', vol: 0.14 },
    { freq: 65.41,  start: 0.50, dur: 0.50, type: 'sine', vol: 0.14 },
    { freq: F3 / 2, start: 1.00, dur: 0.50, type: 'sine', vol: 0.12 },
    { freq: E3 / 2, start: 1.50, dur: 0.80, type: 'sine', vol: 0.14 },
  ];
  playMelody([...melody, ...bass]);
}

function playEatChime(): void {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  [880, 1320].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, now + i * 0.04);
    gain.gain.setValueAtTime(0, now + i * 0.04);
    gain.gain.linearRampToValueAtTime(0.12, now + i * 0.04 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + i * 0.04);
    osc.stop(now + i * 0.04 + 0.2);
  });
}

function playLoseChime(): void {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  [440, 330].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(f, now + i * 0.1);
    gain.gain.setValueAtTime(0, now + i * 0.1);
    gain.gain.linearRampToValueAtTime(0.1, now + i * 0.1 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.3);
  });
}

export const speech = {
  startLevel(level: number): void {
    getAudioCtx();
    speak(`第${level}关，开始！`);
  },
  eatFood(): void {
    playEatChime();
  },
  levelVictory(): void {
    playVictoryMusic();
    setTimeout(() => speak('恭喜通关！', 0.95, 1.15, 0.8), 250);
  },
  loseLife(): void {
    playLoseChime();
    setTimeout(() => speak('小心！', 1.0, 0.8, 0.7), 120);
  },
  gameOver(): void {
    playGameOverMusic();
    setTimeout(() => speak('游戏结束', 0.85, 0.7, 0.8), 300);
  },
  pause(): void {
    speak('游戏暂停');
  },
  resume(): void {
    speak('继续游戏');
  },
  cancel(): void {
    if (synth) synth.cancel();
  },
};
