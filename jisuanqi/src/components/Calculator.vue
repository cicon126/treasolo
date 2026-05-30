<template>
  <div class="calculator">
    <div class="display">
      <div class="expression">{{ expression }}</div>
      <div class="result">{{ displayValue }}</div>
    </div>
    <div class="buttons">
      <button class="btn btn-function" @click="clear">AC</button>
      <button class="btn btn-function" @click="toggleSign">±</button>
      <button class="btn btn-function" @click="percentage">%</button>
      <button class="btn btn-operator" @click="setOperator('/')">÷</button>
      
      <button class="btn btn-number" @click="appendNumber('7')">7</button>
      <button class="btn btn-number" @click="appendNumber('8')">8</button>
      <button class="btn btn-number" @click="appendNumber('9')">9</button>
      <button class="btn btn-operator" @click="setOperator('*')">×</button>
      
      <button class="btn btn-number" @click="appendNumber('4')">4</button>
      <button class="btn btn-number" @click="appendNumber('5')">5</button>
      <button class="btn btn-number" @click="appendNumber('6')">6</button>
      <button class="btn btn-operator" @click="setOperator('-')">−</button>
      
      <button class="btn btn-number" @click="appendNumber('1')">1</button>
      <button class="btn btn-number" @click="appendNumber('2')">2</button>
      <button class="btn btn-number" @click="appendNumber('3')">3</button>
      <button class="btn btn-operator" @click="setOperator('+')">+</button>
      
      <button class="btn btn-number btn-zero" @click="appendNumber('0')">0</button>
      <button class="btn btn-number" @click="appendDecimal">.</button>
      <button class="btn btn-equals" @click="calculate">=</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const currentValue = ref('0')
const previousValue = ref('')
const operator = ref('')
const waitingForOperand = ref(false)

const displayValue = computed(() => {
  const value = currentValue.value
  if (value.length > 12) {
    const num = parseFloat(value)
    if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
      return num.toExponential(6)
    }
    return value.slice(0, 12)
  }
  return value
})

const expression = computed(() => {
  if (previousValue.value && operator.value) {
    const opMap = { '+': '+', '-': '−', '*': '×', '/': '÷' }
    return `${previousValue.value} ${opMap[operator.value]}`
  }
  return ''
})

const appendNumber = (number) => {
  if (waitingForOperand.value) {
    currentValue.value = number
    waitingForOperand.value = false
  } else {
    if (currentValue.value === '0' && number !== '.') {
      currentValue.value = number
    } else {
      if (currentValue.value.replace(/[^0-9]/g, '').length < 12) {
        currentValue.value += number
      }
    }
  }
}

const appendDecimal = () => {
  if (waitingForOperand.value) {
    currentValue.value = '0.'
    waitingForOperand.value = false
    return
  }
  if (!currentValue.value.includes('.')) {
    currentValue.value += '.'
  }
}

const setOperator = (op) => {
  if (operator.value && !waitingForOperand.value) {
    performCalculation()
  }
  previousValue.value = currentValue.value
  operator.value = op
  waitingForOperand.value = true
}

const performCalculation = () => {
  const prev = parseFloat(previousValue.value)
  const current = parseFloat(currentValue.value)
  let result

  switch (operator.value) {
    case '+':
      result = prev + current
      break
    case '-':
      result = prev - current
      break
    case '*':
      result = prev * current
      break
    case '/':
      result = current !== 0 ? prev / current : 'Error'
      break
    default:
      return
  }

  currentValue.value = String(result)
  previousValue.value = ''
  operator.value = ''
  waitingForOperand.value = true
}

const calculate = () => {
  if (!operator.value || !previousValue.value) {
    return
  }
  performCalculation()
}

const clear = () => {
  currentValue.value = '0'
  previousValue.value = ''
  operator.value = ''
  waitingForOperand.value = false
}

const toggleSign = () => {
  if (currentValue.value !== '0') {
    if (currentValue.value.startsWith('-')) {
      currentValue.value = currentValue.value.slice(1)
    } else {
      currentValue.value = '-' + currentValue.value
    }
  }
}

const percentage = () => {
  const value = parseFloat(currentValue.value)
  currentValue.value = String(value / 100)
}
</script>

<style scoped>
.calculator {
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 24px;
  width: 100%;
  max-width: 380px;
}

.display {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 24px 20px;
  margin-bottom: 20px;
  text-align: right;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.expression {
  font-size: 16px;
  color: #6c757d;
  margin-bottom: 8px;
  min-height: 24px;
  word-break: break-all;
  word-wrap: break-word;
}

.result {
  font-size: 48px;
  font-weight: 300;
  color: #212529;
  word-break: break-all;
  word-wrap: break-word;
  line-height: 1.2;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.btn {
  border: none;
  border-radius: 16px;
  font-size: 24px;
  font-weight: 500;
  cursor: pointer;
  padding: 20px 0;
  transition: all 0.15s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.btn:active {
  transform: scale(0.95);
}

.btn-number {
  background: #f1f3f5;
  color: #212529;
}

.btn-number:hover {
  background: #e9ecef;
}

.btn-operator {
  background: #667eea;
  color: #ffffff;
}

.btn-operator:hover {
  background: #5a6fd6;
}

.btn-function {
  background: #e9ecef;
  color: #6c757d;
}

.btn-function:hover {
  background: #dee2e6;
}

.btn-equals {
  background: #764ba2;
  color: #ffffff;
}

.btn-equals:hover {
  background: #6a4391;
}

.btn-zero {
  grid-column: span 2;
}

@media (max-width: 480px) {
  .calculator {
    padding: 20px;
    border-radius: 20px;
  }

  .display {
    padding: 20px 16px;
    min-height: 100px;
  }

  .result {
    font-size: 36px;
  }

  .btn {
    font-size: 20px;
    padding: 16px 0;
    border-radius: 12px;
  }

  .buttons {
    gap: 10px;
  }
}

@media (max-width: 360px) {
  .calculator {
    padding: 16px;
  }

  .result {
    font-size: 32px;
  }

  .btn {
    font-size: 18px;
    padding: 14px 0;
  }
}
</style>
