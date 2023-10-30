<template>
  <v-app-bar app color='primary' dark>
    <!-- Левая кнопка -->
    <v-btn icon @click='toggleDrawer'>
      <v-icon>mdi-menu</v-icon>
    </v-btn>
    <!-- Название -->
    <v-toolbar-title>
      PF-FORUM APP
    </v-toolbar-title>
    <v-spacer />
    <!-- Три кнопки справа -->
    <v-btn icon>
      <v-icon>mdi-magnify</v-icon>
    </v-btn>
    <v-btn icon>
      <v-icon>mdi-fullscreen</v-icon>
    </v-btn>
    <v-btn icon @click="toggleTheme">
      <v-icon>mdi-moon-last-quarter</v-icon>
    </v-btn>
    <v-btn icon>
      <v-icon>mdi-exit-to-app</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import vuetify from '@/plugins/vuetify'  // Убедитесь, что путь верный

const currentTheme = ref(localStorage.getItem('theme') || 'light')

const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
}

watch(currentTheme, (newTheme) => {
  vuetify.theme.currentTheme.value = newTheme
  localStorage.setItem('theme', newTheme)
})

onMounted(() => {
  vuetify.theme.currentTheme.value = currentTheme.value
})
</script>

