import { RotateCcw, Home, Lightbulb } from 'lucide-react';

interface ActionButtonsProps {
  onReset: () => void;
  onHome: () => void;
  onHint: () => void;
}

export function ActionButtons({ onReset, onHome, onHint }: ActionButtonsProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mt-4 sm:mt-6 relative z-10">
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
        <ActionButton
          onClick={onHome}
          icon={<Home size={18} />}
          label="主菜单"
          variant="pink"
        />
        <ActionButton
          onClick={onHint}
          icon={<Lightbulb size={18} />}
          label="提示"
          variant="yellow"
        />
        <ActionButton
          onClick={onReset}
          icon={<RotateCcw size={18} />}
          label="重新开始"
          variant="cyan"
        />
      </div>
    </div>
  );
}

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant: 'cyan' | 'pink' | 'yellow';
}

function ActionButton({ onClick, icon, label, variant }: ActionButtonProps) {
  const variantStyles = {
    cyan: 'border-neon-cyan/50 hover:border-neon-cyan hover:shadow-[0_0_20px_rgba(0,245,255,0.4)] text-neon-cyan hover:text-neon-cyan',
    pink: 'border-neon-pink/50 hover:border-neon-pink hover:shadow-[0_0_20px_rgba(255,0,255,0.4)] text-neon-pink hover:text-neon-pink',
    yellow: 'border-neon-yellow/50 hover:border-neon-yellow hover:shadow-[0_0_20px_rgba(255,255,0,0.4)] text-neon-yellow hover:text-neon-yellow',
  };

  return (
    <button
      onClick={onClick}
      className={`
        glass-btn ${variant === 'pink' ? 'glass-btn-pink' : ''}
        flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl
        font-mono text-xs sm:text-sm font-bold
        border-2 ${variantStyles[variant]}
        active:scale-95 transition-all duration-200
        ${variant === 'yellow' ? '!border-neon-yellow/50 hover:!border-neon-yellow' : ''}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
