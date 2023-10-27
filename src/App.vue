<template>
  <v-card>
    <v-layout>
      <SidebarMenu />
      <TopMenuBar />
    </v-layout>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import SidebarMenu from '@/components/SidebarMenu.vue'
import TopMenuBar from '@/components/TopMenuBar.vue'
import '@fontsource/nunito'

const drawer = ref(false)

const toggleDrawer = () => {
  drawer.value = !drawer.value
}
</script>

<style>
body {
  font-family: 'Nunito', sans-serif;
}
</style>
