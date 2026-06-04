class AIPlayer {
    static decideCallDizhu(player) {
        const cards = player.cards;
        let score = 0;
        
        const rankCounts = Card.getRankCounts(cards);
        
        if (rankCounts[17] && rankCounts[16]) score += 5;
        else if (rankCounts[17] || rankCounts[16]) score += 2;
        
        for (const rank in rankCounts) {
            if (rankCounts[rank] === 4) score += 4;
        }
        
        if (rankCounts[15]) score += rankCounts[15] * 0.5;
        
        if (score >= 5) return true;
        if (score >= 3 && Math.random() > 0.5) return true;
        return false;
    }

    static findPlayableCards(player, lastPlayedCards, lastPlayer) {
        const cards = player.cards;
        
        if (!lastPlayedCards || lastPlayedCards.length === 0 || lastPlayer === player) {
            return this.findFirstPlay(cards);
        }
        
        return this.findFollowingCards(cards, lastPlayedCards);
    }

    static findFirstPlay(cards) {
        const rankCounts = Card.getRankCounts(cards);
        const ranks = Object.keys(rankCounts).map(Number).sort((a, b) => a - b);
        
        const singles = ranks.filter(r => rankCounts[r] >= 1);
        if (singles.length > 0) {
            const singleCard = cards.find(c => c.rank === singles[0]);
            if (singleCard) return [singleCard];
        }
        
        const pairs = ranks.filter(r => rankCounts[r] >= 2);
        if (pairs.length > 0) {
            const pairCards = cards.filter(c => c.rank === pairs[0]).slice(0, 2);
            if (pairCards.length === 2) return pairCards;
        }
        
        const triples = ranks.filter(r => rankCounts[r] >= 3);
        if (triples.length > 0) {
            return cards.filter(c => c.rank === triples[0]).slice(0, 3);
        }
        
        if (cards.length > 0) return [cards[cards.length - 1]];
        
        return [];
    }

    static findFollowingCards(cards, lastPlayedCards) {
        const lastType = Card.getType(lastPlayedCards);
        const rankCounts = Card.getRankCounts(cards);
        const ranks = Object.keys(rankCounts).map(Number).sort((a, b) => a - b);
        
        const playableCombinations = [];
        
        switch (lastType.type) {
            case CARD_TYPES.SINGLE:
                this.findSingleFollow(cards, ranks, rankCounts, lastType.mainRank, playableCombinations);
                break;
            case CARD_TYPES.PAIR:
                this.findPairFollow(cards, ranks, rankCounts, lastType.mainRank, playableCombinations);
                break;
            case CARD_TYPES.TRIPLE:
                this.findTripleFollow(cards, ranks, rankCounts, lastType.mainRank, playableCombinations);
                break;
            case CARD_TYPES.TRIPLE_WITH_ONE:
                this.findTripleWithOneFollow(cards, ranks, rankCounts, lastType.mainRank, playableCombinations);
                break;
            case CARD_TYPES.TRIPLE_WITH_PAIR:
                this.findTripleWithPairFollow(cards, ranks, rankCounts, lastType.mainRank, playableCombinations);
                break;
            case CARD_TYPES.STRAIGHT:
                this.findStraightFollow(cards, ranks, rankCounts, lastType.mainRank, lastType.length, playableCombinations);
                break;
            case CARD_TYPES.STRAIGHT_PAIR:
                this.findStraightPairFollow(cards, ranks, rankCounts, lastType.mainRank, lastType.length, playableCombinations);
                break;
            case CARD_TYPES.BOMB:
                this.findBombFollow(cards, ranks, rankCounts, lastType.mainRank, playableCombinations);
                break;
        }
        
        this.findBombFollow(cards, ranks, rankCounts, 0, playableCombinations);
        this.findRocketFollow(cards, playableCombinations);
        
        if (playableCombinations.length === 0) {
            return null;
        }
        
        return this.chooseBestCombination(playableCombinations, cards);
    }

    static findSingleFollow(cards, ranks, rankCounts, targetRank, result) {
        const validRanks = ranks.filter(r => r > targetRank && r < 15);
        for (const rank of validRanks) {
            if (rankCounts[rank] >= 1) {
                const card = cards.find(c => c.rank === rank);
                if (card) result.push([card]);
            }
        }
        if (rankCounts[15]) {
            const card = cards.find(c => c.rank === 15);
            if (card) result.push([card]);
        }
        if (rankCounts[16]) {
            const card = cards.find(c => c.rank === 16);
            if (card) result.push([card]);
        }
        if (rankCounts[17]) {
            const card = cards.find(c => c.rank === 17);
            if (card) result.push([card]);
        }
    }

    static findPairFollow(cards, ranks, rankCounts, targetRank, result) {
        const validRanks = ranks.filter(r => r > targetRank && r < 15);
        for (const rank of validRanks) {
            if (rankCounts[rank] >= 2) {
                const pairCards = cards.filter(c => c.rank === rank).slice(0, 2);
                if (pairCards.length === 2) result.push(pairCards);
            }
        }
        if (rankCounts[15] >= 2) {
            const pairCards = cards.filter(c => c.rank === 15).slice(0, 2);
            if (pairCards.length === 2) result.push(pairCards);
        }
    }

    static findTripleFollow(cards, ranks, rankCounts, targetRank, result) {
        const validRanks = ranks.filter(r => r > targetRank && r < 15);
        for (const rank of validRanks) {
            if (rankCounts[rank] >= 3) {
                const tripleCards = cards.filter(c => c.rank === rank).slice(0, 3);
                if (tripleCards.length === 3) result.push(tripleCards);
            }
        }
    }

    static findTripleWithOneFollow(cards, ranks, rankCounts, targetRank, result) {
        const validRanks = ranks.filter(r => r > targetRank && r < 15);
        for (const rank of validRanks) {
            if (rankCounts[rank] >= 3) {
                const tripleCards = cards.filter(c => c.rank === rank).slice(0, 3);
                const singleCards = cards.filter(c => c.rank !== rank).slice(0, 1);
                if (tripleCards.length === 3 && singleCards.length === 1) {
                    result.push([...tripleCards, ...singleCards]);
                }
            }
        }
    }

    static findTripleWithPairFollow(cards, ranks, rankCounts, targetRank, result) {
        const validRanks = ranks.filter(r => r > targetRank && r < 15);
        for (const rank of validRanks) {
            if (rankCounts[rank] >= 3) {
                const tripleCards = cards.filter(c => c.rank === rank).slice(0, 3);
                const pairRank = ranks.find(r => r !== rank && rankCounts[r] >= 2);
                if (pairRank !== undefined) {
                    const pairCards = cards.filter(c => c.rank === pairRank).slice(0, 2);
                    if (tripleCards.length === 3 && pairCards.length === 2) {
                        result.push([...tripleCards, ...pairCards]);
                    }
                }
            }
        }
    }

    static findStraightFollow(cards, ranks, rankCounts, targetRank, length, result) {
        const sortedRanks = ranks.filter(r => r < 15).sort((a, b) => a - b);
        for (let i = 0; i <= sortedRanks.length - length; i++) {
            const straightRanks = sortedRanks.slice(i, i + length);
            if (Card.isStraight(straightRanks, length) && straightRanks[length - 1] > targetRank) {
                const straightCards = [];
                for (const r of straightRanks) {
                    const card = cards.find(c => c.rank === r);
                    if (card) straightCards.push(card);
                }
                if (straightCards.length === length) {
                    result.push(straightCards);
                }
            }
        }
    }

    static findStraightPairFollow(cards, ranks, rankCounts, targetRank, length, result) {
        const sortedRanks = ranks.filter(r => r < 15 && rankCounts[r] >= 2).sort((a, b) => a - b);
        for (let i = 0; i <= sortedRanks.length - length; i++) {
            const straightRanks = sortedRanks.slice(i, i + length);
            if (Card.isStraight(straightRanks, length) && straightRanks[length - 1] > targetRank) {
                const straightCards = [];
                for (const r of straightRanks) {
                    const pairCards = cards.filter(c => c.rank === r).slice(0, 2);
                    straightCards.push(...pairCards);
                }
                if (straightCards.length === length * 2) {
                    result.push(straightCards);
                }
            }
        }
    }

    static findBombFollow(cards, ranks, rankCounts, targetRank, result) {
        for (const rank of ranks) {
            if (rankCounts[rank] === 4 && rank > targetRank) {
                const bombCards = cards.filter(c => c.rank === rank);
                if (bombCards.length === 4) {
                    result.push(bombCards);
                }
            }
        }
    }

    static findRocketFollow(cards, result) {
        const smallJoker = cards.find(c => c.rank === 16);
        const bigJoker = cards.find(c => c.rank === 17);
        if (smallJoker && bigJoker) {
            result.push([smallJoker, bigJoker]);
        }
    }

    static chooseBestCombination(combinations, allCards) {
        if (combinations.length === 0) return null;
        
        combinations.sort((a, b) => {
            const typeA = Card.getType(a);
            const typeB = Card.getType(b);
            
            if (typeA.type === CARD_TYPES.ROCKET) return 1;
            if (typeB.type === CARD_TYPES.ROCKET) return -1;
            if (typeA.type === CARD_TYPES.BOMB && typeB.type !== CARD_TYPES.BOMB) return 1;
            if (typeB.type === CARD_TYPES.BOMB && typeA.type !== CARD_TYPES.BOMB) return -1;
            
            return typeA.mainRank - typeB.mainRank;
        });
        
        const nonBombCombinations = combinations.filter(c => {
            const type = Card.getType(c);
            return type.type !== CARD_TYPES.BOMB && type.type !== CARD_TYPES.ROCKET;
        });
        
        if (nonBombCombinations.length > 0) {
            return nonBombCombinations[0];
        }
        
        return combinations[0];
    }

    static shouldPass(player, lastPlayedCards, lastPlayer, isMyTurnToStart) {
        if (isMyTurnToStart || lastPlayer === player) return false;
        
        const playable = this.findPlayableCards(player, lastPlayedCards, lastPlayer);
        if (!playable) return true;
        
        const playableType = Card.getType(playable);
        
        if (playableType.type === CARD_TYPES.BOMB || playableType.type === CARD_TYPES.ROCKET) {
            if (player.getCardsCount() > 4) {
                return Math.random() > 0.3;
            }
        }
        
        if (player.getCardsCount() <= 4) return false;
        
        return Math.random() > 0.6;
    }
}