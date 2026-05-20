const PLAYER = "red";
const CPU = "black";
const EMPTY = null;

let board = [];
let selectedPiece = null;
let currentPlayer = PLAYER;
let difficulty = 4;
let gameOver = false;
let mustContinueJump = false;
let continuousJumpPiece = null;

function initBoard() {
  board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        if (row < 3) {
          board[row][col] = { color: CPU, isKing: false };
        } else if (row > 4) {
          board[row][col] = { color: PLAYER, isKing: false };
        }
      }
    }
  }
}

function renderBoard() {
  const boardElement = document.getElementById("board");
  boardElement.innerHTML = "";

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = document.createElement("div");
      cell.className = `cell ${(row + col) % 2 === 0 ? "light" : "dark"}`;
      cell.dataset.row = row;
      cell.dataset.col = col;

      const cellLabel = document.createElement("span");
      cellLabel.className = "cell-label";
      cellLabel.textContent = `${row},${col}`;
      cell.appendChild(cellLabel);

      if (board[row][col]) {
        const piece = document.createElement("div");
        piece.className = `piece ${board[row][col].color}`;
        if (board[row][col].isKing) {
          piece.classList.add("king");
        }
        cell.appendChild(piece);
      }

      cell.addEventListener("click", () => handleCellClick(row, col));
      boardElement.appendChild(cell);
    }
  }

  updateGameInfo();
}

function handleCellClick(row, col) {
  if (gameOver || currentPlayer !== PLAYER) return;

  if (mustContinueJump) {
    if (
      !continuousJumpPiece ||
      row !== continuousJumpPiece.row ||
      col !== continuousJumpPiece.col
    ) {
      if (
        board[row][col] &&
        board[row][col] ===
          board[continuousJumpPiece.row][continuousJumpPiece.col]
      ) {
        return;
      }
    }
  }

  const piece = board[row][col];

  if (selectedPiece) {
    const moves = getValidMoves(selectedPiece.row, selectedPiece.col);
    const move = moves.find((m) => m.row === row && m.col === col);

    if (move) {
      const wasJump = move.isJump;
      makeMove(selectedPiece.row, selectedPiece.col, row, col);

      if (wasJump) {
        const additionalJumps = getValidMoves(row, col).filter((m) => m.isJump);

        if (additionalJumps.length > 0) {
          mustContinueJump = true;
          continuousJumpPiece = { row, col };
          selectedPiece = { row, col };
          updateGameInfo();
          renderBoardWithSelection();
          return;
        }
      }

      mustContinueJump = false;
      continuousJumpPiece = null;
      selectedPiece = null;

      if (!checkGameOver()) {
        currentPlayer = CPU;
        updateGameInfo();
        setTimeout(cpuMove, 500);
      }
    } else if (piece && piece.color === PLAYER && !mustContinueJump) {
      selectedPiece = { row, col };
    } else {
      if (!mustContinueJump) {
        selectedPiece = null;
      }
    }
  } else if (piece && piece.color === PLAYER && !mustContinueJump) {
    selectedPiece = { row, col };
  }

  renderBoardWithSelection();
}

function renderBoardWithSelection() {
  renderBoard();

  if (selectedPiece) {
    const cells = document.querySelectorAll(".cell");
    const selectedCell = cells[selectedPiece.row * 8 + selectedPiece.col];
    selectedCell.classList.add("selected");

    const moves = getValidMoves(selectedPiece.row, selectedPiece.col);
    moves.forEach((move) => {
      const cell = cells[move.row * 8 + move.col];
      cell.classList.add("valid-move");
    });
  }
}

