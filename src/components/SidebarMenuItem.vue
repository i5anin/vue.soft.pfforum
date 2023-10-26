<template>
  <v-list-item v-if="!item.items" :prepend-icon="item.icon" :title="item.title">
  </v-list-item>
  <v-list-group v-else :value="item.title">
    <template v-slot:activator="{ props }">
      <v-list-item v-bind="props" :prepend-icon="item.icon" :title="item.title">
      </v-list-item>
    </template>
    <sidebar-menu-item v-for="(subItem, subIndex) in item.items" :key="subIndex" :item="subItem"></sidebar-menu-item>
  </v-list-group>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  item: Object,
});
</script>
