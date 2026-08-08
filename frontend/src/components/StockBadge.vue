<template>
  <span :class="['badge', badgeClass]">
    <span>{{ icon }}</span>
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ qty: { type: Number, required: true } })

const badgeClass = computed(() => {
  if (props.qty === 0) return 'badge-danger'
  if (props.qty <= 5)  return 'badge-warning'
  return 'badge-success'
})
const icon  = computed(() => props.qty === 0 ? '✕' : props.qty <= 5 ? '⚠' : '✓')
const label = computed(() => props.qty === 0 ? 'Habis' : props.qty <= 5 ? 'Menipis' : 'Tersedia')
</script>
