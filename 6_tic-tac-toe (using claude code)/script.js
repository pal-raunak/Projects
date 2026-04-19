// ============================================================
//  Tic Tac Toe – Sliding Window Edition
//  Rules: each player holds at most 3 marks; placing a 4th
//  auto-removes the oldest mark for that player first.
//  No draws – play continues until 3-in-a-row.
// ============================================================

'use strict';

// ── Winning line definitions ─────────────────────────────────
const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],             // diagonals
];

// ── Game state ───────────────────────────────────────────────
let board;          // Array(9): null | 'X' | 'O'
let moves;          // { X: number[], O: number[] }  – FIFO queues
let currentPlayer;  // 'X' | 'O'
let gameOver;       // boolean
let sessionStopped; // boolean – true after player hits "Stop"
let winningCombo;   // number[] | null
let isAnimating;    // boolean – blocks clicks during removal animation
let lastPlaced;     // number | null – index of most-recently placed mark
let scores;         // { X: number, O: number }

// ── DOM refs ─────────────────────────────────────────────────
const boardEl      = document.getElementById('board');
const statusEl     = document.getElementById('status');
const newGameBtn   = document.getElementById('newGameBtn');
const restartBtn   = document.getElementById('restartBtn');
const scoreXEl     = document.getElementById('scoreX');
const scoreOEl     = document.getElementById('scoreO');

// Modal elements
const winModal     = document.getElementById('winModal');
const modalTitle   = document.getElementById('modalTitle');
const playAgainBtn = document.getElementById('playAgainBtn');
const stopBtn      = document.getElementById('stopBtn');

// ============================================================
//  INITIALISATION
// ============================================================

/**
 * Start / restart a round.
 * Scores are PRESERVED (use newGame() to wipe scores too).
 */
function initGame() {
  board         = Array(9).fill(null);
  moves         = { X: [], O: [] };
  currentPlayer = 'X';
  gameOver      = false;
  sessionStopped = false;
  winningCombo  = null;
  isAnimating   = false;
  lastPlaced    = null;

  // Preserve scores across rounds; create only on very first call
  if (!scores) scores = { X: 0, O: 0 };

  hideModal();
  renderBoard();
  updateStatus();
}

/**
 * Brand-new game: wipe scores AND reset the board.
 */
function newGame() {
  scores = { X: 0, O: 0 };
  updateScoreboard();
  initGame();
}

// ============================================================
//  CORE MOVE HANDLER
// ============================================================

/**
 * Called when a player clicks a cell.
 * @param {number} index  Board position 0–8
 */
function handleMove(index) {
  if (gameOver || isAnimating || sessionStopped) return;

  // The mark the current player would lose on their 4th placement
  const oldestIndex = moves[currentPlayer].length >= 3
    ? moves[currentPlayer][0]
    : null;

  // Valid click = empty cell  OR  the cell about to be freed
  const cellOccupied = board[index] !== null;
  const isFreeable   = index === oldestIndex;
  if (cellOccupied && !isFreeable) return;

  if (oldestIndex !== null) {
    // ── Animate removal, then commit ────────────────────────
    isAnimating = true;

    const cellEls = boardEl.querySelectorAll('.cell');
    const oldCell = cellEls[oldestIndex];
    if (oldCell) {
      oldCell.classList.remove('oldest');
      oldCell.classList.add('removing');
    }

    setTimeout(() => executeMove(oldestIndex, index), 380);

  } else {
    // ── No removal needed – commit immediately ───────────────
    executeMove(null, index);
  }
}

/**
 * Commits state after any animation delay.
 * @param {number|null} removedIndex  Cell being cleared (or null)
 * @param {number}      placedIndex   Cell receiving the new mark
 */
function executeMove(removedIndex, placedIndex) {
  // 1. Clear the oldest mark if applicable
  if (removedIndex !== null) {
    board[removedIndex] = null;
    moves[currentPlayer].shift();
  }

  // 2. Place the new mark
  board[placedIndex] = currentPlayer;
  moves[currentPlayer].push(placedIndex);
  lastPlaced  = placedIndex;
  isAnimating = false;

  // 3. Check win condition
  winningCombo = checkWinner();
  if (winningCombo) {
    gameOver = true;
    scores[currentPlayer]++;
    updateScoreboard(currentPlayer);   // bumps the winner's card
    renderBoard();
    updateStatus(`Player ${currentPlayer} wins! 🎉`);

    // Show the post-win modal after a short pause so the board animation settles
    setTimeout(() => showWinModal(currentPlayer), 900);
    return;
  }

  // 4. Hand off to next player
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  renderBoard();
  updateStatus();
}

