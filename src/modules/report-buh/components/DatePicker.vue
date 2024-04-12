<template>
  <v-menu v-model="isMenuOpen" :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-text-field
        :label="label"
        :model-value="formattedDate"
        readonly
        v-bind="props"
        variant="solo"
        hide-details
      ></v-text-field>
    </template>
    <v-date-picker v-model="selectedDate" hide-actions title="" :color="color">
      <template v-slot:header></template>
    </v-date-picker>
  </v-menu>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'

const { label, color, modelValue } = defineProps([
  'label',
  'color',
  'modelValue',
])
const emit = defineEmits('update:modelValue')

const isMenuOpen = ref(false)
const selectedDate = ref(modelValue)

const formattedDate = computed(() => {
  return selectedDate.value ? selectedDate.value.toLocaleDateString('en') : ''
})

watch(modelValue, (newDate) => {
  selectedDate.value = newDate
})

watch(selectedDate, (newDate) => {
  emit('update:modelValue', newDate)
})
</script>
<style>
.v-overlay__content:has(> .v-date-picker) {
  min-width: auto !important;
}
.v-picker-title {
  padding: 0 !important;
}
</style>
`
