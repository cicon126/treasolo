import { useState, useRef } from 'react';

interface UserProfileProps {
  userName: string;
  userAvatar: string;
  onNameChange: (name: string) => void;
  onAvatarChange: (avatar: string) => void;
}

const defaultAvatars = [
  '🐱', '🐶', '🦊', '🐼', '🐨', '🦁', '🐯', '🐸',
  '🦄', '🐙', '🦋', '🌸', '⭐', '🌙', '🔥', '💎'
];

const UserProfile = ({ userName, userAvatar, onNameChange, onAvatarChange }: UserProfileProps) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameSubmit = () => {
    if (tempName.trim()) {
      onNameChange(tempName.trim());
    } else {
      setTempName(userName);
    }
    setIsEditingName(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onAvatarChange(result);
      };
      reader.readAsDataURL(file);
    }
    setIsEditingAvatar(false);
  };

  const isEmojiAvatar = userAvatar.length <= 4;

  return (
    <div className="flex items-center gap-4 bg-white/20 backdrop-blur-md rounded-2xl p-4 shadow-lg">
      <div className="relative">
        <div
          className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-lg overflow-hidden"
          onClick={() => setIsEditingAvatar(!isEditingAvatar)}
        >
          {isEmojiAvatar ? (
            <span className="text-4xl">{userAvatar || '😊'}</span>
          ) : (
            <img src={userAvatar} alt="avatar" className="w-full h-full object-cover" />
          )}
        </div>

        {isEditingAvatar && (
          <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl p-4 z-20 w-64">
            <p className="text-sm text-gray-600 mb-3 font-medium">选择头像</p>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {defaultAvatars.map((emoji, idx) => (
                <button
                  key={idx}
                  className="w-12 h-12 text-2xl bg-gray-100 rounded-lg hover:bg-purple-100 hover:scale-110 transition-all"
                  onClick={() => {
                    onAvatarChange(emoji);
                    setIsEditingAvatar(false);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="border-t pt-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                onClick={() => fileInputRef.current?.click()}
              >
                上传本地图片
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1">
        {isEditingName ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
              className="flex-1 px-3 py-2 rounded-lg border-2 border-purple-400 focus:outline-none focus:border-purple-600 bg-white/90"
              autoFocus
              maxLength={20}
            />
            <button
              onClick={handleNameSubmit}
              className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              ✓
            </button>
            <button
              onClick={() => {
                setTempName(userName);
                setIsEditingName(false);
              }}
              className="px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          <div
            className="cursor-pointer group"
            onClick={() => setIsEditingName(true)}
          >
            <h2 className="text-2xl font-bold text-white group-hover:text-purple-200 transition-colors flex items-center gap-2">
              {userName}
              <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
            </h2>
            <p className="text-white/70 text-sm">点击修改昵称</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
