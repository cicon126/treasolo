export class AlarmSound {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private intervalId: number | null = null;
  private isPlaying = false;

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return this.audioContext;
  }

  playBeep(frequency: number = 800, duration: number = 0.1) {
    const ctx = this.initAudioContext();
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  startAlarm() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    
    let count = 0;
    const playPattern = () => {
      if (!this.isPlaying) return;
      
      this.playBeep(1000, 0.08);
      
      count++;
      if (count < 3) {
        setTimeout(() => {
          if (this.isPlaying) {
            this.playBeep(1000, 0.08);
            count++;
            setTimeout(() => {
              if (this.isPlaying) {
                this.playBeep(1200, 0.15);
                count = 0;
              }
            }, 100);
          }
        }, 100);
      } else {
        count = 0;
      }
    };
    
    playPattern();
    this.intervalId = window.setInterval(playPattern, 600);
  }

  stopAlarm() {
    this.isPlaying = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const alarmSound = new AlarmSound();