function getValidMoves(row, col) {
  const piece = board[row][col];
  if (!piece) return [];

  const moves = [];
  const jumps = [];

  const directions = piece.isKing
    ? [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]
    : piece.color === PLAYER
      ? [
          [-1, -1],
          [-1, 1],
        ]
      : [
          [1, -1],
          [1, 1],
        ];

  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow;
    const newCol = col + dCol;

    if (isValidPosition(newRow, newCol) && !board[newRow][newCol]) {
      moves.push({ row: newRow, col: newCol, isJump: false });
    }

    const jumpRow = row + dRow * 2;
    const jumpCol = col + dCol * 2;

    if (
      isValidPosition(jumpRow, jumpCol) &&
      !board[jumpRow][jumpCol] &&
      board[newRow][newCol] &&
      board[newRow][newCol].color !== piece.color
    ) {
      jumps.push({
        row: jumpRow,
        col: jumpCol,
        isJump: true,
        capturedRow: newRow,
        capturedCol: newCol,
      });
    }
  }

  return jumps.length > 0 ? jumps : moves;
}

function isValidPosition(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function makeMove(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];

  const moves = getValidMoves(fromRow, fromCol);
  const move = moves.find((m) => m.row === toRow && m.col === toCol);

  board[toRow][toCol] = piece;
  board[fromRow][fromCol] = null;

  if (move && move.isJump) {
    board[move.capturedRow][move.capturedCol] = null;
  }

  if (
    (piece.color === PLAYER && toRow === 0) ||
    (piece.color === CPU && toRow === 7)
  ) {
    piece.isKing = true;
  }
}

function cpuMove() {
  if (gameOver) return;

  executeCpuTurnWithMultiJump();
}

async function executeCpuTurnWithMultiJump() {
  let currentPos = null;
  let hasMoreJumps = true;
  let moveCount = 0;

  while (hasMoreJumps) {
    let bestMove;

    if (currentPos) {
      const jumps = getValidMoves(currentPos.row, currentPos.col).filter(
        (m) => m.isJump,
      );
      if (jumps.length === 0) {
        hasMoreJumps = false;
        break;
      }

      let bestJumpValue = -Infinity;
      for (const jump of jumps) {
        const testBoard = board.map((row) =>
          row.map((cell) => (cell ? { ...cell } : null)),
        );
        const piece = testBoard[currentPos.row][currentPos.col];
        testBoard[jump.row][jump.col] = piece;
        testBoard[currentPos.row][currentPos.col] = null;
        if (jump.isJump) {
          testBoard[jump.capturedRow][jump.capturedCol] = null;
        }

        const value = getScore(testBoard);
        if (value > bestJumpValue) {
          bestJumpValue = value;
          bestMove = {
            fromRow: currentPos.row,
            fromCol: currentPos.col,
            toRow: jump.row,
            toCol: jump.col,
            isJump: true,
          };
        }
      }
    } else {
      // console.log('board', board)
      bestMove = compareMinimax(board, difficulty);
      if (!bestMove) {
        endGame("Player Menang!");
        return;
      }
    }

    if (moveCount > 0) {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    makeMove(
      bestMove.fromRow,
      bestMove.fromCol,
      bestMove.toRow,
      bestMove.toCol,
    );
    renderBoard();
    moveCount++;

    if (bestMove.isJump) {
      const additionalJumps = getValidMoves(
        bestMove.toRow,
        bestMove.toCol,
      ).filter((m) => m.isJump);
      if (additionalJumps.length > 0) {
        currentPos = { row: bestMove.toRow, col: bestMove.toCol };
        continue;
      }
    }

    hasMoreJumps = false;
  }

  if (!checkGameOver()) {
    currentPlayer = PLAYER;
    updateGameInfo();
    renderBoard();
  }
}

function getAllPossibleMoves(boardState, color) {
  const moves = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = boardState[row][col];
      if (piece && piece.color === color) {
        const validMoves = getValidMovesForBoard(boardState, row, col);
        validMoves.forEach((move) => {
          moves.push({
            fromRow: row,
            fromCol: col,
            toRow: move.row,
            toCol: move.col,
            isJump: move.isJump,
            capturedRow: move.capturedRow,
            capturedCol: move.capturedCol,
          });
        });
      }
    }
  }

  return moves;
}

