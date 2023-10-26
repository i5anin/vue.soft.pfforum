<template>
  <v-app>
    <SidebarMenu v-model:drawer="drawer" />
    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>My App</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <MainTable />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';
import SidebarMenu from '@/components/SidebarMenu.vue';
import MainTable from '@/components/MainTable.vue';
import '@fontsource/nunito';

const drawer = ref(false);
</script>

<style>
body {
  font-family: 'Nunito', sans-serif;
}
</style>
