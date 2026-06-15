const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const livesEl = document.getElementById('lives');
const overlay = document.getElementById('gameOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const restartBtn = document.getElementById('restartBtn');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

const PADDLE_HEIGHT = 15;
const PADDLE_WIDTH_BASE = 100;
const PADDLE_Y = CANVAS_HEIGHT - 40;
const PADDLE_SPEED = 8;

const BALL_RADIUS = 8;
const BALL_SPEED_BASE = 5;

const BRICK_ROWS_BASE = 5;
const BRICK_COLS = 10;
const BRICK_WIDTH = 70;
const BRICK_HEIGHT = 25;
const BRICK_PADDING = 5;
const BRICK_OFFSET_TOP = 60;
const BRICK_OFFSET_LEFT = 35;

const POWERUP_WIDTH = 30;
const POWERUP_HEIGHT = 15;
const POWERUP_SPEED = 3;
const POWERUP_DROP_CHANCE = 0.2;
const EXTEND_DURATION = 10000;

const BRICK_COLORS = [
    '#f72585',
    '#b5179e',
    '#7209b7',
    '#560bad',
    '#480ca8',
    '#3a0ca3',
    '#3f37c9',
    '#4361ee',
    '#4895ef',
    '#4cc9f0'
];

let paddle, balls, bricks, powerups, particles;
let score, level, lives;
let gameRunning, gamePaused, ballLaunched;
let keys = {};
let extendTimer = null;
let mouseX = CANVAS_WIDTH / 2;

function initGame() {
    score = 0;
    level = 1;
    lives = 3;
    gameRunning = true;
    gamePaused = false;
    ballLaunched = false;

    paddle = createPaddle();
    balls = [createBall()];
    bricks = createBricks();
    powerups = [];
    particles = [];

    updateUI();
    overlay.classList.add('hidden');
    gameLoop();
}

function createPaddle() {
    return {
        x: (CANVAS_WIDTH - PADDLE_WIDTH_BASE) / 2,
        y: PADDLE_Y,
        width: PADDLE_WIDTH_BASE,
        height: PADDLE_HEIGHT,
        speed: PADDLE_SPEED
    };
}

function createBall(x, y, dx, dy) {
    const speed = BALL_SPEED_BASE + (level - 1) * 0.5;
    return {
        x: x || paddle.x + paddle.width / 2,
        y: y || paddle.y - BALL_RADIUS - 1,
        dx: dx || (Math.random() > 0.5 ? 1 : -1) * speed * 0.7,
        dy: dy || -speed,
        radius: BALL_RADIUS
    };
}

function createBricks() {
    const rows = BRICK_ROWS_BASE + Math.floor((level - 1) * 0.5);
    const bricks = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
            const hits = Math.min(3, 1 + Math.floor(r / 3) + (level > 3 ? 1 : 0));
            bricks.push({
                x: BRICK_OFFSET_LEFT + c * (BRICK_WIDTH + BRICK_PADDING),
                y: BRICK_OFFSET_TOP + r * (BRICK_HEIGHT + BRICK_PADDING),
                width: BRICK_WIDTH,
                height: BRICK_HEIGHT,
                hits: hits,
                maxHits: hits,
                color: BRICK_COLORS[r % BRICK_COLORS.length],
                visible: true
            });
        }
    }
    return bricks;
}

function createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 6,
            dy: (Math.random() - 0.5) * 6,
            radius: Math.random() * 3 + 1,
            color: color,
            life: 1
        });
    }
}

function createPowerup(x, y) {
    const types = ['extend', 'multi'];
    const type = types[Math.floor(Math.random() * types.length)];
    powerups.push({
        x: x - POWERUP_WIDTH / 2,
        y: y,
        width: POWERUP_WIDTH,
        height: POWERUP_HEIGHT,
        type: type,
        speed: POWERUP_SPEED
    });
}

function updateUI() {
    scoreEl.textContent = score;
    levelEl.textContent = level;
    livesEl.textContent = lives;
}