function getValidMovesForBoard(boardState, row, col) {
  const piece = boardState[row][col];
  if (!piece) return [];

  const moves = [];
  const jumps = [];

  const directions = piece.isKing
    ? [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]
    : piece.color === PLAYER
      ? [
          [-1, -1],
          [-1, 1],
        ]
      : [
          [1, -1],
          [1, 1],
        ];

  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow;
    const newCol = col + dCol;

    if (isValidPosition(newRow, newCol) && !boardState[newRow][newCol]) {
      moves.push({ row: newRow, col: newCol, isJump: false });
    }

    const jumpRow = row + dRow * 2;
    const jumpCol = col + dCol * 2;

    if (
      isValidPosition(jumpRow, jumpCol) &&
      !boardState[jumpRow][jumpCol] &&
      boardState[newRow][newCol] &&
      boardState[newRow][newCol].color !== piece.color
    ) {
      jumps.push({
        row: jumpRow,
        col: jumpCol,
        isJump: true,
        capturedRow: newRow,
        capturedCol: newCol,
      });
    }
  }

  return jumps.length > 0 ? jumps : moves;
}

function applyMove(boardState, move) {
  const newBoard = boardState.map((row) =>
    row.map((cell) => (cell ? { ...cell } : null)),
  );

  const piece = newBoard[move.fromRow][move.fromCol];
  newBoard[move.toRow][move.toCol] = piece;
  newBoard[move.fromRow][move.fromCol] = null;

  if (move.isJump) {
    newBoard[move.capturedRow][move.capturedCol] = null;
  }

  if (
    (piece.color === PLAYER && move.toRow === 0) ||
    (piece.color === CPU && move.toRow === 7)
  ) {
    piece.isKing = true;
  }

  return newBoard;
}

function getScore(boardState) {
  let score = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = boardState[row][col];
      if (piece) {
        let pieceValue = piece.isKing ? 5 : 3;

        if (!piece.isKing) {
          if (piece.color === CPU) {
            pieceValue += row / 8;
          } else {
            pieceValue += (7 - row) / 8;
          }
        }

        score += piece.color === CPU ? pieceValue : -pieceValue;
      }
    }
  }

  return score;
}

function checkGameOver() {
  const playerMoves = getAllPossibleMoves(board, PLAYER);
  const cpuMoves = getAllPossibleMoves(board, CPU);

  if (playerMoves.length === 0) {
    endGame("CPU Menang!");
    return true;
  }

  if (cpuMoves.length === 0) {
    endGame("Player Menang!");
    return true;
  }

  return false;
}

function endGame(winner) {
  gameOver = true;
  document.getElementById("winner-text").textContent = winner;
  document.getElementById("game-over").classList.remove("hidden");
}

function updateGameInfo() {
  const playerCount = countPieces(PLAYER);
  const cpuCount = countPieces(CPU);

  document.getElementById("player-score").textContent = playerCount;
  document.getElementById("cpu-score").textContent = cpuCount;

  const playerTurnElement = document.querySelector(".player-turn");
  const currentPlayerElement = document.getElementById("current-player");

  if (mustContinueJump) {
    currentPlayerElement.textContent = "Lanjutkan Makan! (Merah)";
    currentPlayerElement.style.color = "#ff6b00";
    playerTurnElement.classList.add("must-jump");
  } else {
    currentPlayerElement.textContent =
      currentPlayer === PLAYER ? "Player (Merah)" : "CPU (Hitam)";
    currentPlayerElement.style.color =
      currentPlayer === PLAYER ? "#e74c3c" : "#2c3e50";
    playerTurnElement.classList.remove("must-jump");
  }
}

function countPieces(color) {
  let count = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] && board[row][col].color === color) {
        count++;
      }
    }
  }
  return count;
}

function restartGame() {
  gameOver = false;
  currentPlayer = PLAYER;
  selectedPiece = null;
  mustContinueJump = false;
  continuousJumpPiece = null;
  document.getElementById("game-over").classList.add("hidden");
  initBoard();
  renderBoard();
}

function changeDifficulty() {
  difficulty = parseInt(document.getElementById("difficulty").value);
}

initBoard();
renderBoard();
