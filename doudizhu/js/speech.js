class Speech {
    constructor() {
        this.synth = window.speechSynthesis;
        this.enabled = true;
        this.voice = null;
        this.initVoice();
    }

    initVoice() {
        const loadVoices = () => {
            const voices = this.synth.getVoices();
            this.voice = voices.find(v => v.lang.includes('zh')) || voices[0];
        };
        
        loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = loadVoices;
        }
    }

    speak(text, options = {}) {
        if (!this.enabled || !this.synth) return;
        
        this.synth.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = options.rate || 0.9;
        utterance.pitch = options.pitch || 1.1;
        utterance.volume = options.volume || 0.7;
        
        if (this.voice) {
            utterance.voice = this.voice;
        }
        
        this.synth.speak(utterance);
    }

    stop() {
        if (this.synth) {
            this.synth.cancel();
        }
    }

    gameStart() {
        this.speak('欢迎来到斗地主，游戏开始啦！', { rate: 0.9, pitch: 1.2 });
    }

    callDizhu() {
        this.speak('轮到你了，考虑一下是否叫地主？', { rate: 0.85, pitch: 1.0 });
    }

    playerCallDizhu(playerName) {
        if (playerName === '你') {
            this.speak('好的，你叫地主！', { rate: 0.9, pitch: 1.1 });
        }
    }

    dizhuDetermined(playerName) {
        if (playerName === '你') {
            this.speak('太棒了，你当地主！', { rate: 0.9, pitch: 1.2 });
        } else {
            this.speak(`${playerName}当地主`, { rate: 0.9, pitch: 1.0 });
        }
    }

    yourTurn() {
        this.speak('该你出牌了', { rate: 0.85, pitch: 1.0 });
    }

    bomb() {
        this.speak('哇，炸弹！', { rate: 0.95, pitch: 1.3 });
    }

    rocket() {
        this.speak('天呐，王炸！', { rate: 0.95, pitch: 1.4 });
    }

    youWin() {
        this.speak('太厉害了，你赢了！恭喜恭喜！', { rate: 0.9, pitch: 1.3 });
    }

    youLose() {
        this.speak('哎呀，这局输了，没关系，下局再来！', { rate: 0.9, pitch: 0.9 });
    }

    invalidCards() {
        this.speak('这样出不行哦', { rate: 0.9, pitch: 0.9 });
    }

    hint() {
        this.speak('来，试试这些牌', { rate: 0.9, pitch: 1.1 });
    }
}

const speech = new Speech();