function movePaddle() {
    if (keys['ArrowLeft'] || keys['a']) {
        paddle.x -= paddle.speed;
    }
    if (keys['ArrowRight'] || keys['d']) {
        paddle.x += paddle.speed;
    }
    paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, paddle.x));
}

function moveBalls() {
    for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];

        if (!ballLaunched && i === 0) {
            ball.x = paddle.x + paddle.width / 2;
            ball.y = paddle.y - BALL_RADIUS - 1;
            continue;
        }

        ball.x += ball.dx;
        ball.y += ball.dy;

        if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= CANVAS_WIDTH) {
            ball.dx = -ball.dx;
            ball.x = Math.max(ball.radius, Math.min(CANVAS_WIDTH - ball.radius, ball.x));
        }
        if (ball.y - ball.radius <= 0) {
            ball.dy = -ball.dy;
            ball.y = ball.radius;
        }

        if (ball.y + ball.radius >= paddle.y &&
            ball.y - ball.radius <= paddle.y + paddle.height &&
            ball.x >= paddle.x &&
            ball.x <= paddle.x + paddle.width) {
            const hitPos = (ball.x - paddle.x) / paddle.width;
            const angle = (hitPos - 0.5) * Math.PI * 0.7;
            const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
            ball.dx = speed * Math.sin(angle);
            ball.dy = -Math.abs(speed * Math.cos(angle));
            ball.y = paddle.y - ball.radius - 1;
        }

        if (ball.y - ball.radius > CANVAS_HEIGHT) {
            balls.splice(i, 1);
            if (balls.length === 0) {
                lives--;
                updateUI();
                if (lives <= 0) {
                    endGame(false);
                } else {
                    ballLaunched = false;
                    balls.push(createBall());
                }
            }
        }
    }
}

function checkBrickCollision() {
    for (const ball of balls) {
        for (const brick of bricks) {
            if (!brick.visible) continue;

            if (ball.x + ball.radius > brick.x &&
                ball.x - ball.radius < brick.x + brick.width &&
                ball.y + ball.radius > brick.y &&
                ball.y - ball.radius < brick.y + brick.height) {

                const overlapLeft = ball.x + ball.radius - brick.x;
                const overlapRight = brick.x + brick.width - (ball.x - ball.radius);
                const overlapTop = ball.y + ball.radius - brick.y;
                const overlapBottom = brick.y + brick.height - (ball.y - ball.radius);

                const minOverlapX = Math.min(overlapLeft, overlapRight);
                const minOverlapY = Math.min(overlapTop, overlapBottom);

                if (minOverlapX < minOverlapY) {
                    ball.dx = -ball.dx;
                } else {
                    ball.dy = -ball.dy;
                }

                brick.hits--;
                if (brick.hits <= 0) {
                    brick.visible = false;
                    score += 10 * level;
                    createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color);

                    if (Math.random() < POWERUP_DROP_CHANCE) {
                        createPowerup(brick.x + brick.width / 2, brick.y + brick.height / 2);
                    }
                } else {
                    score += 5;
                }
                updateUI();
                break;
            }
        }
    }
}

function movePowerups() {
    for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        p.y += p.speed;

        if (p.y + p.height >= paddle.y &&
            p.y <= paddle.y + paddle.height &&
            p.x + p.width >= paddle.x &&
            p.x <= paddle.x + paddle.width) {
            applyPowerup(p.type);
            powerups.splice(i, 1);
            continue;
        }

        if (p.y > CANVAS_HEIGHT) {
            powerups.splice(i, 1);
        }
    }
}

