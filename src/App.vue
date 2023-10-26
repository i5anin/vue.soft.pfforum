<template>
  <v-app>
    <SidebarMenu v-model:drawer="drawer" />
    <v-app-bar app>
      <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon>
      <v-toolbar-title>СОФТ 2.0</v-toolbar-title>
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

const toggleDrawer = () => {
  drawer.value = !drawer.value;
}
</script>

<style>
body {
  font-family: 'Nunito', sans-serif;
}
</style>
