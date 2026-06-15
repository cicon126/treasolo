import React from 'react';
import { X, Check } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { DEFAULT_IMAGES } from '../assets/default-images';

interface ImageSelectorProps {
  onClose: () => void;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({ onClose }) => {
  const { imageUrl, dispatch } = useGameStore();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4
                 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-card p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden
                   flex flex-col animate-bounce-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-display font-bold text-white">选择图片</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10
                     flex items-center justify-center text-gray-400 hover:text-white
                     transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto
                     scrollbar-hide pr-2"
        >
          {DEFAULT_IMAGES.map((img, i) => (
            <button
              key={i}
              onClick={() => {
                dispatch({ type: 'SET_IMAGE', payload: img.url });
                onClose();
              }}
              className={`
                relative aspect-square rounded-xl overflow-hidden group
                ring-2 transition-all duration-300
                ${imageUrl === img.url
                  ? 'ring-accent shadow-lg shadow-accent/30'
                  : 'ring-transparent hover:ring-white/30'
                }
              `}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <img
                src={img.url}
                alt={img.name}
                className="w-full h-full object-cover transition-transform duration-500
                           group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                <p className="text-white text-sm font-medium">{img.name}</p>
              </div>
              {imageUrl === img.url && (
                <div className="absolute top-2 right-2 w-7 h-7 rounded-full
                              bg-accent flex items-center justify-center">
                  <Check className="w-4 h-4 text-slate-900" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
