import { useState, useCallback } from 'react';
import { Gem, Position, GameState } from '@/types/game';
import {
  createInitialBoard,
  isAdjacent,
  swapGems,
  findMatches,
  markMatched,
  dropGems,
  calculateScore,
} from '@/utils/gemUtils';

export function useGameLogic() {
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: createInitialBoard(),
    score: 0,
    selectedGem: null,
    isAnimating: false,
    matchedCount: 0,
    combo: 0,
  }));

  const processMatches = useCallback(async (board: Gem[][], currentScore: number, combo: number): Promise<{ board: Gem[][]; score: number; totalMatched: number; combo: number }> => {
    const matches = findMatches(board);
    
    if (matches.length === 0) {
      return { board, score: currentScore, totalMatched: 0, combo: 0 };
    }
    
    const newCombo = combo + 1;
    const scoreGain = calculateScore(matches, newCombo);
    const matchedBoard = markMatched(board, matches);
    
    setGameState(prev => ({
      ...prev,
      board: matchedBoard,
      score: currentScore + scoreGain,
      isAnimating: true,
      combo: newCombo,
    }));
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const droppedBoard = dropGems(matchedBoard);
    
    setGameState(prev => ({
      ...prev,
      board: droppedBoard,
    }));
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const resetBoard = droppedBoard.map(row => 
      row.map(gem => ({ ...gem, isNew: false, isFalling: false, isMatched: false }))
    );
    
    const result = await processMatches(resetBoard, currentScore + scoreGain, newCombo);
    
    return {
      board: result.board,
      score: result.score,
      totalMatched: matches.length + result.totalMatched,
      combo: result.combo,
    };
  }, []);

  const handleGemClick = useCallback(async (row: number, col: number) => {
    if (gameState.isAnimating) return;
    
    const clickedPos: Position = { row, col };
    
    if (!gameState.selectedGem) {
      setGameState(prev => ({ ...prev, selectedGem: clickedPos }));
      return;
    }
    
    if (gameState.selectedGem.row === row && gameState.selectedGem.col === col) {
      setGameState(prev => ({ ...prev, selectedGem: null }));
      return;
    }
    
    if (!isAdjacent(gameState.selectedGem, clickedPos)) {
      setGameState(prev => ({ ...prev, selectedGem: clickedPos }));
      return;
    }
    
    const swappedBoard = swapGems(gameState.board, gameState.selectedGem, clickedPos);
    
    const matches = findMatches(swappedBoard);
    
    if (matches.length === 0) {
      setGameState(prev => ({
        ...prev,
        board: swappedBoard,
        selectedGem: null,
        isAnimating: true,
      }));
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setGameState(prev => ({
        ...prev,
        board: gameState.board,
        isAnimating: false,
      }));
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      board: swappedBoard,
      selectedGem: null,
      isAnimating: true,
    }));
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const result = await processMatches(swappedBoard, gameState.score, 0);
    
    setGameState(prev => ({
      ...prev,
      board: result.board,
      score: result.score,
      isAnimating: false,
      matchedCount: prev.matchedCount + result.totalMatched,
      combo: 0,
    }));
  }, [gameState.board, gameState.selectedGem, gameState.isAnimating, gameState.score, processMatches]);

  const resetGame = useCallback(() => {
    setGameState({
      board: createInitialBoard(),
      score: 0,
      selectedGem: null,
      isAnimating: false,
      matchedCount: 0,
      combo: 0,
    });
  }, []);

  return {
    board: gameState.board,
    score: gameState.score,
    selectedGem: gameState.selectedGem,
    isAnimating: gameState.isAnimating,
    matchedCount: gameState.matchedCount,
    combo: gameState.combo,
    handleGemClick,
    resetGame,
  };
}
