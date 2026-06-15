import { Puzzle } from 'lucide-react';
import { GameBoard } from '@/components/GameBoard';
import { GameStats } from '@/components/GameStats';
import { GameControls } from '@/components/GameControls';
import { CompleteModal } from '@/components/CompleteModal';

export default function Home() {
  return (
    <div className="min-h-screen py-8 px-4 md:py-12">
      <div className="max-w-6xl mx-auto">
        <header
          className="text-center mb-10 md:mb-14 animate-fade-up"
          style={{ animationDelay: '0s' }}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent
                          to-primary-500 flex items-center justify-center
                          shadow-lg shadow-accent/30"
            >
              <Puzzle className="w-7 h-7 text-white" />
            </div>
            <h1
              className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r
                         from-white via-accent to-primary-400 bg-clip-text
                         text-transparent"
            >
              拼图滑块
            </h1>
          </div>
          <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
            移动方块，复原图片。支持自定义图片上传，
            <span className="text-accent"> 3×3 </span>
            /
            <span className="text-primary-400"> 4×4 </span>
            /
            <span className="text-warn"> 5×5 </span>
            多种难度挑战
          </p>
        </header>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-10 items-start">
          <div
            className="space-y-6 animate-fade-up"
            style={{ animationDelay: '0.1s' }}
          >
            <GameStats />
            <GameBoard />

            <div
              className="text-center text-sm text-gray-500 animate-fade-up"
              style={{ animationDelay: '0.25s' }}
            >
              <p>💡 点击空白格相邻的方块即可滑动</p>
            </div>
          </div>

          <aside className="lg:sticky lg:top-8">
            <GameControls />
          </aside>
        </div>

        <footer
          className="mt-16 text-center text-xs text-gray-600 animate-fade-up"
          style={{ animationDelay: '0.35s' }}
        >
          <p>用 ❤️ 和 React 构建 · 记录保存在本地浏览器</p>
        </footer>
      </div>

      <CompleteModal />
    </div>
  );
}
