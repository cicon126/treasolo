let synth: SpeechSynthesis | null = null;
let isSupported = false;

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  synth = window.speechSynthesis;
  isSupported = true;
}

function speak(text: string, rate: number = 1.0, pitch: number = 1.0): void {
  if (!synth || !isSupported) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = 0.8;
  synth.speak(utterance);
}

export const speech = {
  startLevel(level: number): void {
    speak(`第${level}关，开始！`);
  },
  eatFood(): void {
    speak('好吃', 1.3, 1.4);
  },
  levelVictory(): void {
    speak('恭喜通关！', 0.9, 1.2);
  },
  loseLife(): void {
    speak('小心！', 1.1, 0.8);
  },
  gameOver(): void {
    speak('游戏结束', 0.9, 0.7);
  },
  pause(): void {
    speak('游戏暂停');
  },
  resume(): void {
    speak('继续游戏');
  },
  cancel(): void {
    if (synth) synth.cancel();
  },
};
