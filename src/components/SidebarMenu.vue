<template>
  <v-navigation-drawer v-model="drawer" app>
    <v-list>
      <v-list-item v-for="(item, index) in items" :key="index">
        <v-avatar>
          <v-icon>{{ item.icon }}</v-icon>
        </v-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from 'vue';

const drawer = ref(false);
const items = [
  { icon: 'mdi-home', title: 'Home' },
  { icon: 'mdi-account', title: 'Profile' },
  { icon: 'mdi-settings', title: 'Settings' }
];

const toggleDrawer = () => {
  drawer.value = !drawer.value;
};
</script>
