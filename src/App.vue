<template>
  <v-card>
    <v-layout>
      <SidebarMenu />
    </v-layout>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import SidebarMenu from '@/components/SidebarMenu.vue'
import MainTable from '@/components/MainTable.vue'
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
