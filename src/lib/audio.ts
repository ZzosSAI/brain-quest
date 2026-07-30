// ─── Procedural Sound Effects using Web Audio API ──────
// No audio files needed — generates sounds in real time.

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'square', volume = 0.08) {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio not available
  }
}

function playNoise(duration: number, volume = 0.05) {
  try {
    const ctx = getContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - i / bufferSize);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  } catch (e) {}
}

function playChord(frequencies: number[], duration: number, volume = 0.06) {
  frequencies.forEach(f => playTone(f, duration, 'square', volume));
}

export function playDiceRoll() {
  playNoise(0.2, 0.08);
  playTone(200, 0.05, 'square', 0.04);
  setTimeout(() => playTone(300, 0.05, 'square', 0.03), 50);
  setTimeout(() => playTone(400, 0.05, 'square', 0.03), 100);
}

export function playCorrect() {
  playChord([523, 659, 784], 0.3, 0.06);
  setTimeout(() => playChord([659, 784, 1047], 0.4, 0.05), 150);
}

export function playWrong() {
  playTone(200, 0.2, 'sawtooth', 0.06);
  setTimeout(() => playTone(150, 0.3, 'sawtooth', 0.04), 100);
}

export function playSnake() {
  playTone(400, 0.15, 'sawtooth', 0.05);
  setTimeout(() => playTone(300, 0.15, 'sawtooth', 0.05), 50);
  setTimeout(() => playTone(200, 0.2, 'sawtooth', 0.05), 100);
  setTimeout(() => playTone(150, 0.3, 'sawtooth', 0.03), 150);
}

export function playLadder() {
  playTone(400, 0.1, 'sine', 0.06);
  setTimeout(() => playTone(523, 0.1, 'sine', 0.06), 80);
  setTimeout(() => playTone(659, 0.1, 'sine', 0.05), 160);
  setTimeout(() => playTone(784, 0.15, 'sine', 0.05), 240);
}

export function playVictory() {
  const notes = [523, 587, 659, 784, 880, 1047];
  notes.forEach((f, i) => {
    setTimeout(() => playChord([f, f * 1.25, f * 1.5], 0.3, 0.06), i * 120);
  });
}

export function playCoin() {
  playTone(880, 0.1, 'sine', 0.06);
  setTimeout(() => playTone(1319, 0.15, 'sine', 0.05), 60);
}

export function playButtonClick() {
  playTone(600, 0.05, 'square', 0.04);
}

export function playCombo(level: number) {
  const base = 523;
  const count = Math.min(level, 7);
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      playTone(base * (1 + i * 0.1), 0.15, 'sine', 0.05);
    }, i * 80);
  }
}

export function startMusic() {
  // Background music placeholder — can be a looping procedural melody
  console.log('🎵 Music system ready');
}

export function stopMusic() {
  console.log('🎵 Music stopped');
}
