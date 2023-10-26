<template>
  <v-navigation-drawer v-model="drawer" app @click="toggleDrawer">
    <v-list v-model:opened="open">
      <v-list-item
        v-for="(item, index) in items"
        :key="index"
        :prepend-icon="item.icon"
        :title="item.title"
      ></v-list-item>

      <v-list-group
        v-for="(group, index) in groups"
        :key="index"
        :value="group.title"
      >
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            :prepend-icon="group.icon"
            :title="group.title"
          ></v-list-item>
        </template>

        <v-list-item
          v-for="subItem in group.items"
          :key="subItem.title"
          :prepend-icon="subItem.icon"
          :title="subItem.title"
        ></v-list-item>
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from 'vue';

const drawer = ref(false);
const open = ref([]);
const items = [
  { icon: 'mdi-home', title: 'Home' },
  { icon: 'mdi-account', title: 'Profile' },
  { icon: 'mdi-settings', title: 'Settings' }
];
const groups = [
  {
    icon: 'mdi-account-circle',
    title: 'Users',
    items: [
      { icon: 'mdi-account-multiple-outline', title: 'Management' },
      { icon: 'mdi-cog-outline', title: 'Settings' },
    ]
  },
  {
    icon: 'mdi-tools',
    title: 'Actions',
    items: [
      { icon: 'mdi-plus-outline', title: 'Create' },
      { icon: 'mdi-file-outline', title: 'Read' },
      { icon: 'mdi-update', title: 'Update' },
      { icon: 'mdi-delete', title: 'Delete' },
    ]
  },
];

const toggleDrawer = () => {
  drawer.value = !drawer.value;
};
</script>
