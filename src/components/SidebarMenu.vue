<template>
  <v-navigation-drawer :modelValue='drawer' @update:modelValue='toggleDrawer' app>
    <v-list>
      <template v-for='(item, index) in menuItems' :key='index'>
        <v-list-item v-if='!item.items' :prepend-icon='item.icon' :title='item.title' @click="handleClick(item.title)">
        </v-list-item>
        <v-list-group v-else :value='item.title'>
          <template v-slot:activator='{ props }'>
            <v-list-item v-bind='props' :prepend-icon='item.icon' :title='item.title'>
            </v-list-item>
          </template>
          <sidebar-menu-item v-for='(subItem, subIndex) in item.items' :key='subIndex'
                             :item='subItem' @click="handleClick(subItem.title)"></sidebar-menu-item>
        </v-list-group>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, watch } from 'vue'
import SidebarMenuItem from '@/components/SidebarMenuItem.vue'

const drawer = ref(false)

const menuItems = [
  { icon: 'mdi-home', title: 'Home' },
  { icon: 'mdi-account', title: 'Profile' },
  { icon: 'mdi-settings', title: 'Settings' },
  {
    icon: 'mdi-account-circle',
    title: 'Users',
    items: [
      {
        icon: 'mdi-account-multiple-outline',
        title: 'Management',
        items: [],
      },
      { icon: 'mdi-cog-outline', title: 'Settings' },
    ],
  },
  {
    icon: 'mdi-tools',
    title: 'Actions',
    items: [
      { icon: 'mdi-plus-outline', title: 'Create' },
      { icon: 'mdi-file-outline', title: 'Read' },
      { icon: 'mdi-update', title: 'Update' },
      { icon: 'mdi-delete', title: 'Delete' },
    ],
  },
]

const toggleDrawer = (value) => {
  drawer.value = value
  console.log('Drawer toggled:', drawer.value)
}

watch(drawer, (newValue) => {
  console.log('Drawer value changed:', newValue)
})

const handleClick = (title) => {
  console.log('Clicked on:', title)
}
</script>