function applyPowerup(type) {
    if (type === 'extend') {
        paddle.width = PADDLE_WIDTH_BASE * 1.5;
        if (extendTimer) clearTimeout(extendTimer);
        extendTimer = setTimeout(() => {
            paddle.width = PADDLE_WIDTH_BASE;
        }, EXTEND_DURATION);
    } else if (type === 'multi') {
        const newBalls = [];
        for (const ball of balls) {
            const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
            const angle1 = Math.atan2(ball.dy, ball.dx) - 0.3;
            const angle2 = Math.atan2(ball.dy, ball.dx) + 0.3;
            newBalls.push(createBall(ball.x, ball.y, speed * Math.cos(angle1), speed * Math.sin(angle1)));
            newBalls.push(createBall(ball.x, ball.y, speed * Math.cos(angle2), speed * Math.sin(angle2)));
        }
        balls = balls.concat(newBalls);
        if (!ballLaunched) ballLaunched = true;
    }
    score += 50;
    updateUI();
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.life -= 0.02;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function checkLevelComplete() {
    if (bricks.every(b => !b.visible)) {
        level++;
        updateUI();
        if (level > 10) {
            endGame(true);
        } else {
            ballLaunched = false;
            paddle = createPaddle();
            balls = [createBall()];
            bricks = createBricks();
            powerups = [];
            if (extendTimer) {
                clearTimeout(extendTimer);
                extendTimer = null;
            }
        }
    }
}

function drawPaddle() {
    const gradient = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.height);
    gradient.addColorStop(0, '#4cc9f0');
    gradient.addColorStop(1, '#4361ee');
    ctx.fillStyle = gradient;
    ctx.shadowColor = '#4cc9f0';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 7);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawBalls() {
    for (const ball of balls) {
        const gradient = ctx.createRadialGradient(ball.x - 2, ball.y - 2, 0, ball.x, ball.y, ball.radius);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#ffd166');
        gradient.addColorStop(1, '#f72585');
        ctx.fillStyle = gradient;
        ctx.shadowColor = '#f72585';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

function drawBricks() {
    for (const brick of bricks) {
        if (!brick.visible) continue;

        const alpha = 0.4 + 0.6 * (brick.hits / brick.maxHits);
        ctx.globalAlpha = alpha;

        const gradient = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
        gradient.addColorStop(0, brick.color);
        gradient.addColorStop(1, shadeColor(brick.color, -30));
        ctx.fillStyle = gradient;

        ctx.shadowColor = brick.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 4);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (brick.hits > 1) {
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(brick.hits.toString(), brick.x + brick.width / 2, brick.y + brick.height / 2);
        }

        ctx.globalAlpha = 1;
    }
}

function drawPowerups() {
    for (const p of powerups) {
        let color1, color2;
        if (p.type === 'extend') {
            color1 = '#4cc9f0';
            color2 = '#4361ee';
        } else {
            color1 = '#f72585';
            color2 = '#ffd166';
        }
        const gradient = ctx.createLinearGradient(p.x, p.y, p.x + p.width, p.y + p.height);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        ctx.fillStyle = gradient;
        ctx.shadowColor = color1;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.width, p.height, 4);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.type === 'extend' ? 'E' : 'M', p.x + p.width / 2, p.y + p.height / 2);
    }
}

function drawParticles() {
    for (const p of particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function shadeColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 +
        (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
}

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawParticles();
    drawBricks();
    drawPowerups();
    drawPaddle();
    drawBalls();

    if (!ballLaunched && gameRunning) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('按空格键发射小球', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }

    if (gamePaused) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏暂停', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }
}

function gameLoop() {
    if (!gameRunning) return;

    if (!gamePaused) {
        movePaddle();
        moveBalls();
        checkBrickCollision();
        movePowerups();
        updateParticles();
        checkLevelComplete();
    }

    draw();
    requestAnimationFrame(gameLoop);
}

function endGame(won) {
    gameRunning = false;
    overlay.classList.remove('hidden');
    if (won) {
        overlayTitle.textContent = '恭喜通关！';
        overlayMessage.textContent = `最终得分: ${score}`;
    } else {
        overlayTitle.textContent = '游戏结束';
        overlayMessage.textContent = `最终得分: ${score}，到达关卡: ${level}`;
    }
}

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (!ballLaunched) {
            ballLaunched = true;
        } else if (gameRunning) {
            gamePaused = !gamePaused;
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, mouseX - paddle.width / 2));
});

canvas.addEventListener('click', () => {
    if (!ballLaunched && gameRunning) {
        ballLaunched = true;
    }
});

restartBtn.addEventListener('click', () => {
    if (extendTimer) clearTimeout(extendTimer);
    initGame();
});

initGame();