// ============================================================
//  WIN DETECTION
// ============================================================

/**
 * @returns {number[]|null}  Winning triple, or null
 */
function checkWinner() {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return combo;
    }
  }
  return null;
}

// ============================================================
//  MODAL
// ============================================================

/**
 * Display the post-round modal.
 * @param {'X'|'O'} winner
 */
function showWinModal(winner) {
  modalTitle.textContent = `Player ${winner} Wins!`;
  winModal.classList.remove('hidden');
}

/** Hide the modal. */
function hideModal() {
  winModal.classList.add('hidden');
}

// ── Modal button handlers ────────────────────────────────────

playAgainBtn.addEventListener('click', () => {
  // Keep scores, start a fresh round
  initGame();
});

stopBtn.addEventListener('click', () => {
  // Close the modal and freeze the UI, declaring the session result
  hideModal();
  sessionStopped = true;

  // Determine overall session leader
  const xScore = scores.X;
  const oScore = scores.O;
  let declaration;
  if (xScore > oScore) {
    declaration = `🏆 Player X wins the session! (${xScore}–${oScore})`;
  } else if (oScore > xScore) {
    declaration = `🏆 Player O wins the session! (${oScore}–${xScore})`;
  } else {
    declaration = `🤝 It's a tie session! (${xScore}–${oScore})`;
  }

  statusEl.textContent = declaration;
  statusEl.className   = 'status session-over-status';
});

// ============================================================
//  RENDERING
// ============================================================

/**
 * Fully re-renders the 3×3 board from state.
 */
function renderBoard() {
  boardEl.innerHTML = '';

  // Which cell does the current player risk losing on their next move?
  const oldestForCurrent = (!gameOver && !sessionStopped && moves[currentPlayer].length === 3)
    ? moves[currentPlayer][0]
    : null;

  board.forEach((cell, index) => {
    const cellEl = document.createElement('div');
    cellEl.classList.add('cell');
    cellEl.dataset.index = index;

    if (cell) {
      cellEl.textContent = cell;
      cellEl.classList.add(cell === 'X' ? 'x-mark' : 'o-mark');

      // Pop-in animation on the freshly placed mark
      if (index === lastPlaced) cellEl.classList.add('appeared');

      // Amber warning on the mark that will be auto-removed next turn
      if (index === oldestForCurrent) cellEl.classList.add('oldest');
    }

    // Highlight the winning line
    if (winningCombo && winningCombo.includes(index)) cellEl.classList.add('winner');

    // Click handler – only on eligible cells during an active game
    if (!gameOver && !isAnimating && !sessionStopped) {
      const isEmpty   = board[index] === null;
      const isFreeing = index === oldestForCurrent;
      if (isEmpty || isFreeing) {
        cellEl.classList.add('clickable');
        cellEl.addEventListener('click', () => handleMove(index));
      }
    }

    boardEl.appendChild(cellEl);
  });
}

// ============================================================
//  UI HELPERS
// ============================================================

/**
 * Update the status pill.
 * @param {string} [winMessage]  If supplied, switches to win style.
 */
function updateStatus(winMessage) {
  if (winMessage) {
    statusEl.textContent = winMessage;
    statusEl.className   = 'status win-message';
  } else {
    statusEl.textContent = `Player ${currentPlayer}'s Turn`;
    statusEl.className   = `status turn-${currentPlayer.toLowerCase()}`;
  }
}

/**
 * Refresh score display.
 * @param {'X'|'O'} [bumpPlayer]  If provided, briefly animate that card.
 */
function updateScoreboard(bumpPlayer) {
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;

  if (bumpPlayer) {
    const card = bumpPlayer === 'X'
      ? scoreXEl.closest('.score-card')
      : scoreOEl.closest('.score-card');
    if (card) {
      card.classList.remove('score-bump');
      // Force reflow so the animation re-triggers even if already present
      void card.offsetWidth;
      card.classList.add('score-bump');
    }
  }
}

// ============================================================
//  PERSISTENT BUTTON EVENTS
// ============================================================

// New Game → reset scores + board
newGameBtn.addEventListener('click', newGame);

// Restart → keep scores, fresh board
restartBtn.addEventListener('click', initGame);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'r' || e.key === 'R') initGame();   // Restart
  if (e.key === 'n' || e.key === 'N') newGame();    // New Game
  if (e.key === 'Escape') hideModal();               // Dismiss modal
});

// ============================================================
//  BOOT
// ============================================================
initGame();
