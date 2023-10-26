<!-- App.vue -->
<template>
  <v-app>
    <SidebarMenu />
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
import SidebarMenu from '@/components/SidebarMenu.vue';
import MainTable from '@/components/MainTable.vue';
import '@fontsource/nunito';

const toggleDrawer = () => {
  SidebarMenu.drawer.value = !SidebarMenu.drawer.value;
};
</script>

<style>
body {
  font-family: 'Nunito', sans-serif;
}
</style>
