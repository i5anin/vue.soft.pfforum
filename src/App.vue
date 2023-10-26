<template>
  <v-app>
    <SidebarMenu :drawer="drawer" @update:drawer="toggleDrawer" />
    <v-app-bar app>
      <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon>
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

const toggleDrawer = (value) => {
  drawer.value = typeof value === 'boolean' ? value : !drawer.value;
};
</script>

<style>
body {
  font-family: 'Nunito', sans-serif;
}
</style>
