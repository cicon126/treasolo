import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Difficulty, DIFFICULTY_CONFIG, generateCards, getNextDifficulty } from '../utils/cardGenerator';
import { calculateScore, saveBestScore } from '../utils/formatters';

export type GameStatus = 'selecting' | 'playing' | 'victory';

interface GameState {
  difficulty: Difficulty;
  cards: Card[];
  selectedCards: number[];
  moves: number;
  matches: number;
  score: number;
  elapsedTime: number;
  gameStatus: GameStatus;
  mismatchedCards: number[];
}

export function useGameLogic() {
  const [state, setState] = useState<GameState>({
    difficulty: '4x4',
    cards: [],
    selectedCards: [],
    moves: 0,
    matches: 0,
    score: 0,
    elapsedTime: 0,
    gameStatus: 'selecting',
    mismatchedCards: [],
  });

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    startTimeRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      setState((prev) => ({
        ...prev,
        elapsedTime: Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000),
      }));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startGame = useCallback((difficulty: Difficulty) => {
    stopTimer();
    const cards = generateCards(difficulty);
    setState({
      difficulty,
      cards,
      selectedCards: [],
      moves: 0,
      matches: 0,
      score: 0,
      elapsedTime: 0,
      gameStatus: 'playing',
      mismatchedCards: [],
    });
    startTimer();
  }, [startTimer, stopTimer]);

  const resetGame = useCallback(() => {
    startGame(state.difficulty);
  }, [startGame, state.difficulty]);

  const goToMenu = useCallback(() => {
    stopTimer();
    setState((prev) => ({ ...prev, gameStatus: 'selecting' }));
  }, [stopTimer]);

  const nextLevel = useCallback(() => {
    const next = getNextDifficulty(state.difficulty);
    if (next) {
      startGame(next);
    }
  }, [state.difficulty, startGame]);

  const showHint = useCallback(() => {
    if (isProcessingRef.current || state.gameStatus !== 'playing') return;

    const unmatched = state.cards
      .map((card, idx) => ({ ...card, index: idx }))
      .filter((c) => !c.isMatched && !c.isFlipped);

    if (unmatched.length < 2) return;

    const pairMap = new Map<number, number[]>();
    unmatched.forEach((c) => {
      if (!pairMap.has(c.pairId)) pairMap.set(c.pairId, []);
      pairMap.get(c.pairId)!.push(c.index);
    });

    for (const [, indices] of pairMap) {
      if (indices.length >= 2) {
        const [i1, i2] = indices;
        setState((prev) => ({
          ...prev,
          cards: prev.cards.map((card, idx) =>
            idx === i1 || idx === i2 ? { ...card, isFlipped: true } : card
          ),
        }));

        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            cards: prev.cards.map((card, idx) =>
              idx === i1 || idx === i2 ? { ...card, isFlipped: false } : card
            ),
          }));
        }, 1000);
        break;
      }
    }
  }, [state.cards, state.gameStatus]);

  const handleCardClick = useCallback((index: number) => {
    if (isProcessingRef.current) return;
    if (state.gameStatus !== 'playing') return;
    if (state.cards[index].isFlipped || state.cards[index].isMatched) return;
    if (state.selectedCards.length >= 2) return;

    setState((prev) => {
      const newSelectedCards = [...prev.selectedCards, index];
      const newCards = prev.cards.map((card, idx) =>
        idx === index ? { ...card, isFlipped: true } : card
      );

      if (newSelectedCards.length === 2) {
        isProcessingRef.current = true;
        const [firstIdx, secondIdx] = newSelectedCards;
        const firstCard = newCards[firstIdx];
        const secondCard = newCards[secondIdx];
        const isMatch = firstCard.pairId === secondCard.pairId;

        setTimeout(() => {
          setState((prev2) => {
            const updatedCards = prev2.cards.map((card, idx) => {
              if (idx === firstIdx || idx === secondIdx) {
                if (isMatch) {
                  return { ...card, isMatched: true };
                } else {
                  return { ...card, isFlipped: false };
                }
              }
              return card;
            });

            const newMatches = isMatch ? prev2.matches + 1 : prev2.matches;
            const totalPairs = DIFFICULTY_CONFIG[prev2.difficulty].totalPairs;
            const isVictory = newMatches === totalPairs;

            if (isVictory) {
              stopTimer();
              const finalScore = calculateScore(
                newMatches,
                prev2.moves,
                prev2.elapsedTime,
                totalPairs
              );
              saveBestScore(prev2.difficulty, finalScore);
            }

            isProcessingRef.current = false;

            return {
              ...prev2,
              cards: updatedCards,
              selectedCards: [],
              moves: prev2.moves + 1,
              matches: newMatches,
              score: isMatch
                ? prev2.score + 100
                : Math.max(0, prev2.score - 10),
              mismatchedCards: isMatch ? [] : [firstIdx, secondIdx],
              gameStatus: isVictory ? 'victory' : prev2.gameStatus,
            };
          });

          setTimeout(() => {
            setState((prev2) => ({ ...prev2, mismatchedCards: [] }));
          }, 500);
        }, 800);

        return {
          ...prev,
          cards: newCards,
          selectedCards: newSelectedCards,
          moves: prev.moves + 1,
        };
      }

      return {
        ...prev,
        cards: newCards,
        selectedCards: newSelectedCards,
      };
    });
  }, [state.cards, state.gameStatus, state.selectedCards.length, stopTimer]);

  return {
    ...state,
    totalPairs: DIFFICULTY_CONFIG[state.difficulty].totalPairs,
    startGame,
    resetGame,
    goToMenu,
    nextLevel,
    showHint,
    handleCardClick,
    hasNextLevel: getNextDifficulty(state.difficulty) !== null,
  };
}
