import { useState } from 'react';

type Choice = 'rock' | 'paper' | 'scissors' | null;
type Result = 'win' | 'lose' | 'draw' | null;

interface GameArenaProps {
  onGameEnd: (result: Result) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

const choices: { key: Choice; emoji: string; label: string }[] = [
  { key: 'rock', emoji: '✊', label: '石头' },
  { key: 'paper', emoji: '✋', label: '布' },
  { key: 'scissors', emoji: '✌️', label: '剪刀' },
];

const rules: Record<string, string> = {
  rock: 'scissors',
  paper: 'rock',
  scissors: 'paper',
};

const GameArena = ({ onGameEnd, isPlaying, setIsPlaying }: GameArenaProps) => {
  const [playerChoice, setPlayerChoice] = useState<Choice>(null);
  const [computerChoice, setComputerChoice] = useState<Choice>(null);
  const [result, setResult] = useState<Result>(null);
  const [isShaking, setIsShaking] = useState(false);

  const getComputerChoice = (): Choice => {
    const random = Math.floor(Math.random() * 3);
    return choices[random].key;
  };

  const determineWinner = (player: Choice, computer: Choice): Result => {
    if (!player || !computer) return null;
    if (player === computer) return 'draw';
    return rules[player] === computer ? 'win' : 'lose';
  };

  const handleChoice = (choice: Choice) => {
    if (isPlaying) return;

    setIsPlaying(true);
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setIsShaking(true);

    setTimeout(() => {
      setIsShaking(false);
      const computer = getComputerChoice();
      setPlayerChoice(choice);
      setComputerChoice(computer);

      const gameResult = determineWinner(choice, computer);
      setResult(gameResult);
      onGameEnd(gameResult);

      setTimeout(() => {
        setIsPlaying(false);
      }, 1500);
    }, 1000);
  };

  const getResultText = () => {
    switch (result) {
      case 'win': return '🎉 你赢了！';
      case 'lose': return '😢 你输了！';
      case 'draw': return '🤝 平局！';
      default: return '';
    }
  };

  const getResultColor = () => {
    switch (result) {
      case 'win': return 'text-green-400';
      case 'lose': return 'text-red-400';
      case 'draw': return 'text-yellow-400';
      default: return '';
    }
  };

  const getChoiceEmoji = (choice: Choice) => {
    return choices.find(c => c.key === choice)?.emoji || '❓';
  };

  return (
    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 shadow-lg flex-1">
      <div className="flex items-center justify-around mb-8">
        <div className="text-center">
          <div className="text-4xl mb-2">😊</div>
          <div className="text-white font-medium">你</div>
        </div>
        <div className="text-4xl text-white font-bold animate-float">VS</div>
        <div className="text-center">
          <div className="text-4xl mb-2">🤖</div>
          <div className="text-white font-medium">电脑</div>
        </div>
      </div>

      <div className="flex items-center justify-around mb-8">
        <div className={`w-28 h-28 bg-white/30 rounded-2xl flex items-center justify-center ${isShaking ? 'animate-shake' : ''}`}>
          <span className={`choice-emoji ${playerChoice ? 'player' : ''} ${!playerChoice && !isShaking ? 'opacity-50' : ''}`}>
            {isShaking ? '✊' : getChoiceEmoji(playerChoice)}
          </span>
        </div>
        <div className={`w-28 h-28 bg-white/30 rounded-2xl flex items-center justify-center ${isShaking ? 'animate-shake' : ''}`}>
          <span className={`choice-emoji ${!computerChoice && !isShaking ? 'opacity-50' : ''}`}>
            {isShaking ? '✊' : getChoiceEmoji(computerChoice)}
          </span>
        </div>
      </div>

      {result && (
        <div className={`text-center text-3xl font-bold ${getResultColor()} mb-6 animate-bounce-in`}>
          {getResultText()}
        </div>
      )}

      <div className="flex justify-center gap-4">
        {choices.map((choice) => (
          <button
            key={choice.key}
            onClick={() => handleChoice(choice.key)}
            disabled={isPlaying}
            className={`game-button w-24 h-24 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex flex-col items-center justify-center shadow-lg ${
              isPlaying ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl cursor-pointer'
            }`}
          >
            <span className="text-4xl">{choice.emoji}</span>
            <span className="text-white text-sm font-medium mt-1">{choice.label}</span>
          </button>
        ))}
      </div>

      <p className="text-center text-white/70 mt-4 text-sm">
        点击选择出拳，石头胜剪刀，剪刀胜布，布胜石头
      </p>
    </div>
  );
};

export default GameArena;
