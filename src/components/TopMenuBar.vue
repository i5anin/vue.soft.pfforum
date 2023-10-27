<template>
  <v-app-bar app color="primary" dark>
    <!-- Левая кнопка -->
    <v-btn icon @click="toggleDrawer">
      <v-icon>mdi-menu</v-icon>
    </v-btn>
    <!-- Название -->
    <v-toolbar-title>
      PF-FORUM APP
    </v-toolbar-title>
    <v-spacer></v-spacer> <!-- spacer для того, чтобы элементы справа были прижаты к правому краю -->
    <!-- Три кнопки справа -->
    <v-btn icon>
      <v-icon>mdi-magnify</v-icon>
    </v-btn>
    <v-btn icon>
      <v-icon>mdi-fullscreen</v-icon>
    </v-btn>
    <v-btn icon>
      <v-icon>mdi-theme-light-dark</v-icon>
    </v-btn>
    <v-btn icon>
      <v-icon>mdi-exit-to-app</v-icon>
    </v-btn>
  </v-app-bar>
</template>
<script setup>
import { ref } from 'vue';

const drawer = ref(false);

const toggleDrawer = () => {
  drawer.value = !drawer.value;
};
</script>

<style scoped>
/* Дополнительные стили, если они необходимы */
</style>
