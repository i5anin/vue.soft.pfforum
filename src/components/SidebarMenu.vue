<template>
  <v-navigation-drawer v-model='drawer' app @click='toggleDrawer'>
    <v-list v-model:opened='open'>
      <template v-for='(item, index) in menuItems' :key='index'>
        <v-list-item v-if='!item.items' :prepend-icon='item.icon' :title='item.title'>
        </v-list-item>
        <v-list-group v-else :value='item.title'>
          <template v-slot:activator='{ props }'>
            <v-list-item v-bind='props' :prepend-icon='item.icon' :title='item.title'>
            </v-list-item>
          </template>
          <sidebar-menu-item v-for='(subItem, subIndex) in item.items' :key='subIndex'
                             :item='subItem'></sidebar-menu-item>
        </v-list-group>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, watch } from 'vue'
import SidebarMenuItem from '@/components/SidebarMenuItem.vue'

const props = defineProps(['drawer'])

const open = ref([])

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

const toggleDrawer = () => {
  drawer.value = !drawer.value
  console.log('Drawer toggled:', drawer.value)  // Эта строка будет выводить состояние drawer в консоль
}

watch(drawer, (newValue) => {
  console.log('Drawer value changed:', newValue)
})
</script>
