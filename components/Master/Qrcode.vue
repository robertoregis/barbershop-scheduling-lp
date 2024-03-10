<template>
    <qrcode-vue :value="value" :level="level" :render-as="renderAs" :size="size" />
  </template>
  
  <script setup lang="ts">
    import { defineProps, ref } from 'vue'
    import QrcodeVue, { Level, RenderAs } from 'qrcode.vue'
  
    const props = defineProps({
      value: String,
      size: Number,
    })
  
    const level = ref<Level>('M')
    const renderAs = ref<RenderAs>('svg')
  </script>
  