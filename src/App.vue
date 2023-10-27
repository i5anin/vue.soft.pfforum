<template>
  <v-app>
    <v-container fluid>
      <v-row no-gutters>
        <v-col v-if="drawer" cols="2">
          <SidebarMenu :drawer="drawer" @toggle-drawer="toggleDrawer" />
        </v-col>
        <v-col v-else cols="1">
          <SidebarMenu :drawer="drawer" @toggle-drawer="toggleDrawer" />
        </v-col>
        <v-col v-if="drawer" cols="10">
          <TopMenuBar @toggle-drawer="toggleDrawer" />
          <router-view />
        </v-col>
        <v-col v-else cols="11">
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
