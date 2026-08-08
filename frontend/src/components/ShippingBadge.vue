<template>
  <span :class="['badge', badgeClass]">
    <span>{{ icon }}</span>
    {{ status }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ status: { type: String, default: 'Pending' } })

const badgeClass = computed(() => ({
  Pending: 'badge-neutral',
  Proses:  'badge-info',
  Dikirim: 'badge-warning',
  Selesai: 'badge-success',
}[props.status] || 'badge-neutral'))

const icon = computed(() => ({
  Pending: '⏳',
  Proses:  '⚙️',
  Dikirim: '🚚',
  Selesai: '✅',
}[props.status] || '⏳'))
</script>
