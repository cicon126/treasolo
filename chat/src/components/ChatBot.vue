<script setup>
import { ref, nextTick, onMounted } from 'vue'
import ChatMessage from './ChatMessage.vue'
import ChatInput from './ChatInput.vue'
import QuickActions from './QuickActions.vue'
import { generateReply } from '../utils/chatbot.js'

const messages = ref([])
const inputText = ref('')
const isTyping = ref(false)
const messagesContainer = ref(null)
let msgIdCounter = 0

const quickQuestions = ['你好', '今天天气怎么样？', '讲个笑话', '你是谁？']

function getTime() {
  const now = new Date()
  return now.getHours().toString().padStart(2, '0') + ':' +
         now.getMinutes().toString().padStart(2, '0')
}

function genId() {
  msgIdCounter++
  return Date.now() + '_' + msgIdCounter
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isTyping.value) return

  messages.value.push({
    id: genId(),
    role: 'user',
    content: text,
    time: getTime(),
    typing: false
  })

  inputText.value = ''
  isTyping.value = true
  scrollToBottom()

  const typingId = genId()
  messages.value.push({
    id: typingId,
    role: 'bot',
    content: '',
    time: getTime(),
    typing: true
  })
  scrollToBottom()

  const reply = generateReply(text)
  const delay = 600 + Math.random() * 800

  setTimeout(() => {
    const index = messages.value.findIndex(m => m.id === typingId)
    if (index !== -1) {
      messages.value[index] = {
        ...messages.value[index],
        typing: false,
        content: reply,
        time: getTime()
      }
    }
    isTyping.value = false
    scrollToBottom()
  }, delay)
}

function sendQuick(q) {
  inputText.value = q
  sendMessage()
}

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <div class="chat-container">
    <div class="chat-header">
      <div class="avatar">🤖</div>
      <div class="header-info">
        <h1>小红助手</h1>
        <p><span class="status-dot"></span>在线</p>
      </div>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div class="welcome-msg" v-if="messages.length === 0">
        <div class="icon">🤖</div>
        <h2>你好，我是小红助手</h2>
        <p>有什么我可以帮你的吗？<br>试着和我聊聊天吧！</p>
      </div>

      <ChatMessage
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
      />
    </div>

    <QuickActions
      v-if="messages.length === 0"
      :questions="quickQuestions"
      @send="sendQuick"
    />

    <ChatInput
      v-model="inputText"
      :is-typing="isTyping"
      @send="sendMessage"
    />
  </div>
</template>

<style scoped>
.chat-container {
  width: 100%;
  max-width: 520px;
  height: 96vh;
  display: flex;
  flex-direction: column;
  background: #1c1010;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 0 60px rgba(200, 30, 30, 0.15);
  border: 1px solid rgba(200, 50, 50, 0.2);
}

.chat-header {
  background: linear-gradient(135deg, #b71c1c, #d32f2f);
  padding: 18px 24px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 4px 20px rgba(183, 28, 28, 0.4);
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.header-info h1 {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin: 0;
}

.header-info p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  margin: 2px 0 0 0;
}

.status-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  background: #69f0ae;
  border-radius: 50%;
  margin-right: 5px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-behavior: smooth;
}

.chat-messages::-webkit-scrollbar {
  width: 4px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(200, 50, 50, 0.3);
  border-radius: 4px;
}

.welcome-msg {
  text-align: center;
  padding: 30px 20px;
}

.welcome-msg .icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.welcome-msg h2 {
  color: #e53935;
  font-size: 20px;
  margin: 0 0 8px 0;
}

.welcome-msg p {
  color: rgba(200, 150, 150, 0.6);
  font-size: 13px;
  line-height: 1.8;
  margin: 0;
}
</style>
