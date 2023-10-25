<!-- App.vue -->
<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
      <!-- Содержимое вашего меню -->
      <v-list-item-group>
        <v-list-item>
          <v-list-item-icon>
            <v-icon>mdi-home</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <!-- Добавьте другие пункты меню здесь -->
      </v-list-item-group>
    </v-navigation-drawer>
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
import { ref } from 'vue'
import MainTable from '@/components/MainTable.vue'
import '@fontsource/nunito'

const drawer = ref(false)
</script>

<style>
body {
  font-family: 'Nunito', sans-serif
}
</style>
