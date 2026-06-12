class Game2048 {
    constructor() {
        this.gridSize = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.history = [];
        this.maxHistory = 10;
        
        this.tileContainer = document.getElementById('tile-container');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.gameOverlay = document.getElementById('game-overlay');
        this.overlayTitle = document.getElementById('overlay-title');
        this.overlayMessage = document.getElementById('overlay-message');
        this.overlayBtn = document.getElementById('overlay-btn');
        this.undoBtn = document.getElementById('undo');
        this.newGameBtn = document.getElementById('new-game');
        
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 30;
        
        this.init();
    }
    
    init() {
        this.loadBestScore();
        this.setupEventListeners();
        this.newGame();
    }
    
    setupEventListeners() {
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.undoBtn.addEventListener('click', () => this.undo());
        this.overlayBtn.addEventListener('click', () => this.newGame());
        
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        const gameContainer = document.getElementById('game-container');
        gameContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        gameContainer.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        gameContainer.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        window.addEventListener('resize', () => this.render());
    }
    
    handleKeydown(e) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            if (!this.gameOver) {
                const direction = e.key.replace('Arrow', '').toLowerCase();
                this.move(direction);
            }
        }
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    }
    
    handleTouchMove(e) {
        e.preventDefault();
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        if (this.gameOver) return;
        
        this.touchEndX = e.changedTouches[0].clientX;
        this.touchEndY = e.changedTouches[0].clientY;
        
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        if (Math.max(absX, absY) < this.minSwipeDistance) return;
        
        let direction;
        if (absX > absY) {
            direction = deltaX > 0 ? 'right' : 'left';
        } else {
            direction = deltaY > 0 ? 'down' : 'up';
        }
        
        this.move(direction);
    }
    
    newGame() {
        this.grid = this.createEmptyGrid();
        this.score = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.history = [];
        
        this.hideOverlay();
        this.updateScore();
        this.updateUndoButton();
        
        this.addRandomTile();
        this.addRandomTile();
        this.render();
    }
    
    createEmptyGrid() {
        return Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(0));
    }
    
    saveState() {
        this.history.push({
            grid: this.grid.map(row => [...row]),
            score: this.score
        });
        
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
        
        this.updateUndoButton();
    }
    
    undo() {
        if (this.history.length === 0) return;
        
        const prevState = this.history.pop();
        this.grid = prevState.grid;
        this.score = prevState.score;
        this.gameOver = false;
        
        this.hideOverlay();
        this.updateScore();
        this.updateUndoButton();
        this.render();
    }
    
    updateUndoButton() {
        this.undoBtn.disabled = this.history.length === 0;
    }
    
    addRandomTile() {
        const emptyCells = [];
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.grid[r][c] === 0) {
                    emptyCells.push({ r, c });
                }
            }
        }
        
        if (emptyCells.length === 0) return false;
        
        const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        this.grid[r][c] = Math.random() < 0.9 ? 2 : 4;
        
        return { r, c };
    }
    
    move(direction) {
        this.saveState();
        
        let moved = false;
        const vectors = {
            up: { r: -1, c: 0 },
            down: { r: 1, c: 0 },
            left: { r: 0, c: -1 },
            right: { r: 0, c: 1 }
        };
        
        const vector = vectors[direction];
        const traversals = this.buildTraversals(vector);
        
        traversals.rows.forEach(r => {
            traversals.cols.forEach(c => {
                if (this.grid[r][c] !== 0) {
                    const result = this.moveTile(r, c, vector);
                    if (result.moved) moved = true;
                }
            });
        });
        
        if (moved) {
            const newTile = this.addRandomTile();
            this.render(newTile);
            this.updateScore();
            
            if (this.checkWin()) {
                this.showWin();
            } else if (this.checkGameOver()) {
                this.showGameOver();
            }
        } else {
            this.history.pop();
        }
        
        return moved;
    }
    
    buildTraversals(vector) {
        const rows = [];
        const cols = [];
        
        for (let i = 0; i < this.gridSize; i++) {
            rows.push(i);
            cols.push(i);
        }
        
        if (vector.r === 1) rows.reverse();
        if (vector.c === 1) cols.reverse();
        
        return { rows, cols };
    }
    
    moveTile(r, c, vector) {
        let value = this.grid[r][c];
        let newR = r;
        let newC = c;
        let moved = false;
        
        while (true) {
            const nextR = newR + vector.r;
            const nextC = newC + vector.c;
            
            if (!this.isWithinBounds(nextR, nextC)) break;
            
            if (this.grid[nextR][nextC] === 0) {
                this.grid[nextR][nextC] = value;
                this.grid[newR][newC] = 0;
                newR = nextR;
                newC = nextC;
                moved = true;
            } else if (this.grid[nextR][nextC] === value) {
                this.grid[nextR][nextC] = value * 2;
                this.grid[newR][newC] = 0;
                this.score += value * 2;
                this.saveBestScore();
                moved = true;
                break;
            } else {
                break;
            }
        }
        
        return { moved, newR, newC };
    }
    
    isWithinBounds(r, c) {
        return r >= 0 && r < this.gridSize && c >= 0 && c < this.gridSize;
    }
    
    checkWin() {
        if (this.gameWon) return false;
        
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.grid[r][c] === 2048) {
                    this.gameWon = true;
                    return true;
                }
            }
        }
        return false;
    }
    
    checkGameOver() {
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.grid[r][c] === 0) return false;
                const value = this.grid[r][c];
                if (r < this.gridSize - 1 && this.grid[r + 1][c] === value) return false;
                if (c < this.gridSize - 1 && this.grid[r][c + 1] === value) return false;
            }
        }
        this.gameOver = true;
        return true;
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
        this.bestScoreElement.textContent = this.bestScore;
    }
    
    saveBestScore() {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('2048-best-score', this.bestScore);
        }
    }
    
    loadBestScore() {
        const saved = localStorage.getItem('2048-best-score');
        this.bestScore = saved ? parseInt(saved, 10) : 0;
        this.bestScoreElement.textContent = this.bestScore;
    }
    
    showGameOver() {
        this.overlayTitle.textContent = '游戏结束';
        this.overlayMessage.textContent = '没有可移动的方块了！';
        this.gameOverlay.classList.remove('win');
        this.gameOverlay.querySelector('.overlay-content').classList.remove('win');
        this.gameOverlay.classList.add('show');
    }
    
    showWin() {
        this.overlayTitle.textContent = '🎉 恭喜胜利！';
        this.overlayMessage.textContent = '你成功合成了 2048！可以继续挑战更高分。';
        this.gameOverlay.classList.add('win');
        this.gameOverlay.querySelector('.overlay-content').classList.add('win');
        this.gameOverlay.classList.add('show');
        
        this.gameOver = false;
    }
    
    hideOverlay() {
        this.gameOverlay.classList.remove('show', 'win');
        this.gameOverlay.querySelector('.overlay-content').classList.remove('win');
    }
    
    render(newTile) {
        this.tileContainer.innerHTML = '';
        
        const containerRect = this.tileContainer.getBoundingClientRect();
        const isMobile = window.innerWidth <= 480;
        const gap = isMobile ? 8 : 12;
        const tileSize = (containerRect.width - gap * 3) / 4;
        
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                const value = this.grid[r][c];
                if (value !== 0) {
                    const tile = document.createElement('div');
                    tile.className = 'tile';
                    
                    const tileClass = value <= 2048 ? `tile-${value}` : 'tile-super';
                    tile.classList.add(tileClass);
                    
                    if (newTile && newTile.r === r && newTile.c === c) {
                        tile.classList.add('new');
                    }
                    
                    tile.textContent = value;
                    tile.style.width = `${tileSize}px`;
                    tile.style.height = `${tileSize}px`;
                    tile.style.transform = `translate(${c * (tileSize + gap)}px, ${r * (tileSize + gap)}px)`;
                    
                    this.tileContainer.appendChild(tile);
                }
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
