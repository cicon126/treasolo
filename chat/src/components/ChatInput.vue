<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  isTyping: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'send'])

function handleInput(e) {
  emit('update:modelValue', e.target.value)
}

function handleKeyup(e) {
  if (e.key === 'Enter') {
    emit('send')
  }
}
</script>

<template>
  <div class="chat-input">
    <input
      type="text"
      :value="modelValue"
      @input="handleInput"
      @keyup="handleKeyup"
      placeholder="输入消息..."
      :disabled="isTyping"
    />
    <button
      @click="$emit('send')"
      :disabled="!modelValue.trim() || isTyping"
    >➤</button>
  </div>
</template>

<style scoped>
.chat-input {
  padding: 16px;
  background: #1a0e0e;
  border-top: 1px solid rgba(200, 50, 50, 0.15);
  display: flex;
  gap: 10px;
}

.chat-input input {
  flex: 1;
  padding: 12px 18px;
  border-radius: 24px;
  border: 1px solid rgba(200, 50, 50, 0.25);
  background: #2d1a1a;
  color: #f0d0d0;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.chat-input input::placeholder {
  color: rgba(200, 150, 150, 0.4);
}

.chat-input input:focus {
  border-color: rgba(200, 50, 50, 0.5);
  box-shadow: 0 0 12px rgba(200, 50, 50, 0.15);
}

.chat-input input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.chat-input button {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #b71c1c, #d32f2f);
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
  flex-shrink: 0;
}

.chat-input button:hover:not(:disabled) {
  transform: scale(1.08);
  box-shadow: 0 0 20px rgba(183, 28, 28, 0.5);
}

.chat-input button:active:not(:disabled) {
  transform: scale(0.95);
}

.chat-input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>
