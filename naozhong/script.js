class DuckAlarmClock {
    constructor() {
        this.audioContext = null;
        this.alarmInterval = null;
        this.isRinging = false;
        this.alarmEnabled = false;
        this.hourlyEnabled = true;
        this.lastHour = -1;
        
        this.initElements();
        this.initEventListeners();
        this.startClock();
        this.loadSettings();
    }

    initElements() {
        this.currentTimeEl = document.getElementById('digitalTime');
        this.currentDateEl = document.getElementById('digitalDate');
        this.hourHand = document.getElementById('hourHand');
        this.minuteHand = document.getElementById('minuteHand');
        this.secondHand = document.getElementById('secondHand');
        this.duckHat = document.getElementById('duckHat');
        this.alarmTimeInput = document.getElementById('alarmTime');
        this.alarmToggle = document.getElementById('alarmToggle');
        this.alarmStatus = document.getElementById('alarmStatus');
        this.hourlyToggle = document.getElementById('hourlyToggle');
        this.hourlyStatus = document.getElementById('hourlyStatus');
        this.stopBtn = document.getElementById('stopBtn');
        this.testBtn = document.getElementById('testBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
        this.alarmModal = document.getElementById('alarmModal');
        this.modalMessage = document.getElementById('modalMessage');
        this.modalStopBtn = document.getElementById('modalStopBtn');
        this.bellLeft = document.getElementById('bellLeft');
        this.bellRight = document.getElementById('bellRight');
        this.duckBody = document.querySelector('.duck-body');
    }

    initEventListeners() {
        this.alarmToggle.addEventListener('change', () => this.toggleAlarm());
        this.hourlyToggle.addEventListener('change', () => this.toggleHourly());
        this.stopBtn.addEventListener('click', () => this.stopAlarm());
        this.modalStopBtn.addEventListener('click', () => this.stopAlarm());
        this.testBtn.addEventListener('click', () => this.testAlarmSound());
        this.alarmTimeInput.addEventListener('change', () => this.saveSettings());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });
    }

    loadSettings() {
        const savedAlarmTime = localStorage.getItem('alarmTime');
        const savedAlarmEnabled = localStorage.getItem('alarmEnabled');
        const savedHourlyEnabled = localStorage.getItem('hourlyEnabled');

        if (savedAlarmTime) {
            this.alarmTimeInput.value = savedAlarmTime;
        }
        if (savedAlarmEnabled === 'true') {
            this.alarmToggle.checked = true;
            this.toggleAlarm();
        }
        if (savedHourlyEnabled === 'false') {
            this.hourlyToggle.checked = false;
            this.toggleHourly();
        }
    }

    saveSettings() {
        localStorage.setItem('alarmTime', this.alarmTimeInput.value);
        localStorage.setItem('alarmEnabled', this.alarmEnabled);
        localStorage.setItem('hourlyEnabled', this.hourlyEnabled);
    }

    startClock() {
        this.updateTime();
        this.updateHandsSmoothly();
        setInterval(() => this.updateTime(), 1000);
    }

    updateHandsSmoothly() {
        const now = new Date();
        this.updateClockHands(now);
        requestAnimationFrame(() => this.updateHandsSmoothly());
    }

    updateTime() {
        const now = new Date();
        
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        this.currentTimeEl.textContent = `${hours}:${minutes}:${seconds}`;

        const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const date = now.getDate();
        const day = weekDays[now.getDay()];
        this.currentDateEl.textContent = `${year}年${month}月${date}日 ${day}`;

        this.updateClockHands(now);
        this.checkAlarms(now, hours, minutes, seconds);
    }

    updateClockHands(now) {
        const hours = now.getHours() % 12;
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();

        const secondDeg = (seconds + milliseconds / 1000) * 6;
        const minuteDeg = (minutes + seconds / 60) * 6;
        const hourDeg = (hours + minutes / 60) * 30;

        this.secondHand.style.transform = `translateX(-50%) rotate(${secondDeg}deg)`;
        this.minuteHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
        this.hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
    }

    checkAlarms(now, hours, minutes, seconds) {
        if (this.isRinging) return;

        if (seconds === '00') {
            if (this.hourlyEnabled && minutes === '00' && now.getHours() !== this.lastHour) {
                this.lastHour = now.getHours();
                this.triggerAlarm('hourly');
            }

            if (this.alarmEnabled) {
                const alarmTime = this.alarmTimeInput.value;
                if (`${hours}:${minutes}` === alarmTime) {
                    this.triggerAlarm('alarm');
                }
            }
        }
    }

    toggleAlarm() {
        this.alarmEnabled = this.alarmToggle.checked;
        this.alarmStatus.textContent = this.alarmEnabled ? '已开启' : '已关闭';
        this.alarmStatus.classList.toggle('active', this.alarmEnabled);
        this.saveSettings();
    }

    toggleHourly() {
        this.hourlyEnabled = this.hourlyToggle.checked;
        this.hourlyStatus.textContent = this.hourlyEnabled ? '已开启' : '已关闭';
        this.hourlyStatus.classList.toggle('active', this.hourlyEnabled);
        this.saveSettings();
    }

    triggerAlarm(type) {
        this.isRinging = true;
        
        if (type === 'hourly') {
            this.modalMessage.textContent = `现在是 ${new Date().getHours()} 点整！`;
        } else {
            this.modalMessage.textContent = '闹钟时间到啦！该起床了！';
        }
        
        this.alarmModal.classList.add('show');
        this.stopBtn.disabled = false;
        
        this.startRingingAnimation();
        this.playAlarmSound();
    }

    startRingingAnimation() {
        this.bellLeft.classList.add('ringing');
        this.bellRight.classList.add('ringing');
        this.duckHat.classList.add('ringing');
    }

    stopRingingAnimation() {
        this.bellLeft.classList.remove('ringing');
        this.bellRight.classList.remove('ringing');
        this.duckHat.classList.remove('ringing');
    }

    stopAlarm() {
        this.isRinging = false;
        this.alarmModal.classList.remove('show');
        this.stopBtn.disabled = true;
        this.stopRingingAnimation();
        this.stopAlarmSound();
    }

    testAlarmSound() {
        this.startRingingAnimation();
        this.playAlarmSound();
        setTimeout(() => {
            this.stopRingingAnimation();
            this.stopAlarmSound();
        }, 3000);
    }

    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    playAlarmSound() {
        this.initAudioContext();
        
        const playBeep = (time, freq, duration) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(0.3, time + 0.01);
            gainNode.gain.linearRampToValueAtTime(0.3, time + duration - 0.02);
            gainNode.gain.linearRampToValueAtTime(0, time + duration);
            
            oscillator.start(time);
            oscillator.stop(time + duration);
        };

        const now = this.audioContext.currentTime;
        const pattern = [800, 1000, 800, 1200];
        let timeOffset = 0;

        this.alarmInterval = setInterval(() => {
            if (!this.isRinging && this.alarmInterval) {
                clearInterval(this.alarmInterval);
                return;
            }
            
            const currentTime = this.audioContext.currentTime;
            pattern.forEach((freq, i) => {
                playBeep(currentTime + i * 0.15, freq, 0.12);
            });
        }, 800);

        pattern.forEach((freq, i) => {
            playBeep(now + i * 0.15, freq, 0.12);
        });
    }

    stopAlarmSound() {
        if (this.alarmInterval) {
            clearInterval(this.alarmInterval);
            this.alarmInterval = null;
        }
    }

    openSettings() {
        this.settingsModal.classList.add('show');
    }

    closeSettings() {
        this.settingsModal.classList.remove('show');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DuckAlarmClock();
});
