import React, { useState } from 'react';
import { Shuffle, RotateCcw, Undo2, Eye, ImagePlus, Trophy, X } from 'lucide-react';
import type { Difficulty } from '../types/game';
import { useGameStore } from '../store/gameStore';
import { formatTime, formatDate } from '../game/logic';
import { ImageSelector } from './ImageSelector';
import { ImageUploadModal } from './ImageUploadModal';

export const GameControls: React.FC = () => {
  const {
    size,
    isPlaying,
    isCompleted,
    moveHistory,
    dispatch,
    bestRecords,
  } = useGameStore();

  const [showImageSelector, setShowImageSelector] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRecords, setShowRecords] = useState(false);

  const difficulties: { value: Difficulty; label: string; desc: string }[] = [
    { value: 3, label: '3×3', desc: '简单' },
    { value: 4, label: '4×4', desc: '中等' },
    { value: 5, label: '5×5', desc: '困难' },
  ];

  const groupedRecords = {
    3: bestRecords.filter(r => r.size === 3).slice(0, 3),
    4: bestRecords.filter(r => r.size === 4).slice(0, 3),
    5: bestRecords.filter(r => r.size === 5).slice(0, 3),
  };

  return (
    <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
      <div className="glass-card p-5 space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-accent" />
            选择难度
          </h3>
          <div className="flex gap-2 flex-wrap">
            {difficulties.map(d => (
              <button
                key={d.value}
                data-selected={size === d.value}
                onClick={() =>
                  !isPlaying && dispatch({ type: 'SET_DIFFICULTY', payload: d.value })
                }
                disabled={isPlaying}
                className="difficulty-btn flex-1 min-w-[90px] disabled:opacity-50"
              >
                <div className="text-lg font-bold">{d.label}</div>
                <div className="text-[10px] opacity-80">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-primary-400" />
            游戏图片
          </h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowImageSelector(true)}
              disabled={isPlaying}
              className="btn-secondary flex-1 min-w-[130px] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Eye className="w-4 h-4" />
              图片库
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              disabled={isPlaying}
              className="btn-secondary flex-1 min-w-[130px] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ImagePlus className="w-4 h-4" />
              上传图片
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-warn" />
          操作控制
        </h3>

        {!isPlaying && !isCompleted && (
          <button
            onClick={() => dispatch({ type: 'SHUFFLE' })}
            className="btn-accent w-full flex items-center justify-center gap-2 text-base"
          >
            <Shuffle className="w-5 h-5" />
            开始游戏 · 打乱拼图
          </button>
        )}

        {(isPlaying || isCompleted) && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => dispatch({ type: 'SHUFFLE' })}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <Shuffle className="w-4 h-4" />
              重新开始
            </button>
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              复原
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_PREVIEW', payload: true })}
            disabled={!isPlaying}
            className="btn-secondary py-2.5 flex items-center justify-center gap-1.5 text-sm disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            原图
          </button>
          <button
            onClick={() => dispatch({ type: 'UNDO' })}
            disabled={!isPlaying || moveHistory.length === 0}
            className="btn-secondary py-2.5 flex items-center justify-center gap-1.5 text-sm disabled:opacity-50"
          >
            <Undo2 className="w-4 h-4" />
            撤销
          </button>
          <button
            onClick={() => setShowRecords(true)}
            className="btn-secondary py-2.5 flex items-center justify-center gap-1.5 text-sm"
          >
            <Trophy className="w-4 h-4" />
            排行
          </button>
        </div>
      </div>

      {showImageSelector && (
        <ImageSelector onClose={() => setShowImageSelector(false)} />
      )}

      {showUploadModal && (
        <ImageUploadModal onClose={() => setShowUploadModal(false)} />
      )}

      {showRecords && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4
                     bg-black/70 backdrop-blur-sm"
          onClick={() => setShowRecords(false)}
        >
          <div
            className="glass-card p-6 w-full max-w-md animate-bounce-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-warn" />
                最佳成绩排行榜
              </h2>
              <button
                onClick={() => setShowRecords(false)}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10
                         flex items-center justify-center text-gray-400 hover:text-white
                         transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {([3, 4, 5] as Difficulty[]).map(s => (
                <div key={s}>
                  <h3 className="text-sm font-semibold text-accent mb-2">
                    {s}×{s} 模式
                  </h3>
                  {groupedRecords[s].length > 0 ? (
                    <div className="space-y-1.5">
                      {groupedRecords[s].map((record, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between px-3 py-2
                                   rounded-lg bg-white/5 border border-white/5
                                   text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center
                                        text-xs font-bold ${
                                          i === 0
                                            ? 'bg-yellow-500/20 text-yellow-400'
                                            : i === 1
                                            ? 'bg-gray-400/20 text-gray-300'
                                            : 'bg-orange-500/20 text-orange-400'
                                        }`}
                            >
                              {i + 1}
                            </span>
                            <span className="font-mono text-white">
                              {record.moves}步
                            </span>
                            <span className="font-mono text-accent">
                              {formatTime(record.time)}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(record.date)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic px-3 py-2">
                      暂无记录，快来挑战吧！
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
