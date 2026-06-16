<script setup lang="ts">import { ref, computed } from 'vue';
type CellValue = 'X' | 'O' | null;
type Difficulty = 'easy' | 'medium' | 'hard';
const board = ref<CellValue[]>(Array(16).fill(null));
const currentPlayer = ref<'X' | 'O'>('X');
const gameOver = ref(false);
const winner = ref<CellValue>(null);
const winningCells = ref<number[]>([]);
const difficulty = ref<Difficulty>('medium');
const scores = ref({ player: 0, ai: 0, tie: 0 });
const isVsAI = ref(true);
const winningLines = [
 [0, 1, 2, 3],
 [4, 5, 6, 7],
 [8, 9, 10, 11],
 [12, 13, 14, 15],
 [0, 4, 8, 12],
 [1, 5, 9, 13],
 [2, 6, 10, 14],
 [3, 7, 11, 15],
 [0, 5, 10, 15],
 [3, 6, 9, 12]
];
const statusText = computed(() => {
 if (winner.value) {
 return `🎉 ${winner.value === 'X' ? '玩家' : 'AI'}获胜！`;
 }
 if (gameOver.value) {
 return '🤝 平局！';
 }
 return `当前回合：<span class="status-turn ${currentPlayer.value === 'X' ? 'status-turn-x' : 'status-turn-o'}">${currentPlayer.value}</span>`;
});
function checkWinner(boardState: CellValue[]): {
 winner: CellValue;
 cells: number[];
} | null {
 for (const line of winningLines) {
 const [a, b, c, d] = line;
 if (boardState[a] && boardState[a] === boardState[b] &&
 boardState[b] === boardState[c] && boardState[c] === boardState[d]) {
 return { winner: boardState[a], cells: line };
 }
 }
 return null;
}
function isBoardFull(boardState: CellValue[]): boolean {
 return boardState.every(cell => cell !== null);
}
function evaluateLine(line: number[], boardState: CellValue[], player: 'X' | 'O'): number {
 const opponent = player === 'X' ? 'O' : 'X';
 let playerCount = 0;
 let opponentCount = 0;
 for (const idx of line) {
 if (boardState[idx] === player)
 playerCount++;
 else if (boardState[idx] === opponent)
 opponentCount++;
 }
 if (opponentCount > 0)
 return 0;
 switch (playerCount) {
 case 4: return 1000;
 case 3: return 100;
 case 2: return 10;
 case 1: return 1;
 default: return 0;
 }
}
function evaluateBoard(boardState: CellValue[], player: 'X' | 'O'): number {
 let score = 0;
 for (const line of winningLines) {
 score += evaluateLine(line, boardState, player);
 }
 const centerCells = [5, 6, 9, 10];
 for (const cell of centerCells) {
 if (boardState[cell] === player)
 score += 2;
 }
 const cornerCells = [0, 3, 12, 15];
 for (const cell of cornerCells) {
 if (boardState[cell] === player)
 score += 1;
 }
 return score;
}
function minimax(boardState: CellValue[], depth: number, isMaximizing: boolean, alpha: number, beta: number): number {
 const result = checkWinner(boardState);
 if (result) {
 return result.winner === 'O' ? 1000 - depth : -1000 + depth;
 }
 if (isBoardFull(boardState))
 return 0;
 if (depth === 0) {
 return evaluateBoard(boardState, 'O') - evaluateBoard(boardState, 'X');
 }
 const emptyCells = boardState
 .map((cell, idx) => cell === null ? idx : -1)
 .filter(idx => idx !== -1);
 if (isMaximizing) {
 let maxScore = -Infinity;
 for (const cell of emptyCells) {
 const newBoard = [...boardState];
 newBoard[cell] = 'O';
 const score = minimax(newBoard, depth - 1, false, alpha, beta);
 maxScore = Math.max(maxScore, score);
 alpha = Math.max(alpha, score);
 if (beta <= alpha)
 break;
 }
 return maxScore;
 }
 else {
 let minScore = Infinity;
 for (const cell of emptyCells) {
 const newBoard = [...boardState];
 newBoard[cell] = 'X';
 const score = minimax(newBoard, depth - 1, true, alpha, beta);
 minScore = Math.min(minScore, score);
 beta = Math.min(beta, score);
 if (beta <= alpha)
 break;
 }
 return minScore;
 }
}
function getAIMove(): number {
 const emptyCells = board.value
 .map((cell, idx) => cell === null ? idx : -1)
 .filter(idx => idx !== -1);
 if (emptyCells.length === 0)
 return -1;
 if (emptyCells.length === 16) {
 return Math.floor(Math.random() * 16);
 }
 let bestMove = emptyCells[0];
 let bestScore = -Infinity;
 const depth = difficulty.value === 'easy' ? 1 : difficulty.value === 'medium' ? 4 : 6;
 for (const cell of emptyCells) {
 const newBoard = [...board.value];
 newBoard[cell] = 'O';
 const score = minimax(newBoard, depth, false, -Infinity, Infinity);
 if (score > bestScore) {
 bestScore = score;
 bestMove = cell;
 }
 }
 return bestMove;
}
async function makeAIMove() {
 if (gameOver.value || currentPlayer.value !== 'O')
 return;
 await new Promise(resolve => setTimeout(resolve, 500));
 const move = getAIMove();
 if (move !== -1) {
 board.value[move] = 'O';
 const result = checkWinner(board.value);
 if (result) {
 gameOver.value = true;
 winner.value = result.winner;
 winningCells.value = result.cells;
 scores.value.ai++;
 }
 else if (isBoardFull(board.value)) {
 gameOver.value = true;
 scores.value.tie++;
 }
 else {
 currentPlayer.value = 'X';
 }
 }
}
function handleCellClick(index: number) {
 if (board.value[index] || gameOver.value || !isVsAI.value && currentPlayer.value === 'O')
 return;
 board.value[index] = currentPlayer.value;
 const result = checkWinner(board.value);
 if (result) {
 gameOver.value = true;
 winner.value = result.winner;
 winningCells.value = result.cells;
 scores.value.player++;
 }
 else if (isBoardFull(board.value)) {
 gameOver.value = true;
 scores.value.tie++;
 }
 else {
 currentPlayer.value = currentPlayer.value === 'X' ? 'O' : 'X';
 if (isVsAI.value && currentPlayer.value === 'O') {
 makeAIMove();
 }
 }
}
function resetGame() {
 board.value = Array(16).fill(null);
 currentPlayer.value = 'X';
 gameOver.value = false;
 winner.value = null;
 winningCells.value = [];
}
function resetScores() {
 scores.value = { player: 0, ai: 0, tie: 0 };
}
function setDifficulty(level: Difficulty) {
 difficulty.value = level;
 resetGame();
}
function toggleGameMode() {
 isVsAI.value = !isVsAI.value;
 resetGame();
}
</script>

