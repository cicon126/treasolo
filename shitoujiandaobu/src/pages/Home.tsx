import { useState, useEffect } from 'react';
import UserProfile from '@/components/UserProfile';
import GameArena from '@/components/GameArena';
import ScoreBoard from '@/components/ScoreBoard';
import Fireworks from '@/components/Fireworks';

type Result = 'win' | 'lose' | 'draw' | null;

export default function Home() {
  const [userName, setUserName] = useState('玩家');
  const [userAvatar, setUserAvatar] = useState('😊');
  const [scores, setScores] = useState({ wins: 0, losses: 0, draws: 0 });
  const [showFireworks, setShowFireworks] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('rps_userName');
    const savedAvatar = localStorage.getItem('rps_userAvatar');
    const savedScores = localStorage.getItem('rps_scores');

    if (savedName) setUserName(savedName);
    if (savedAvatar) setUserAvatar(savedAvatar);
    if (savedScores) setScores(JSON.parse(savedScores));
  }, []);

  const handleNameChange = (name: string) => {
    setUserName(name);
    localStorage.setItem('rps_userName', name);
  };

  const handleAvatarChange = (avatar: string) => {
    setUserAvatar(avatar);
    localStorage.setItem('rps_userAvatar', avatar);
  };

  const handleGameEnd = (result: Result) => {
    if (!result) return;

    const newScores = { ...scores };
    if (result === 'win') {
      newScores.wins++;
      setShowFireworks(true);
      
      setTimeout(() => {
        setShowFireworks(false);
      }, 5000);
    } else if (result === 'lose') {
      newScores.losses++;
    } else {
      newScores.draws++;
    }

    setScores(newScores);
    localStorage.setItem('rps_scores', JSON.stringify(newScores));
  };

  const handleResetScores = () => {
    const newScores = { wins: 0, losses: 0, draws: 0 };
    setScores(newScores);
    localStorage.setItem('rps_scores', JSON.stringify(newScores));
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <Fireworks active={showFireworks} />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-center text-white mb-8 drop-shadow-lg">
          ✊ 石头剪刀布 ✌️
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <UserProfile
              userName={userName}
              userAvatar={userAvatar}
              onNameChange={handleNameChange}
              onAvatarChange={handleAvatarChange}
            />
            <ScoreBoard
              wins={scores.wins}
              losses={scores.losses}
              draws={scores.draws}
            />
            <button
              onClick={handleResetScores}
              className="w-full py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors font-medium"
            >
              🔄 重置战绩
            </button>
          </div>

          <div className="lg:col-span-2">
            <GameArena
              onGameEnd={handleGameEnd}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
            />
          </div>
        </div>

        <div className="mt-8 text-center text-white/60 text-sm">
          <p>💡 提示：点击头像可以更换头像，点击昵称可以修改名字</p>
          <p className="mt-1">祝你玩得开心！🎮</p>
        </div>
      </div>
    </div>
  );
}
