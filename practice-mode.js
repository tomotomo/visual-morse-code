import { getDecodedChar, isValidPath, morseTree } from './morse-engine.js';
import { createAudioPlayer } from './audio-player.js';

const TIMER_MS = 1000;
const TIMER_TICK = 50;

export function createPracticeMode(elements) {
  const audioPlayer = createAudioPlayer();

  let currentPath = '';
  let currentOutput = '';
  let activeOutputIndex = -1;
  let timerHandle = null;
  let timerStart = 0;

  function renderOutput() {
    elements.outputDisplay.innerHTML = '';

    if (!currentOutput) {
      const empty = document.createElement('span');
      empty.className = 'output-empty';
      empty.textContent = '(empty)';
      elements.outputDisplay.appendChild(empty);
      return;
    }

    [...currentOutput].forEach((char, index) => {
      const span = document.createElement('span');
      span.className = 'output-char';
      span.textContent = char;
      if (index === activeOutputIndex) {
        span.classList.add('playing');
      }
      elements.outputDisplay.appendChild(span);
    });
  }

  function resetTimer() {
    clearInterval(timerHandle);
    timerHandle = null;
    elements.progressFill.style.width = '0%';
    elements.timerLabel.textContent = '1.0s';
  }

  function startTimer() {
    resetTimer();
    timerStart = performance.now();
    timerHandle = setInterval(() => {
      const elapsed = performance.now() - timerStart;
      const remaining = Math.max(0, TIMER_MS - elapsed);
      const ratio = remaining / TIMER_MS;

      elements.progressFill.style.width = `${ratio * 100}%`;
      elements.timerLabel.textContent = `${(remaining / 1000).toFixed(1)}s`;

      if (remaining <= 0) {
        clearInterval(timerHandle);
        timerHandle = null;
        commitCurrentPath();
      }
    }, TIMER_TICK);
  }

  function renderTree() {
    elements.svg.innerHTML = '';

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const glow = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    glow.setAttribute('id', 'glow');
    const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    blur.setAttribute('stdDeviation', '3');
    glow.appendChild(blur);
    defs.appendChild(glow);
    elements.svg.appendChild(defs);

    const edgeElements = [];
    const nodeElements = [];

    function findNodeById(id) {
      const stack = [morseTree];

      while (stack.length) {
        const current = stack.pop();
        if (!current) {
          continue;
        }
        if (current.id === id) {
          return current;
        }
        if (current.dot) {
          stack.push(current.dot);
        }
        if (current.dash) {
          stack.push(current.dash);
        }
      }

      return morseTree;
    }

    function walk(node, parentId = null) {
      if (!node) {
        return;
      }

      if (parentId && node.id !== 'START') {
        const parent = findNodeById(parentId);
        const edge = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        edge.setAttribute('id', `edge-${parentId}-${node.id}`);
        edge.setAttribute('class', node.type === 'dash' ? 'edge edge-dash' : 'edge');
        edge.setAttribute('x1', parent.x);
        edge.setAttribute('y1', parent.y);
        edge.setAttribute('x2', node.x);
        edge.setAttribute('y2', node.y);
        edgeElements.push(edge);

        if (node.type === 'dash') {
          const dx = node.x - parent.x;
          const dy = node.y - parent.y;
          const cx = (parent.x + node.x) / 2;
          const cy = (parent.y + node.y) / 2;
          const length = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          bar.setAttribute('id', `edge-bar-${parentId}-${node.id}`);
          bar.setAttribute('class', 'edge-bar');
          bar.setAttribute('x', cx - length / 2);
          bar.setAttribute('y', cy - 5);
          bar.setAttribute('width', Math.max(24, length * 0.8));
          bar.setAttribute('height', 10);
          bar.setAttribute('rx', 5);
          bar.setAttribute('transform', `rotate(${angle} ${cx} ${cy})`);
          edgeElements.push(bar);
        }
      }

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('id', `node-${node.id}`);
      circle.setAttribute('class', 'node');
      circle.setAttribute('cx', node.x);
      circle.setAttribute('cy', node.y);
      circle.setAttribute('r', node.id === 'START' ? 10 : 14);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('class', node.id === 'START' ? 'label-root' : 'label');
      label.setAttribute('x', node.x);
      label.setAttribute('y', node.y + 5);
      label.textContent = node.label;

      nodeElements.push(circle, label);

      if (node.dot) {
        walk(node.dot, node.id);
      }
      if (node.dash) {
        walk(node.dash, node.id);
      }
    }

    walk(morseTree);
    edgeElements.forEach((el) => elements.svg.appendChild(el));
    nodeElements.forEach((el) => elements.svg.appendChild(el));
  }

  function updateVisualization() {
    document.querySelectorAll('.node, .edge, .edge-bar').forEach((el) => el.classList.remove('active'));

    const startNode = document.getElementById('node-START');
    if (startNode) {
      startNode.classList.add('active');
    }

    if (!currentPath) {
      elements.inputBuffer.classList.remove('error');
      return;
    }

    let current = morseTree;

    for (const symbol of currentPath) {
      const next = symbol === '.' ? current.dot : current.dash;
      if (!next) {
        elements.inputBuffer.classList.add('error');
        return;
      }

      const edge = document.getElementById(`edge-${current.id}-${next.id}`);
      const bar = document.getElementById(`edge-bar-${current.id}-${next.id}`);
      if (edge) {
        edge.classList.add('active');
      }
      if (bar) {
        bar.classList.add('active');
      }

      const node = document.getElementById(`node-${next.id}`);
      if (node) {
        node.classList.add('active');
      }

      current = next;
    }

    elements.inputBuffer.classList.toggle('error', !isValidPath(currentPath));
  }

  function commitCurrentPath() {
    resetTimer();

    if (!currentPath) {
      updateVisualization();
      return;
    }

    const decoded = getDecodedChar(currentPath);
    if (!decoded) {
      elements.inputBuffer.classList.add('error');
      elements.inputBuffer.textContent = currentPath;
      return;
    }

    elements.inputBuffer.classList.remove('error');
    currentOutput += decoded;
    renderOutput();
    currentPath = '';
    elements.inputBuffer.textContent = '(waiting)';
    updateVisualization();
  }

  function clearAll() {
    audioPlayer.stop();
    currentPath = '';
    currentOutput = '';
    activeOutputIndex = -1;
    resetTimer();
    elements.inputBuffer.textContent = '(waiting)';
    elements.inputBuffer.classList.remove('error');
    renderOutput();
    updateVisualization();
  }

  function appendSymbol(symbol) {
    currentPath += symbol;
    elements.inputBuffer.textContent = currentPath;
    audioPlayer.playImmediateSymbol(symbol);
    updateVisualization();
    startTimer();
  }

  function playCurrentOutput() {
    audioPlayer.playMorseText(
      currentOutput,
      (index) => {
        activeOutputIndex = index;
        renderOutput();
      },
      () => {
        activeOutputIndex = -1;
        renderOutput();
      }
    );
  }

  function handleKeydown(event) {
    const key = event.key;

    if (['.', 'F', 'f', 'J', 'j'].includes(key)) {
      event.preventDefault();
      appendSymbol('.');
    } else if (['-', 'D', 'd', 'K', 'k'].includes(key)) {
      event.preventDefault();
      appendSymbol('-');
    } else if (key === ' ') {
      event.preventDefault();
      commitCurrentPath();
    } else if (key === 'Escape' || key === 'Backspace') {
      event.preventDefault();
      clearAll();
    }
  }

  function bindEvents() {
    elements.dotBtn.addEventListener('click', () => appendSymbol('.'));
    elements.dashBtn.addEventListener('click', () => appendSymbol('-'));
    elements.playOutputBtn.addEventListener('click', playCurrentOutput);
    elements.clearBtn.addEventListener('click', clearAll);
    window.addEventListener('keydown', handleKeydown);
  }

  function init() {
    renderOutput();
    renderTree();
    updateVisualization();
    bindEvents();
  }

  return {
    init,
    clearAll,
    appendSymbol,
    commitCurrentPath,
    playCurrentOutput
  };
}
