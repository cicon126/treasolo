const GameState = {
  IDLE: 'idle',
  PLAYING: 'playing',
  OVER: 'over'
};

const game = {
  state: GameState.IDLE,
  score: 0,
  timeLeft: 30,
  currentHole: -1,
  moleTimer: null,
  gameTimer: null
};

const GAME_DURATION = 30;
const MOLE_MIN_TIME = 600;
const MOLE_MAX_TIME = 1200;

const timeEl = document.getElementById('time');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const gameOverEl = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');
const holes = document.querySelectorAll('.hole');

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateDisplay() {
  timeEl.textContent = game.timeLeft;
  scoreEl.textContent = game.score;

  if (game.timeLeft <= 5 && game.state === GameState.PLAYING) {
    timeEl.classList.add('warning');
  } else {
    timeEl.classList.remove('warning');
  }
}

function hideMole() {
  if (game.currentHole >= 0) {
    holes[game.currentHole].classList.remove('active', 'whacked');
    game.currentHole = -1;
  }
}

function popMole() {
  if (game.state !== GameState.PLAYING) return;

  hideMole();

  let nextHole;
  do {
    nextHole = randomInt(0, 8);
  } while (nextHole === game.currentHole && Math.random() > 0.3);

  game.currentHole = nextHole;
  holes[nextHole].classList.add('active');

  const showTime = randomInt(MOLE_MIN_TIME, MOLE_MAX_TIME);
  game.moleTimer = setTimeout(() => {
    hideMole();
    if (game.state === GameState.PLAYING) {
      popMole();
    }
  }, showTime);
}

function handleWhack(e) {
  if (game.state !== GameState.PLAYING) return;

  const hole = e.currentTarget;
  const index = parseInt(hole.dataset.index, 10);

  if (index === game.currentHole && hole.classList.contains('active')) {
    game.score++;
    hole.classList.add('whacked');
    updateDisplay();

    clearTimeout(game.moleTimer);
    setTimeout(() => {
      hideMole();
      if (game.state === GameState.PLAYING) {
        popMole();
      }
    }, 150);
  }
}

function startGame() {
  game.state = GameState.PLAYING;
  game.score = 0;
  game.timeLeft = GAME_DURATION;
  game.currentHole = -1;

  gameOverEl.classList.add('hidden');
  updateDisplay();

  holes.forEach(h => h.classList.remove('active', 'whacked'));

  if (game.gameTimer) clearInterval(game.gameTimer);
  if (game.moleTimer) clearTimeout(game.moleTimer);

  game.gameTimer = setInterval(() => {
    game.timeLeft--;
    updateDisplay();

    if (game.timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  popMole();
}

function endGame() {
  game.state = GameState.OVER;

  clearInterval(game.gameTimer);
  clearTimeout(game.moleTimer);

  hideMole();

  finalScoreEl.textContent = game.score;
  gameOverEl.classList.remove('hidden');
}

holes.forEach(hole => {
  hole.addEventListener('click', handleWhack);
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

updateDisplay();
