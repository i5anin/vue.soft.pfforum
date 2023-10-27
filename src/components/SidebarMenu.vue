<template>
  <v-navigation-drawer expand-on-hover rail width='350' @mouseenter='isHovered = true' @mouseleave='isHovered = false'>
    <v-list>
      <v-list-item prepend-avatar='@/assets/avatar5.png' title='Исанин Сергей'
                   subtitle='Администратор'></v-list-item>
    </v-list>
    <v-divider></v-divider>
    <!-- originalMenuItems-->
    <menu-list :menu-items='originalMenuItemsComputed' @click='handleClick'></menu-list>
    <v-divider></v-divider>
    <v-list-item v-if='isHovered'>
      <v-list-item-title>Участки</v-list-item-title>
    </v-list-item>
    <!-- plotsMenuItems -->
    <menu-list :menu-items='plotsMenuItemsComputed' @click='handleClick'></menu-list>
  </v-navigation-drawer>
</template>


<script setup>
import { ref, computed } from 'vue'
import MenuList from '@/components/MenuList.vue'
import { originalMenuItems, plotsMenuItems } from '@/data/menuItems' // Путь к файлу menuItems.js

const getIcon = (icon) => icon || 'mdi-circle-outline'

const hovered = ref(false)

const isHovered = ref(false)  // Используйте ref для отслеживания состояния развернутости

const processMenuItems = (items) => {
  return items.map(item => {
    if (!item.icon) item.icon = 'mdi-circle-outline'
    if (item.items) {
      item.items = item.items.map(subItem => {
        if (!subItem.icon) subItem.icon = 'mdi-circle-outline'
        return subItem
      })
    }
    return item
  })
}

const originalMenuItemsComputed = computed(() => processMenuItems(originalMenuItems))
const plotsMenuItemsComputed = computed(() => processMenuItems(plotsMenuItems))

const handleClick = (title) => {
  console.log('Clicked on:', title)
}

</script>
