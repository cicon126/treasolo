const GAME_STATES = {
    WAITING: 'waiting',
    DEALING: 'dealing',
    CALLING_DIZHU: 'calling_dizhu',
    PLAYING: 'playing',
    GAME_OVER: 'game_over'
};

class Game {
    constructor() {
        this.state = GAME_STATES.WAITING;
        this.players = [];
        this.deck = [];
        this.dizhuCards = [];
        this.currentPlayerIndex = 0;
        this.dizhuIndex = -1;
        this.lastPlayedCards = [];
        this.lastPlayerIndex = -1;
        this.passCount = 0;
        this.callOrder = [];
    }

    init() {
        this.players = [
            new Player('我', 'bottom', false),
            new Player('电脑1', 'left', true),
            new Player('电脑2', 'right', true)
        ];
        this.deck = Card.shuffle(Card.createDeck());
        this.dizhuCards = [];
        this.currentPlayerIndex = 0;
        this.dizhuIndex = -1;
        this.lastPlayedCards = [];
        this.lastPlayerIndex = -1;
        this.passCount = 0;
        this.state = GAME_STATES.WAITING;
    }

    dealCards() {
        this.state = GAME_STATES.DEALING;
        
        const player1Cards = [];
        const player2Cards = [];
        const player3Cards = [];
        
        for (let i = 0; i < 51; i++) {
            if (i % 3 === 0) {
                player1Cards.push(this.deck[i]);
            } else if (i % 3 === 1) {
                player2Cards.push(this.deck[i]);
            } else {
                player3Cards.push(this.deck[i]);
            }
        }
        
        this.dizhuCards = this.deck.slice(51, 54);
        
        this.players[0].receiveCards(player1Cards);
        this.players[1].receiveCards(player2Cards);
        this.players[2].receiveCards(player3Cards);
        
        this.state = GAME_STATES.CALLING_DIZHU;
        this.callOrder = [0, 1, 2];
        this.currentPlayerIndex = this.callOrder[0];
        
        return {
            players: this.players,
            dizhuCards: this.dizhuCards
        };
    }

    callDizhu(playerIndex, isCall) {
        if (this.state !== GAME_STATES.CALLING_DIZHU) return false;
        
        const currentCallIndex = this.callOrder.indexOf(playerIndex);
        
        if (isCall) {
            this.setDizhu(playerIndex);
            return true;
        }
        
        if (currentCallIndex < this.callOrder.length - 1) {
            this.currentPlayerIndex = this.callOrder[currentCallIndex + 1];
            return true;
        }
        
        this.deck = Card.shuffle(Card.createDeck());
        return this.dealCards();
    }

    setDizhu(playerIndex) {
        this.dizhuIndex = playerIndex;
        const player = this.players[playerIndex];
        player.addDizhuCards(this.dizhuCards);
        
        this.state = GAME_STATES.PLAYING;
        this.currentPlayerIndex = playerIndex;
        this.lastPlayerIndex = -1;
        this.passCount = 0;
    }

    playCards(playerIndex, cards) {
        if (this.state !== GAME_STATES.PLAYING) return false;
        if (playerIndex !== this.currentPlayerIndex) return false;
        
        const player = this.players[playerIndex];
        
        if (!cards || cards.length === 0) {
            return this.pass(playerIndex);
        }
        
        if (!Card.canBeat(cards, this.lastPlayedCards)) {
            if (this.lastPlayedCards.length > 0 && this.lastPlayerIndex !== playerIndex) {
                return false;
            }
        }
        
        player.playCards(cards);
        this.lastPlayedCards = cards;
        this.lastPlayerIndex = playerIndex;
        this.passCount = 0;
        
        if (player.getCardsCount() === 0) {
            this.endGame(playerIndex);
            return true;
        }
        
        this.nextTurn();
        return true;
    }

    pass(playerIndex) {
        if (this.state !== GAME_STATES.PLAYING) return false;
        if (playerIndex !== this.currentPlayerIndex) return false;
        if (this.lastPlayerIndex === playerIndex) return false;
        if (this.lastPlayedCards.length === 0) return false;
        
        this.passCount++;
        
        if (this.passCount >= 2) {
            this.lastPlayedCards = [];
            this.lastPlayerIndex = -1;
            this.passCount = 0;
        }
        
        this.nextTurn();
        return true;
    }

    nextTurn() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 3;
    }

    isMyTurnToStart() {
        return this.lastPlayedCards.length === 0 || this.lastPlayerIndex === this.currentPlayerIndex;
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    getPlayerByPosition(position) {
        return this.players.find(p => p.position === position);
    }

    endGame(winnerIndex) {
        this.state = GAME_STATES.GAME_OVER;
        
        const winner = this.players[winnerIndex];
        const isDizhuWin = winner.isDizhu;
        
        return {
            winner: winner,
            isDizhuWin: isDizhuWin,
            dizhuIndex: this.dizhuIndex,
            winnerIndex: winnerIndex
        };
    }

    getHint(playerIndex) {
        const player = this.players[playerIndex];
        const isMyTurnToStart = this.lastPlayedCards.length === 0 || this.lastPlayerIndex === playerIndex;
        
        if (isMyTurnToStart) {
            return AIPlayer.findFirstPlay(player.cards);
        }
        
        return AIPlayer.findFollowingCards(player.cards, this.lastPlayedCards);
    }
}