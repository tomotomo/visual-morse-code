import { MORSE_MAP } from './morse-engine.js';

const DEFAULTS = {
  dotDuration: 0.08,
  dashDuration: 0.24,
  symbolGap: 0.04,
  charGap: 0.12,
  wordGap: 0.28,
  dotFrequency: 760,
  dashFrequency: 700
};

export function createAudioPlayer(options = {}) {
  const config = { ...DEFAULTS, ...options };
  let audioContext = null;
  let playbackTimeouts = [];
  let playbackOscillators = [];

  function getAudioContext() {
    if (!audioContext) {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) {
        return null;
      }
      audioContext = new AudioContextCtor();
    }

    return audioContext;
  }

  function stopScheduledPlayback() {
    playbackTimeouts.forEach((handle) => clearTimeout(handle));
    playbackTimeouts = [];

    playbackOscillators.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch (error) {
        // ignore
      }
    });
    playbackOscillators = [];
  }

  function scheduleTone(ctx, startTime, duration, frequency) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);

    playbackOscillators.push(oscillator);
    return startTime + duration + config.symbolGap;
  }

  function stopPlayback() {
    stopScheduledPlayback();

    if (audioContext) {
      audioContext.close().catch(() => {});
      audioContext = null;
    }
  }

  function playImmediateSymbol(symbol) {
    const ctx = getAudioContext();
    if (!ctx) {
      return;
    }

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const startTime = ctx.currentTime;
    const duration = symbol === '.' ? config.dotDuration : config.dashDuration;
    const frequency = symbol === '.' ? config.dotFrequency : config.dashFrequency;

    scheduleTone(ctx, startTime, duration, frequency);
  }

  function playMorseText(text, onHighlight, onFinish) {
    stopPlayback();

    const ctx = getAudioContext();
    if (!ctx || !text) {
      return;
    }

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const normalized = text.trim();
    if (!normalized) {
      return;
    }

    let currentTime = ctx.currentTime;

    for (let index = 0; index < normalized.length; index += 1) {
      const char = normalized[index];

      if (/\s/.test(char)) {
        currentTime += config.wordGap;
        continue;
      }

      const morseCode = MORSE_MAP[char.toUpperCase()];
      if (!morseCode) {
        currentTime += config.charGap;
        continue;
      }

      const charStart = currentTime;
      playbackTimeouts.push(setTimeout(() => {
        if (typeof onHighlight === 'function') {
          onHighlight(index);
        }
      }, charStart * 1000));

      for (const symbol of morseCode) {
        currentTime = scheduleTone(
          ctx,
          currentTime,
          symbol === '.' ? config.dotDuration : config.dashDuration,
          symbol === '.' ? config.dotFrequency : config.dashFrequency
        );
      }

      currentTime += config.charGap;
    }

    playbackTimeouts.push(setTimeout(() => {
      stopPlayback();
      if (typeof onFinish === 'function') {
        onFinish();
      }
    }, (currentTime - ctx.currentTime) * 1000));
  }

  return {
    playImmediateSymbol,
    playMorseText,
    stop: stopPlayback
  };
}
