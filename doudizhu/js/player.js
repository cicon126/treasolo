class Player {
    constructor(name, position, isAI = false) {
        this.name = name;
        this.position = position;
        this.cards = [];
        this.isAI = isAI;
        this.isDizhu = false;
        this.selectedCards = [];
        this.playedCards = [];
    }

    receiveCards(cards) {
        this.cards = Card.sortCards(cards, false);
    }

    addDizhuCards(cards) {
        this.cards = Card.sortCards([...this.cards, ...cards], false);
        this.isDizhu = true;
    }

    sortCards() {
        this.cards = Card.sortCards(this.cards, false);
    }

    removeCards(cardsToRemove) {
        const idsToRemove = new Set(cardsToRemove.map(c => c.id));
        this.cards = this.cards.filter(c => !idsToRemove.has(c.id));
        this.playedCards = cardsToRemove;
    }

    playCards(cards) {
        this.removeCards(cards);
        return cards;
    }

    hasCards() {
        return this.cards.length > 0;
    }

    getCardsCount() {
        return this.cards.length;
    }

    clearSelection() {
        this.selectedCards = [];
    }

    toggleCardSelection(card) {
        const index = this.selectedCards.findIndex(c => c.id === card.id);
        if (index === -1) {
            this.selectedCards.push(card);
        } else {
            this.selectedCards.splice(index, 1);
        }
    }

    setSelectedCards(cards) {
        this.selectedCards = [...cards];
    }
}