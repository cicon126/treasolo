import { useCallback, useRef } from 'react';
import { TemperatureStatus } from '../store/temperatureStore';

export const useSpeechSynthesis = () => {
  const lastSpokenStatus = useRef<TemperatureStatus | null>(null);

  const speak = useCallback((status: TemperatureStatus, enabled: boolean) => {
    if (!enabled || !window.speechSynthesis) return;

    if (lastSpokenStatus.current === status) return;

    lastSpokenStatus.current = status;

    window.speechSynthesis.cancel();

    let message = '';
    switch (status) {
      case 'too-high':
        message = '温度过高，请降温';
        break;
      case 'too-low':
        message = '温度过低，请升温';
        break;
      case 'normal':
        message = '温度正常';
        break;
    }

    if (message) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'zh-CN';
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const reset = useCallback(() => {
    lastSpokenStatus.current = null;
  }, []);

  return { speak, reset };
};