<template>
  <div class="game-container">
    <h1 class="game-title">井字棋大作战</h1>
    <p class="game-subtitle">4x4 棋盘 · 四点一线获胜</p>
    
    <div class="score-board">
      <div class="score-item">
        <div class="score-value">{{ scores.player }}</div>
        <div class="score-label">玩家</div>
      </div>
      <div class="score-item">
        <div class="score-value">{{ scores.tie }}</div>
        <div class="score-label">平局</div>
      </div>
      <div class="score-item">
        <div class="score-value">{{ scores.ai }}</div>
        <div class="score-label">AI</div>
      </div>
    </div>

    <div class="difficulty-selector">
      <button 
        v-for="level in ['easy', 'medium', 'hard'] as const"
        :key="level"
        class="difficulty-btn"
        :class="{ active: difficulty === level }"
        @click="setDifficulty(level)"
      >
        {{ level === 'easy' ? '简单' : level === 'medium' ? '中等' : '困难' }}
      </button>
    </div>

    <div class="board">
      <div
        v-for="(cell, index) in board"
        :key="index"
        class="cell"
        :class="{
          'cell-filled': cell,
          'cell-x': cell === 'X',
          'cell-o': cell === 'O',
          'cell-win': winningCells.includes(index)
        }"
        @click="handleCellClick(index)"
      >
        {{ cell }}
      </div>
    </div>

    <div class="status-bar">
      <p class="status-text" v-html="statusText"></p>
    </div>

    <div class="game-controls">
      <button class="btn btn-primary" @click="resetGame">
        重新开始
      </button>
      <button class="btn btn-secondary" @click="toggleGameMode">
        {{ isVsAI ? '双人模式' : '人机对战' }}
      </button>
      <button class="btn btn-secondary" @click="resetScores">
        重置分数
      </button>
    </div>

    <div class="rules-container">
      <h3 class="rules-title">游戏规则</h3>
      <p class="rules-text">
        在 4×4 的棋盘上，双方轮流落子。先将四个己方棋子连成一线（横、竖、斜均可）的一方获胜。
        <br><br>
        <strong>难度说明：</strong>
        <br>
        简单 - AI随机落子
        <br>
        中等 - AI思考4步深度
        <br>
        困难 - AI思考6步深度（最强策略）
      </p>
    </div>
  </div>
</template>
