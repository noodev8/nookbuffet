'use client';

// The new order sound, made with the Web Audio API so there's no sound file to host.
// Browsers keep sound off until someone clicks or taps the page, so call unlockSound()
// from a click, tap or key press (logging in does this).

let audio = null;

const getAudio = () => {
  if (!audio) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    audio = new AudioContext();
  }
  return audio;
};

// Turns sound on - must be called from a click, tap or key press
export const unlockSound = () => {
  const ctx = getAudio();
  return ctx && ctx.state !== 'running' ? ctx.resume() : Promise.resolve();
};

// A bright "ding-ding-dong", played twice so it's heard over a busy kitchen
export const playChime = () => {
  const ctx = getAudio();
  if (!ctx || ctx.state !== 'running') return;

  const notes = [
    [0, 1047], [0.18, 1319], [0.36, 1568],          // C, E, G
    [1.0, 1047], [1.18, 1319], [1.36, 1568],
  ];
  const start = ctx.currentTime + 0.05;
  for (const [offset, frequency] of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequency;
    const t = start + offset;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.5, t + 0.02);   // quick strike
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6); // ring out
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.65);
  }
};
