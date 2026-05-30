import Taro from '@tarojs/taro';
import { TodoItem } from '@/types/todo';

export const reminder = {
  checkReminders(todos: TodoItem[], advanceMinutes: number = 5): TodoItem[] {
    const now = new Date().getTime();
    const toRemind: TodoItem[] = [];

    for (const todo of todos) {
      if (todo.isCompleted || todo.isReminded) continue;

      const remindTime = new Date(todo.remindTime).getTime();
      const diffMinutes = (remindTime - now) / (1000 * 60);

      if (diffMinutes > 0 && diffMinutes <= advanceMinutes) {
        toRemind.push(todo);
      }
    }

    return toRemind;
  },

  showModal(todo: TodoItem): Promise<boolean> {
    return new Promise((resolve) => {
      Taro.showModal({
        title: '⏰ 日程提醒',
        content: `即将到来：${todo.content}\n时间：${this.formatTime(todo.remindTime)}`,
        confirmText: '知道了',
        cancelText: '稍后提醒',
        success: (res) => {
          resolve(res.confirm);
        },
        fail: (error) => {
          console.error('[Reminder] showModal error:', error);
          resolve(false);
        }
      });
    });
  },

  speak(text: string): void {
    try {
      const plugin = Taro.requirePlugin('WechatSI');
      if (plugin && plugin.textToSpeech) {
        plugin.textToSpeech({
          lang: 'zh_CN',
          tts: true,
          content: text,
          success: () => {
            console.log('[Reminder] speak success');
          },
          fail: (error: unknown) => {
            console.error('[Reminder] speak error:', error);
            this.fallbackSpeak(text);
          }
        });
      } else {
        this.fallbackSpeak(text);
      }
    } catch (error) {
      console.error('[Reminder] speak plugin error:', error);
      this.fallbackSpeak(text);
    }
  },

  fallbackSpeak(text: string): void {
    Taro.showToast({
      title: '语音播报：' + text.substring(0, 15) + '...',
      icon: 'none',
      duration: 2000
    });
  },

  formatTime(timeStr: string): string {
    const date = new Date(timeStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}月${day}日 ${hours}:${minutes}`;
  },

  vibrate(): void {
    try {
      Taro.vibrateShort({
        type: 'medium'
      });
    } catch (error) {
      console.error('[Reminder] vibrate error:', error);
    }
  }
};
