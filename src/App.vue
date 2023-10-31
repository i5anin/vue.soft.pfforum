<template>
  <v-app>
    <SidebarMenu :drawer="drawer" @toggle-drawer="toggleDrawer" />
    <v-main>
      <v-container fluid>
        <v-row no-gutters>
          <v-col :cols="drawer ? 2 : 1">
          </v-col>
          <v-col :cols="drawer ? 10 : 11">
            <div class="router-view-wrapper">
              <router-view />
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';
import SidebarMenu from '@/components/SidebarMenu.vue';
import TopMenuBar from '@/components/TopMenuBar.vue';
import '@fontsource/nunito';

const drawer = ref(false);

const toggleDrawer = () => {
  console.log(123)
  drawer.value = !drawer.value;
};
</script>

<style>
body {
  font-family: 'Nunito', sans-serif;
}
.router-view-wrapper {
  //padding-top: 60px;  /* Задайте значение в зависимости от высоты вашей шапки */
  //padding-left: 200px;  /* Задайте значение в зависимости от ширины вашей боковой панели */
}
</style>
