const CARD_SUITS = ['♠', '♥', '♣', '♦'];
const CARD_VALUES = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
const CARD_RANKS = {
    '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14, '2': 15, '小王': 16, '大王': 17
};

const CARD_TYPES = {
    SINGLE: 'single',
    PAIR: 'pair',
    TRIPLE: 'triple',
    TRIPLE_WITH_ONE: 'triple_with_one',
    TRIPLE_WITH_PAIR: 'triple_with_pair',
    STRAIGHT: 'straight',
    STRAIGHT_PAIR: 'straight_pair',
    PLANE: 'plane',
    PLANE_WITH_SINGLE: 'plane_with_single',
    PLANE_WITH_PAIR: 'plane_with_pair',
    FOUR_WITH_TWO: 'four_with_two',
    FOUR_WITH_TWO_PAIRS: 'four_with_two_pairs',
    BOMB: 'bomb',
    ROCKET: 'rocket',
    INVALID: 'invalid'
};

class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
        this.rank = CARD_RANKS[value];
        this.isRed = (suit === '♥' || suit === '♦');
        this.id = `${suit}${value}`;
    }

    static createJoker(isBig) {
        const card = new Card('', isBig ? '大王' : '小王');
        card.isRed = true;
        return card;
    }

    static createDeck() {
        const deck = [];
        for (const suit of CARD_SUITS) {
            for (const value of CARD_VALUES) {
                deck.push(new Card(suit, value));
            }
        }
        deck.push(Card.createJoker(false));
        deck.push(Card.createJoker(true));
        return deck;
    }

    static shuffle(deck) {
        const shuffled = [...deck];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    static sortCards(cards, ascending = true) {
        return [...cards].sort((a, b) => {
            return ascending ? a.rank - b.rank : b.rank - a.rank;
        });
    }

    static getCardCounts(cards) {
        const counts = {};
        for (const card of cards) {
            counts[card.value] = (counts[card.value] || 0) + 1;
        }
        return counts;
    }

    static getRankCounts(cards) {
        const counts = {};
        for (const card of cards) {
            counts[card.rank] = (counts[card.rank] || 0) + 1;
        }
        return counts;
    }

    static getType(cards) {
        const len = cards.length;
        if (len === 0) return CARD_TYPES.INVALID;

        const rankCounts = Card.getRankCounts(cards);
        const counts = Object.values(rankCounts).sort((a, b) => b - a);
        const ranks = Object.keys(rankCounts).map(Number).sort((a, b) => a - b);

        if (len === 1) {
            return { type: CARD_TYPES.SINGLE, mainRank: ranks[0], length: 1 };
        }

        if (len === 2) {
            if (counts[0] === 2) {
                return { type: CARD_TYPES.PAIR, mainRank: ranks[0], length: 1 };
            }
            if (ranks.includes(16) && ranks.includes(17)) {
                return { type: CARD_TYPES.ROCKET, mainRank: 17, length: 1 };
            }
            return { type: CARD_TYPES.INVALID };
        }

        if (len === 3) {
            if (counts[0] === 3) {
                return { type: CARD_TYPES.TRIPLE, mainRank: ranks[0], length: 1 };
            }
            return { type: CARD_TYPES.INVALID };
        }

        if (len === 4) {
            if (counts[0] === 4) {
                return { type: CARD_TYPES.BOMB, mainRank: ranks[0], length: 1 };
            }
            if (counts[0] === 3 && counts[1] === 1) {
                const tripleRank = ranks.find(r => rankCounts[r] === 3);
                return { type: CARD_TYPES.TRIPLE_WITH_ONE, mainRank: tripleRank, length: 1 };
            }
            return { type: CARD_TYPES.INVALID };
        }

        if (len === 5) {
            if (counts[0] === 3 && counts[1] === 2) {
                const tripleRank = ranks.find(r => rankCounts[r] === 3);
                return { type: CARD_TYPES.TRIPLE_WITH_PAIR, mainRank: tripleRank, length: 1 };
            }
            if (Card.isStraight(ranks, 5)) {
                return { type: CARD_TYPES.STRAIGHT, mainRank: ranks[ranks.length - 1], length: 5 };
            }
        }

        if (len >= 5 && Card.isStraight(ranks, len)) {
            return { type: CARD_TYPES.STRAIGHT, mainRank: ranks[ranks.length - 1], length: len };
        }

        if (len >= 6 && len % 2 === 0) {
            const pairLen = len / 2;
            if (counts.every(c => c === 2) && Card.isStraight(ranks, pairLen)) {
                return { type: CARD_TYPES.STRAIGHT_PAIR, mainRank: ranks[ranks.length - 1], length: pairLen };
            }
        }

        if (len >= 6 && len % 3 === 0) {
            const planeLen = len / 3;
            if (counts.every(c => c === 3) && Card.isStraight(ranks, planeLen)) {
                return { type: CARD_TYPES.PLANE, mainRank: ranks[ranks.length - 1], length: planeLen };
            }
        }

        if (len >= 5) {
            const tripleRanks = ranks.filter(r => rankCounts[r] === 3);
            if (tripleRanks.length >= 2 && Card.isStraight(tripleRanks, tripleRanks.length)) {
                const singleCount = len - tripleRanks.length * 3;
                if (singleCount === tripleRanks.length) {
                    return { type: CARD_TYPES.PLANE_WITH_SINGLE, mainRank: tripleRanks[tripleRanks.length - 1], length: tripleRanks.length };
                }
                if (singleCount === tripleRanks.length * 2 && counts.filter(c => c === 2).length === tripleRanks.length) {
                    return { type: CARD_TYPES.PLANE_WITH_PAIR, mainRank: tripleRanks[tripleRanks.length - 1], length: tripleRanks.length };
                }
            }
        }

        if (len === 6) {
            if (counts[0] === 4 && counts[1] === 1 && counts[2] === 1) {
                const fourRank = ranks.find(r => rankCounts[r] === 4);
                return { type: CARD_TYPES.FOUR_WITH_TWO, mainRank: fourRank, length: 1 };
            }
        }

        if (len === 8) {
            if (counts[0] === 4 && counts[1] === 2 && counts[2] === 2) {
                const fourRank = ranks.find(r => rankCounts[r] === 4);
                return { type: CARD_TYPES.FOUR_WITH_TWO_PAIRS, mainRank: fourRank, length: 1 };
            }
        }

        return { type: CARD_TYPES.INVALID };
    }

    static isStraight(ranks, length) {
        if (ranks.length !== length) return false;
        const sorted = [...ranks].sort((a, b) => a - b);
        if (sorted.some(r => r >= 15)) return false;
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] - sorted[i - 1] !== 1) return false;
        }
        return true;
    }

    static canBeat(cards, lastCards) {
        if (!lastCards || lastCards.length === 0) {
            return Card.getType(cards).type !== CARD_TYPES.INVALID;
        }

        const currentType = Card.getType(cards);
        const lastType = Card.getType(lastCards);

        if (currentType.type === CARD_TYPES.INVALID) return false;
        if (currentType.type === CARD_TYPES.ROCKET) return true;
        if (lastType.type === CARD_TYPES.ROCKET) return false;
        if (currentType.type === CARD_TYPES.BOMB && lastType.type !== CARD_TYPES.BOMB) return true;
        if (currentType.type === CARD_TYPES.BOMB && lastType.type === CARD_TYPES.BOMB) {
            return currentType.mainRank > lastType.mainRank;
        }

        if (currentType.type !== lastType.type) return false;
        if (currentType.length !== lastType.length) return false;

        return currentType.mainRank > lastType.mainRank;
    }

    static getTypeDescription(typeInfo) {
        const descriptions = {
            [CARD_TYPES.SINGLE]: '单张',
            [CARD_TYPES.PAIR]: '对子',
            [CARD_TYPES.TRIPLE]: '三张',
            [CARD_TYPES.TRIPLE_WITH_ONE]: '三带一',
            [CARD_TYPES.TRIPLE_WITH_PAIR]: '三带二',
            [CARD_TYPES.STRAIGHT]: '顺子',
            [CARD_TYPES.STRAIGHT_PAIR]: '连对',
            [CARD_TYPES.PLANE]: '飞机',
            [CARD_TYPES.PLANE_WITH_SINGLE]: '飞机带单',
            [CARD_TYPES.PLANE_WITH_PAIR]: '飞机带双',
            [CARD_TYPES.FOUR_WITH_TWO]: '四带二',
            [CARD_TYPES.FOUR_WITH_TWO_PAIRS]: '四带两对',
            [CARD_TYPES.BOMB]: '炸弹',
            [CARD_TYPES.ROCKET]: '王炸',
            [CARD_TYPES.INVALID]: '无效牌型'
        };
        return descriptions[typeInfo.type] || '未知';
    }
}