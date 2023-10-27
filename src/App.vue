<template>
  <v-app>
    <v-container fluid>
      <v-row no-gutters>
        <v-col :cols="drawer ? 2 : 1">
          <SidebarMenu :drawer="drawer" @toggle-drawer="toggleDrawer" />
        </v-col>
        <v-col :cols="drawer ? 10 : 11">
          <TopMenuBar @toggle-drawer="toggleDrawer" />
          <router-view />
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';
import SidebarMenu from '@/components/SidebarMenu.vue';
import TopMenuBar from '@/components/TopMenuBar.vue';
import '@fontsource/nunito';

const drawer = ref(false);

const toggleDrawer = () => {
  drawer.value = !drawer.value;
};
</script>

<style>
body {
  font-family: 'Nunito', sans-serif;
}
</style>
