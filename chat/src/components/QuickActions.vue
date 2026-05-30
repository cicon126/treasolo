<script setup>
defineProps({
  questions: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['send'])
</script>

<template>
  <div class="quick-actions">
    <button
      class="quick-btn"
      v-for="q in questions"
      :key="q"
      @click="emit('send', q)"
    >{{ q }}</button>
  </div>
</template>

<style scoped>
.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  padding: 0 16px 16px;
}

.quick-btn {
  padding: 6px 14px;
  border-radius: 16px;
  border: 1px solid rgba(200, 50, 50, 0.3);
  background: rgba(200, 50, 50, 0.08);
  color: #e0a0a0;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover {
  background: rgba(200, 50, 50, 0.2);
  border-color: rgba(200, 50, 50, 0.5);
  color: #fff;
}
</style>
