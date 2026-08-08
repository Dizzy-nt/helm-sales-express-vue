<template>
  <div id="app-root">
    <NavBar />
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <!-- Global Toast -->
    <div class="toast-container">
      <div
        v-for="t in toasts"
        :key="t.id"
        :class="['toast', t.type === 'error' ? 'toast-error' : 'toast-success']"
      >
        <span>{{ t.type === 'error' ? '✕' : '✓' }}</span>
        {{ t.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import NavBar from './components/NavBar.vue'

const toasts = ref([])

function showToast(message, type = 'success') {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3500)
}

provide('showToast', showToast)
</script>

<style>
.page-enter-active, .page-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.page-enter-from { opacity: 0; transform: translateY(8px); }
.page-leave-to   { opacity: 0; transform: translateY(-8px); }
</style>
