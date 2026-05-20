let nodesExplored = 0;

function minimax(boardState, depth, isMaximizing) {
  nodesExplored++;

  const cpuMoves = getAllPossibleMoves(boardState, CPU);
  const playerMoves = getAllPossibleMoves(boardState, PLAYER);

  if (depth === 0 || cpuMoves.length === 0 || playerMoves.length === 0)
    return getScore(boardState);

  if (isMaximizing) {
    let maximiser = -Infinity;

    for (const move of cpuMoves) {
      const newBoard = applyMove(boardState, move);
      const evalScore = minimax(newBoard, depth - 1, false);
      maximiser = Math.max(maximiser, evalScore);
    }

    return maximiser;
  } else {
    let minimiser = Infinity;

    for (const move of playerMoves) {
      const newBoard = applyMove(boardState, move);
      const evalScore = minimax(newBoard, depth - 1, true);
      minimiser = Math.min(minimiser, evalScore);
    }

    return minimiser;
  }
}

// Algoritma Minimax dengan Alpha-Beta Pruning
// alpha = nilai terbaik yang sudah dijamin oleh maximizer (batas bawah)
// beta  = nilai terbaik yang sudah dijamin oleh minimizer (batas atas)
function alphaBetaPruning(boardState, depth, alpha, beta, isMaximizing) {
  nodesExplored++; // hitung jumlah node yang dikunjungi

  // Cari semua kemungkinan langkah untuk kedua pemain
  const cpuMoves = getAllPossibleMoves(boardState, CPU);
  const playerMoves = getAllPossibleMoves(boardState, PLAYER);

  // Base case (terminal node): hitung skor jika kedalaman habis atau tidak ada langkah
  if (depth === 0 || cpuMoves.length === 0 || playerMoves.length === 0)
    return getScore(boardState);

  if (isMaximizing) {
    // Giliran CPU (maximizer): cari nilai tertinggi
    let maximiser = -Infinity;

    for (const move of cpuMoves) {
      // Simulasikan langkah pada board sementara
      const newBoard = applyMove(boardState, move);

      // Rekursi: turun ke level berikutnya (giliran minimizer)
      const evalScore = alphaBetaPruning(
        newBoard,
        depth - 1,
        alpha,
        beta,
        false,
      );

      maximiser = Math.max(maximiser, evalScore); // simpan nilai terbaik
      alpha = Math.max(alpha, evalScore); // update batas bawah

      // Pruning: jika alpha >= beta, cabang sisanya tidak perlu diperiksa
      if (alpha >= beta) break;
    }

    return maximiser;
  } else {
    // Giliran Player (minimizer): cari nilai terendah
    let minimiser = Infinity;

    for (const move of playerMoves) {
      // Simulasikan langkah pada board sementara
      const newBoard = applyMove(boardState, move);

      // Rekursi: turun ke level berikutnya (giliran maximizer)
      const evalScore = alphaBetaPruning(
        newBoard,
        depth - 1,
        alpha,
        beta,
        true,
      );

      minimiser = Math.min(minimiser, evalScore); // simpan nilai terbaik untuk minimizer
      beta = Math.min(beta, evalScore); // update batas atas

      // Pruning: jika alpha >= beta, cabang sisanya tidak perlu diperiksa
      if (alpha >= beta) break;
    }

    return minimiser;
  }
}

function compareMinimax(boardState, depth) {
  const moves = getAllPossibleMoves(boardState, CPU);

  if (moves.length === 0) return null;

  const jumpMoves = moves.filter((m) => m.isJump);
  const movesToEvaluate = jumpMoves.length > 0 ? jumpMoves : moves;

  console.log("=".repeat(60));
  console.log("PERBANDINGAN MINIMAX vs ALPHA-BETA PRUNING");
  console.log("=".repeat(60));

  // ===== MINIMAX =====
  nodesExplored = 0;
  const startTime1 = performance.now();

  let bestMove1 = null;
  let bestValue1 = -Infinity;

  for (const move of movesToEvaluate) {
    const newBoard = applyMove(boardState, move);
    const moveValue = minimax(newBoard, depth - 1, false);

    if (moveValue > bestValue1) {
      bestValue1 = moveValue;
      bestMove1 = move;
    }
  }

  const endTime1 = performance.now();
  const nodesMinimaxBiasa = nodesExplored;
  const timeMinimaxBiasa = endTime1 - startTime1;

  // =====  ALPHA-BETA PRUNING =====
  nodesExplored = 0;
  const startTime2 = performance.now();

  let bestMove2 = null;
  let bestValue2 = -Infinity;

  for (const move of movesToEvaluate) {
    const newBoard = applyMove(boardState, move);
    const moveValue = alphaBetaPruning(
      newBoard,
      depth - 1,
      -Infinity,
      Infinity,
      false,
    );

    if (moveValue > bestValue2) {
      bestValue2 = moveValue;
      bestMove2 = move;
    }
  }

  const endTime2 = performance.now();
  const nodesAlphaBeta = nodesExplored;
  const timeAlphaBeta = endTime2 - startTime2;

  // ===== TAMPILKAN HASIL =====
  console.log("\n📊 HASIL MINIMAX BIASA:");
  console.log(`   • Node dieksplorasi: ${nodesMinimaxBiasa.toLocaleString()}`);
  console.log(`   • Waktu: ${timeMinimaxBiasa.toFixed(2)} ms`);
  console.log(
    `   • Gerakan: (${bestMove1.fromRow},${bestMove1.fromCol}) → (${bestMove1.toRow},${bestMove1.toCol})`,
  );
  console.log(`   • Nilai: ${bestValue1}`);

  console.log("\n⚡ HASIL ALPHA-BETA PRUNING:");
  console.log(`   • Node dieksplorasi: ${nodesAlphaBeta.toLocaleString()}`);
  console.log(`   • Waktu: ${timeAlphaBeta.toFixed(2)} ms`);
  console.log(
    `   • Gerakan: (${bestMove2.fromRow},${bestMove2.fromCol}) → (${bestMove2.toRow},${bestMove2.toCol})`,
  );
  console.log(`   • Nilai: ${bestValue2}`);

  console.log("\n✨ PERBANDINGAN:");
  const nodeSaved = nodesMinimaxBiasa - nodesAlphaBeta;
  const percentSaved = ((nodeSaved / nodesMinimaxBiasa) * 100).toFixed(1);
  const speedup = (timeMinimaxBiasa / timeAlphaBeta).toFixed(2);

  console.log(
    `   • Node dipangkas: ${nodeSaved.toLocaleString()} (${percentSaved}%)`,
  );
  console.log(`   • Percepatan: ${speedup}x lebih cepat`);
  console.log(
    `   • Hasil sama? ${bestValue1 === bestValue2 ? "✓ YA" : "✗ TIDAK"}`,
  );
  console.log("=".repeat(60));

  // Return hasil alpha-beta (lebih cepat)
  return bestMove2;
}
