const AVATAR_EMOJIS = {
    boy: '👦',
    girl: '👧',
    man: '👨',
    woman: '👩',
    cat: '🐱',
    dog: '🐶',
    panda: '🐼',
    fox: '🦊',
    lion: '🦁',
    tiger: '🐯',
    bear: '🐻',
    pig: '🐷'
};

class GameUI {
    constructor() {
        this.game = new Game();
        this.selectedCardIds = new Set();
        this.avatars = {
            0: localStorage.getItem('avatar_0') || '👨',
            1: '🤖',
            2: '🤖'
        };
        this.loadCustomAvatars();
        this.initElements();
        this.initEventListeners();
        this.renderAvatars();
        this.updateButtonStates();
    }

    loadCustomAvatars() {
        for (let i = 0; i < 3; i++) {
            const customAvatar = localStorage.getItem(`custom_avatar_${i}`);
            if (customAvatar) {
                this.avatars[i] = { type: 'custom', data: customAvatar };
            }
        }
    }

    initElements() {
        this.bottomCardsEl = document.getElementById('bottom-cards');
        this.leftCardsEl = document.getElementById('left-cards');
        this.rightCardsEl = document.getElementById('right-cards');
        this.dizhuCardsEl = document.getElementById('dizhu-cards-container');
        this.leftPlayedEl = document.getElementById('left-played');
        this.rightPlayedEl = document.getElementById('right-played');
        this.bottomPlayedEl = document.getElementById('bottom-played');
        this.statusTextEl = document.getElementById('status-text');
        this.currentTurnEl = document.getElementById('current-turn');
        this.leftCountEl = document.getElementById('left-count');
        this.rightCountEl = document.getElementById('right-count');
        
        this.startBtn = document.getElementById('start-btn');
        this.callDizhuBtn = document.getElementById('call-dizhu-btn');
        this.noCallBtn = document.getElementById('no-call-btn');
        this.playBtn = document.getElementById('play-btn');
        this.passBtn = document.getElementById('pass-btn');
        this.hintBtn = document.getElementById('hint-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.playAgainBtn = document.getElementById('play-again-btn');
        
        this.winModal = document.getElementById('win-modal');
        this.winTitle = document.getElementById('win-title');
        this.winMessage = document.getElementById('win-message');
        
        this.avatarModal = document.getElementById('avatar-modal');
        this.avatarUpload = document.getElementById('avatar-upload');
        this.closeAvatarModalBtn = document.getElementById('close-avatar-modal');
    }

    initEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.callDizhuBtn.addEventListener('click', () => this.callDizhu(true));
        this.noCallBtn.addEventListener('click', () => this.callDizhu(false));
        this.playBtn.addEventListener('click', () => this.playCards());
        this.passBtn.addEventListener('click', () => this.pass());
        this.hintBtn.addEventListener('click', () => this.showHint());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.playAgainBtn.addEventListener('click', () => this.restartGame());
        
        document.querySelectorAll('.player-avatar.editable').forEach(avatar => {
            avatar.addEventListener('click', () => this.openAvatarModal());
        });
        
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => {
                const avatarKey = option.dataset.avatar;
                this.setAvatar(0, AVATAR_EMOJIS[avatarKey]);
                localStorage.setItem('avatar_0', AVATAR_EMOJIS[avatarKey]);
                localStorage.removeItem('custom_avatar_0');
                this.closeAvatarModal();
            });
        });
        
        this.avatarUpload.addEventListener('change', (e) => this.handleAvatarUpload(e));
        this.closeAvatarModalBtn.addEventListener('click', () => this.closeAvatarModal());
        
        this.avatarModal.addEventListener('click', (e) => {
            if (e.target === this.avatarModal) {
                this.closeAvatarModal();
            }
        });
    }

    openAvatarModal() {
        this.avatarModal.classList.add('show');
    }

    closeAvatarModal() {
        this.avatarModal.classList.remove('show');
    }

    handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageData = event.target.result;
                this.setAvatar(0, imageData, true);
                localStorage.setItem('custom_avatar_0', imageData);
                this.closeAvatarModal();
            };
            reader.readAsDataURL(file);
        }
    }

    setAvatar(playerIndex, avatar, isCustom = false) {
        if (isCustom) {
            this.avatars[playerIndex] = { type: 'custom', data: avatar };
        } else {
            this.avatars[playerIndex] = avatar;
        }
        this.renderAvatars();
    }

    renderAvatars() {
        const avatarElements = document.querySelectorAll('.player-avatar');
        avatarElements.forEach((el, index) => {
            const avatar = this.avatars[index];
            const img = el.querySelector('.avatar-img');
            
            if (avatar && typeof avatar === 'object' && avatar.type === 'custom') {
                img.src = avatar.data;
                img.style.display = 'block';
                el.textContent = '';
                el.appendChild(img);
                if (el.querySelector('.avatar-edit-hint')) {
                    const hint = el.querySelector('.avatar-edit-hint');
                    el.appendChild(hint);
                }
            } else {
                img.style.display = 'none';
                const textNode = document.createTextNode(avatar || '👤');
                el.insertBefore(textNode, img);
                if (el.firstChild !== textNode) {
                    el.removeChild(el.firstChild);
                    el.insertBefore(textNode, img);
                }
            }
        });
        
        this.fixAvatarDisplay();
    }

    fixAvatarDisplay() {
        const avatarElements = document.querySelectorAll('.player-avatar');
        avatarElements.forEach((el, index) => {
            const avatar = this.avatars[index];
            const img = el.querySelector('.avatar-img');
            const hint = el.querySelector('.avatar-edit-hint');
            
            if (avatar && typeof avatar === 'object' && avatar.type === 'custom') {
                img.src = avatar.data;
                img.style.display = 'block';
            } else {
                img.style.display = 'none';
                const textNodes = Array.from(el.childNodes).filter(n => n.nodeType === 3);
                textNodes.forEach(n => n.remove());
                const emojiText = document.createTextNode(avatar || '👤');
                el.insertBefore(emojiText, img);
            }
            
            if (hint) {
                el.appendChild(hint);
            }
        });
    }

    startGame() {
        this.game.init();
        this.game.dealCards();
        this.renderAll();
        this.updateButtonStates();
        speech.gameStart();
        
        if (this.game.currentPlayerIndex === 0) {
            this.setStatus('请选择是否叫地主');
            speech.callDizhu();
        } else {
            this.setStatus('等待其他玩家叫地主...');
            setTimeout(() => this.aiCallDizhu(), 1000);
        }
    }

    callDizhu(isCall) {
        if (this.game.state !== GAME_STATES.CALLING_DIZHU) return;
        if (this.game.currentPlayerIndex !== 0) return;
        
        this.game.callDizhu(0, isCall);
        
        if (isCall) {
            speech.playerCallDizhu('你');
        }
        
        this.renderAll();
        this.updateButtonStates();
        
        if (this.game.state === GAME_STATES.PLAYING) {
            this.onDizhuDetermined();
        } else if (this.game.state === GAME_STATES.CALLING_DIZHU) {
            setTimeout(() => this.aiCallDizhu(), 1000);
        }
    }

    aiCallDizhu() {
        if (this.game.state !== GAME_STATES.CALLING_DIZHU) return;
        
        const currentIndex = this.game.currentPlayerIndex;
        if (currentIndex === 0) return;
        
        const player = this.game.players[currentIndex];
        const willCall = AIPlayer.decideCallDizhu(player);
        
        setTimeout(() => {
            this.game.callDizhu(currentIndex, willCall);
            
            this.renderAll();
            this.updateButtonStates();
            
            if (this.game.state === GAME_STATES.PLAYING) {
                this.onDizhuDetermined();
            } else if (this.game.state === GAME_STATES.CALLING_DIZHU) {
                if (this.game.currentPlayerIndex === 0) {
                    this.setStatus('请选择是否叫地主');
                    speech.callDizhu();
                } else {
                    setTimeout(() => this.aiCallDizhu(), 1000);
                }
            }
        }, 800);
    }

    onDizhuDetermined() {
        const dizhuPlayer = this.game.players[this.game.dizhuIndex];
        speech.dizhuDetermined(dizhuPlayer.name);
        this.renderAll();
        this.updateButtonStates();
        
        if (this.game.currentPlayerIndex === 0) {
            this.setStatus('轮到你出牌');
            speech.yourTurn();
        } else {
            this.setStatus('等待其他玩家出牌...');
            setTimeout(() => this.aiPlay(), 1000);
        }
    }

    playCards() {
        if (this.game.state !== GAME_STATES.PLAYING) return;
        if (this.game.currentPlayerIndex !== 0) return;
        
        const humanPlayer = this.game.players[0];
        const selectedCards = humanPlayer.cards.filter(c => this.selectedCardIds.has(c.id));
        
        if (selectedCards.length === 0) {
            this.setStatus('请选择要出的牌');
            return;
        }
        
        const cardType = Card.getType(selectedCards);
        if (cardType.type === CARD_TYPES.INVALID) {
            this.setStatus('无效的牌型');
            speech.invalidCards();
            return;
        }
        
        if (!Card.canBeat(selectedCards, this.game.lastPlayedCards)) {
            if (this.game.lastPlayedCards.length > 0 && this.game.lastPlayerIndex !== 0) {
                this.setStatus('出的牌必须大于上家');
                speech.invalidCards();
                return;
            }
        }
        
        const success = this.game.playCards(0, selectedCards);
        if (success) {
            this.selectedCardIds.clear();
            humanPlayer.clearSelection();
            
            if (cardType.type === CARD_TYPES.BOMB) speech.bomb();
            if (cardType.type === CARD_TYPES.ROCKET) speech.rocket();
            
            this.renderAll();
            this.updateButtonStates();
            
            if (this.game.state === GAME_STATES.GAME_OVER) {
                this.showGameOver();
            } else {
                this.setStatus('等待其他玩家出牌...');
                setTimeout(() => this.aiPlay(), 1000);
            }
        }
    }

    pass() {
        if (this.game.state !== GAME_STATES.PLAYING) return;
        if (this.game.currentPlayerIndex !== 0) return;
        
        const success = this.game.pass(0);
        if (success) {
            this.renderAll();
            this.updateButtonStates();
            this.setStatus('等待其他玩家出牌...');
            setTimeout(() => this.aiPlay(), 1000);
        }
    }

    aiPlay() {
        if (this.game.state !== GAME_STATES.PLAYING) return;
        
        const currentIndex = this.game.currentPlayerIndex;
        if (currentIndex === 0) return;
        
        const player = this.game.players[currentIndex];
        const isMyTurnToStart = this.game.isMyTurnToStart();
        
        setTimeout(() => {
            const shouldPass = !isMyTurnToStart && AIPlayer.shouldPass(
                player, 
                this.game.lastPlayedCards, 
                this.game.players[this.game.lastPlayerIndex],
                isMyTurnToStart
            );
            
            if (shouldPass) {
                this.game.pass(currentIndex);
            } else {
                const cardsToPlay = AIPlayer.findPlayableCards(
                    player, 
                    this.game.lastPlayedCards,
                    this.game.players[this.game.lastPlayerIndex]
                );
                
                if (cardsToPlay && cardsToPlay.length > 0) {
                    const cardType = Card.getType(cardsToPlay);
                    
                    this.game.playCards(currentIndex, cardsToPlay);
                    
                    if (cardType.type === CARD_TYPES.BOMB) speech.bomb();
                    if (cardType.type === CARD_TYPES.ROCKET) speech.rocket();
                } else {
                    this.game.pass(currentIndex);
                }
            }
            
            this.renderAll();
            this.updateButtonStates();
            
            if (this.game.state === GAME_STATES.GAME_OVER) {
                this.showGameOver();
            } else if (this.game.currentPlayerIndex === 0) {
                this.setStatus('轮到你出牌');
                speech.yourTurn();
            } else {
                setTimeout(() => this.aiPlay(), 1000);
            }
        }, 800);
    }

    showHint() {
        if (this.game.state !== GAME_STATES.PLAYING) return;
        if (this.game.currentPlayerIndex !== 0) return;
        
        const hintCards = this.game.getHint(0);
        if (hintCards && hintCards.length > 0) {
            this.selectedCardIds.clear();
            hintCards.forEach(card => this.selectedCardIds.add(card.id));
            speech.hint();
            this.renderHumanCards();
        } else {
            this.setStatus('没有可以出的牌，请选择不出');
        }
    }

    showGameOver() {
        const winnerIndex = this.game.players.findIndex(p => p.getCardsCount() === 0);
        const winner = this.game.players[winnerIndex];
        const isHumanWin = winnerIndex === 0;
        const isDizhuWin = winner.isDizhu;
        
        const modalContent = this.winModal.querySelector('.modal-content');
        modalContent.classList.remove('win', 'lose');
        modalContent.classList.add(isHumanWin ? 'win' : 'lose');
        
        this.winTitle.textContent = isHumanWin ? '🎉 恭喜获胜！' : '😔 游戏结束';
        
        let message = '';
        if (isDizhuWin) {
            message = isHumanWin ? '你作为地主赢得了比赛！' : `${winner.name}作为地主赢得了比赛！`;
        } else {
            message = isHumanWin ? '农民方获得了胜利！' : '农民方获得了胜利！';
        }
        this.winMessage.textContent = message;
        
        this.winModal.classList.add('show');
        
        if (isHumanWin) {
            speech.youWin();
        } else {
            speech.youLose();
        }
    }

    restartGame() {
        this.winModal.classList.remove('show');
        this.selectedCardIds.clear();
        this.startGame();
    }

    setStatus(text) {
        this.statusTextEl.textContent = text;
    }

    renderCard(card, isBack = false, isSelected = false, isHint = false) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        
        if (isBack) {
            cardEl.classList.add('back');
            return cardEl;
        }
        
        if (isSelected) {
            cardEl.classList.add('selected');
        }
        
        if (isHint) {
            cardEl.classList.add('hint');
        }
        
        if (card.isRed) {
            cardEl.classList.add('red');
        } else {
            cardEl.classList.add('black');
        }
        
        const topLeft = document.createElement('div');
        topLeft.className = 'top-left';
        topLeft.innerHTML = `
            <span class="card-value">${card.value}</span>
            <span class="card-suit">${card.suit}</span>
        `;
        
        const bottomRight = document.createElement('div');
        bottomRight.className = 'bottom-right';
        bottomRight.innerHTML = `
            <span class="card-value">${card.value}</span>
            <span class="card-suit">${card.suit}</span>
        `;
        
        cardEl.appendChild(topLeft);
        cardEl.appendChild(bottomRight);
        cardEl.dataset.cardId = card.id;
        
        return cardEl;
    }

    renderHumanCards() {
        this.bottomCardsEl.innerHTML = '';
        const humanPlayer = this.game.players[0];
        
        humanPlayer.cards.forEach(card => {
            const isSelected = this.selectedCardIds.has(card.id);
            const cardEl = this.renderCard(card, false, isSelected);
            
            cardEl.addEventListener('click', () => {
                if (this.game.currentPlayerIndex === 0 && this.game.state === GAME_STATES.PLAYING) {
                    if (this.selectedCardIds.has(card.id)) {
                        this.selectedCardIds.delete(card.id);
                    } else {
                        this.selectedCardIds.add(card.id);
                    }
                    this.renderHumanCards();
                }
            });
            
            this.bottomCardsEl.appendChild(cardEl);
        });
    }

    renderOpponentCards() {
        this.leftCardsEl.innerHTML = '';
        this.rightCardsEl.innerHTML = '';
        
        const leftPlayer = this.game.players[1];
        const rightPlayer = this.game.players[2];
        
        for (let i = 0; i < leftPlayer.getCardsCount(); i++) {
            this.leftCardsEl.appendChild(this.renderCard(null, true));
        }
        
        for (let i = 0; i < rightPlayer.getCardsCount(); i++) {
            this.rightCardsEl.appendChild(this.renderCard(null, true));
        }
        
        this.leftCountEl.textContent = leftPlayer.getCardsCount();
        this.rightCountEl.textContent = rightPlayer.getCardsCount();
    }

    renderDizhuCards() {
        this.dizhuCardsEl.innerHTML = '';
        
        if (this.game.state === GAME_STATES.WAITING || this.game.state === GAME_STATES.DEALING) {
            for (let i = 0; i < 3; i++) {
                this.dizhuCardsEl.appendChild(this.renderCard(null, true));
            }
        } else {
            this.game.dizhuCards.forEach(card => {
                this.dizhuCardsEl.appendChild(this.renderCard(card));
            });
        }
    }

    renderPlayedCards() {
        this.leftPlayedEl.innerHTML = '';
        this.rightPlayedEl.innerHTML = '';
        this.bottomPlayedEl.innerHTML = '';
        
        this.game.players.forEach((player, index) => {
            const playedCards = player.playedCards || [];
            let container;
            
            switch (index) {
                case 0: container = this.bottomPlayedEl; break;
                case 1: container = this.leftPlayedEl; break;
                case 2: container = this.rightPlayedEl; break;
            }
            
            playedCards.forEach(card => {
                container.appendChild(this.renderCard(card));
            });
        });
    }

    renderPlayerRoles() {
        this.game.players.forEach((player, index) => {
            let roleEl;
            switch (index) {
                case 0:
                    roleEl = document.querySelector('#bottom-player .player-role');
                    break;
                case 1:
                    roleEl = document.querySelector('#left-player .player-role');
                    break;
                case 2:
                    roleEl = document.querySelector('#right-player .player-role');
                    break;
            }
            
            if (roleEl) {
                if (this.game.state === GAME_STATES.WAITING || this.game.state === GAME_STATES.DEALING || this.game.state === GAME_STATES.CALLING_DIZHU) {
                    roleEl.textContent = '';
                    roleEl.className = 'player-role';
                } else {
                    roleEl.textContent = player.isDizhu ? '地主' : '农民';
                    roleEl.className = 'player-role ' + (player.isDizhu ? 'dizhu' : 'nongmin');
                }
            }
        });
    }

    renderCurrentTurn() {
        if (this.game.state === GAME_STATES.PLAYING) {
            const player = this.game.getCurrentPlayer();
            this.currentTurnEl.textContent = `当前: ${player.name}`;
        } else {
            this.currentTurnEl.textContent = '';
        }
    }

    renderAll() {
        this.renderHumanCards();
        this.renderOpponentCards();
        this.renderDizhuCards();
        this.renderPlayedCards();
        this.renderPlayerRoles();
        this.renderCurrentTurn();
    }

    updateButtonStates() {
        const state = this.game.state;
        const isHumanTurn = this.game.currentPlayerIndex === 0;
        
        this.startBtn.style.display = state === GAME_STATES.WAITING ? 'block' : 'none';
        this.callDizhuBtn.style.display = (state === GAME_STATES.CALLING_DIZHU && isHumanTurn) ? 'block' : 'none';
        this.noCallBtn.style.display = (state === GAME_STATES.CALLING_DIZHU && isHumanTurn) ? 'block' : 'none';
        this.playBtn.style.display = (state === GAME_STATES.PLAYING && isHumanTurn) ? 'block' : 'none';
        this.passBtn.style.display = (state === GAME_STATES.PLAYING && isHumanTurn) ? 'block' : 'none';
        this.hintBtn.style.display = (state === GAME_STATES.PLAYING && isHumanTurn) ? 'block' : 'none';
        this.restartBtn.style.display = state !== GAME_STATES.WAITING ? 'block' : 'none';
        
        if (state === GAME_STATES.PLAYING) {
            const canPass = this.game.lastPlayedCards.length > 0 && this.game.lastPlayerIndex !== 0;
            this.passBtn.disabled = !canPass;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const gameUI = new GameUI();
    window.gameUI = gameUI;
});