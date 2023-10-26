<template>
  <v-navigation-drawer
    :mini-variant="mini"
    @mouseenter="mini = false"
    @mouseleave="mini = true"
    :modelValue='drawer'
    @update:modelValue='updateDrawer'

    app
    width='350'>
    <v-list>
      <template v-for='(item, index) in menuItems' :key='index'>
        <v-list-item
          v-if='!item.items'
          :prepend-icon='getIcon(item.icon)'
          :title='item.title'
          @click='handleClick(item.title)'>
        </v-list-item>
        <v-list-group v-else :value='item.title'>
          <template v-slot:activator='{ props }'>
            <v-list-item
              v-bind='props'
              :prepend-icon='getIcon(item.icon)'
              :title='item.title'>
            </v-list-item>
          </template>
          <sidebar-menu-item v-for='(subItem, subIndex) in item.items'
                             :key='subIndex'
                             :item='subItem'
                             @click='handleClick(subItem.title)'>

          </sidebar-menu-item>
        </v-list-group>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import SidebarMenuItem from '@/components/SidebarMenuItem.vue'
import { originalMenuItems } from '@/data/menuItems' // Путь к файлу menuItems.js

const { drawer } = defineProps(['drawer'])
const emits = defineEmits(['updateDrawer'])
const getIcon = (icon) => icon || 'mdi-circle-outline'

const mini = ref(false)
const menuItems = computed(() => {
  return originalMenuItems.map(item => {
    if (!item.icon) {
      item.icon = 'mdi-circle-outline'
    }
    if (item.items) {
      item.items = item.items.map(subItem => {
        if (!subItem.icon) {
          subItem.icon = 'mdi-circle-outline'
        }
        return subItem
      })
    }
    return item
  })
})

const updateDrawer = (value) => {
  emits('updateDrawer', value)
  console.log('Drawer toggled:', value)
}

const handleClick = (title) => {
  console.log('Clicked on:', title)
}


</script>
