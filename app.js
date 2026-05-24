import { createPracticeMode } from './practice-mode.js';

const practiceMode = createPracticeMode({
  svg: document.getElementById('morse-svg'),
  inputBuffer: document.getElementById('input-buffer'),
  progressFill: document.getElementById('progress-fill'),
  timerLabel: document.getElementById('timer-label'),
  outputDisplay: document.getElementById('output-display'),
  playOutputBtn: document.getElementById('play-output-btn'),
  dotBtn: document.getElementById('dot-btn'),
  dashBtn: document.getElementById('dash-btn'),
  clearBtn: document.getElementById('clear-btn')
});

practiceMode.init();
