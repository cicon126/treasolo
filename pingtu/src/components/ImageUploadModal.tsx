import React, { useRef, useState, useCallback } from 'react';
import { X, Upload, Image as ImageIcon, Check } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface ImageUploadModalProps {
  onClose: () => void;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ onClose }) => {
  const { dispatch } = useGameStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreviewUrl(url);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = 800;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;
          ctx.drawImage(img, sx, sy, size, size, 0, 0, 800, 800);
          setCroppedUrl(canvas.toDataURL('image/jpeg', 0.92));
        }
      };
      img.src = url;
    };
    reader.onerror = () => setError('读取图片失败');
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleConfirm = () => {
    if (croppedUrl) {
      dispatch({ type: 'SET_IMAGE', payload: croppedUrl });
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4
                 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-card p-6 w-full max-w-md animate-bounce-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-display font-bold text-white">上传自定义图片</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10
                     flex items-center justify-center text-gray-400 hover:text-white
                     transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!previewUrl && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
              transition-all duration-300
              ${isDragging
                ? 'border-accent bg-accent/10 scale-[1.02]'
                : 'border-white/20 hover:border-accent/50 hover:bg-white/5'
              }
            `}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br
                          from-primary-500/30 to-accent/30 flex items-center justify-center">
              {isDragging ? (
                <ImageIcon className="w-8 h-8 text-accent" />
              ) : (
                <Upload className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <p className="text-white font-medium mb-1">
              {isDragging ? '释放以上传图片' : '点击或拖拽上传图片'}
            </p>
            <p className="text-sm text-gray-500">
              支持 JPG / PNG / WEBP，最大 10MB
            </p>
            {error && (
              <p className="text-sm text-red-400 mt-3">{error}</p>
            )}
          </div>
        )}

        {previewUrl && (
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden
                          ring-2 ring-accent/30">
              <img
                src={croppedUrl || previewUrl}
                alt="预览"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full
                            bg-black/60 backdrop-blur-sm text-xs text-white
                            flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-accent" />
                已自动裁剪为正方形
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setPreviewUrl(null);
                  setCroppedUrl(null);
                  setError(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="btn-secondary"
              >
                重新选择
              </button>
              <button
                onClick={handleConfirm}
                disabled={!croppedUrl}
                className="btn-accent disabled:opacity-50"
              >
                确认使用
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};
