export const MORSE_MAP = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
  I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
  Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..', 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-',
  5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.'
};

export const morseTree = {
  id: 'START', label: '★', type: 'root', x: 400, y: 100,
  dot: {
    id: 'E', label: 'E', type: 'dot', x: 300, y: 100,
    dot: {
      id: 'I', label: 'I', type: 'dot', x: 200, y: 100,
      dot: {
        id: 'S', label: 'S', type: 'dot', x: 120, y: 100,
        dot: {
          id: 'H', label: 'H', type: 'dot', x: 70, y: 100,
          dot: { id: '5', label: '5', type: 'dot', x: 20, y: 100 },
          dash: { id: '4', label: '4', type: 'dash', x: 70, y: 160 }
        },
        dash: { id: 'V', label: 'V', type: 'dash', x: 120, y: 240, dash: { id: '3', label: '3', type: 'dash', x: 120, y: 320 } }
      },
      dash: {
        id: 'U', label: 'U', type: 'dash', x: 200, y: 180,
        dot: { id: 'F', label: 'F', type: 'dot', x: 160, y: 180 },
        dash: { id: '_U', label: '', type: 'dash', x: 200, y: 260, dash: { id: '2', label: '2', type: 'dash', x: 200, y: 320 } }
      }
    },
    dash: {
      id: 'A', label: 'A', type: 'dash', x: 300, y: 200,
      dot: {
        id: 'R', label: 'R', type: 'dot', x: 340, y: 240,
        dot: { id: 'L', label: 'L', type: 'dot', x: 340, y: 300 }
      },
      dash: {
        id: 'W', label: 'W', type: 'dash', x: 300, y: 340,
        dot: { id: 'P', label: 'P', type: 'dot', x: 240, y: 340 },
        dash: {
          id: 'J', label: 'J', type: 'dash', x: 300, y: 440,
          dash: { id: '1', label: '1', type: 'dash', x: 300, y: 520 }
        }
      }
    }
  },
  dash: {
    id: 'T', label: 'T', type: 'dash', x: 500, y: 100,
    dot: {
      id: 'N', label: 'N', type: 'dot', x: 500, y: 200,
      dot: {
        id: 'D', label: 'D', type: 'dot', x: 500, y: 340,
        dot: { id: 'B', label: 'B', type: 'dot', x: 500, y: 440, dot: { id: '6', label: '6', type: 'dot', x: 500, y: 520 } },
        dash: { id: 'X', label: 'X', type: 'dash', x: 560, y: 340 }
      },
      dash: {
        id: 'K', label: 'K', type: 'dash', x: 460, y: 240,
        dot: { id: 'C', label: 'C', type: 'dot', x: 460, y: 300 },
        dash: { id: 'Y', label: 'Y', type: 'dash', x: 410, y: 240 }
      }
    },
    dash: {
      id: 'M', label: 'M', type: 'dash', x: 600, y: 100,
      dot: {
        id: 'G', label: 'G', type: 'dot', x: 600, y: 180,
        dot: { id: 'Z', label: 'Z', type: 'dot', x: 600, y: 260, dot: { id: '7', label: '7', type: 'dot', x: 600, y: 320 } },
        dash: { id: 'Q', label: 'Q', type: 'dash', x: 660, y: 180 }
      },
      dash: {
        id: 'O', label: 'O', type: 'dash', x: 700, y: 100,
        dot: { id: '_O1', label: '', type: 'dot', x: 700, y: 180, dot: { id: '8', label: '8', type: 'dot', x: 700, y: 240 } },
        dash: {
          id: '_O2', label: '', type: 'dash', x: 780, y: 100,
          dot: { id: '9', label: '9', type: 'dot', x: 780, y: 180 },
          dash: { id: '0', label: '0', type: 'dash', x: 840, y: 100 }
        }
      }
    }
  }
};

export function isValidPath(path, tree = morseTree) {
  let current = tree;

  for (const symbol of path) {
    current = symbol === '.' ? current.dot : current.dash;
    if (!current) {
      return false;
    }
  }

  return true;
}

export function getDecodedChar(path, tree = morseTree) {
  let current = tree;

  for (const symbol of path) {
    current = symbol === '.' ? current.dot : current.dash;
    if (!current) {
      return null;
    }
  }

  return current.label || null;
}
