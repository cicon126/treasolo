<script setup>
defineProps({
  message: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div :class="['message', message.role]">
    <div class="msg-avatar">{{ message.role === 'bot' ? '🤖' : '😊' }}</div>
    <div>
      <div class="msg-bubble">
        <template v-if="message.typing">
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </template>
        <template v-else>{{ message.content }}</template>
      </div>
      <div class="msg-time">{{ message.time }}</div>
    </div>
  </div>
</template>

<style scoped>
.message {
  display: flex;
  gap: 10px;
  max-width: 85%;
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message.bot {
  align-self: flex-start;
}

.msg-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.message.bot .msg-avatar {
  background: linear-gradient(135deg, #b71c1c, #d32f2f);
}

.message.user .msg-avatar {
  background: linear-gradient(135deg, #4a148c, #7b1fa2);
}

.msg-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  line-height: 1.6;
  font-size: 14px;
  word-break: break-word;
}

.message.bot .msg-bubble {
  background: #2d1a1a;
  color: #e0c0c0;
  border-bottom-left-radius: 4px;
  border: 1px solid rgba(200, 50, 50, 0.15);
}

.message.user .msg-bubble {
  background: linear-gradient(135deg, #c62828, #e53935);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.msg-time {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 4px;
  text-align: right;
}

.message.bot .msg-time {
  text-align: left;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background: rgba(200, 80, 80, 0.6);
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}
</style>
