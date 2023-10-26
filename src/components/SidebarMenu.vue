<template>
  <v-navigation-drawer :modelValue='drawer' @update:modelValue='updateDrawer' permanent app width='350'>
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
          <sidebar-menu-item v-for='(subItem, subIndex) in item.items' :key='subIndex'
                             :item='subItem' @click='handleClick(subItem.title)'></sidebar-menu-item>
        </v-list-group>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import SidebarMenuItem from '@/components/SidebarMenuItem.vue'

const { drawer } = defineProps(['drawer'])
const emits = defineEmits(['updateDrawer'])
const getIcon = (icon) => icon || 'mdi-circle-outline'

const originalMenuItems = [
  {
    title: 'Главная', icon: 'mdi-home',
  },
  {
    title: 'Станки', icon: 'mdi-account', items: [
      { title: 'Мониторинг', icon: 'mdi-monitor' },
      { title: 'Загрузка станков', icon: 'mdi-upload' },
    ],
  },
  { title: 'План', icon: 'mdiFormatListCheckbox' },
  { title: 'Статистика', icon: 'mdi-stat' },
  // ==Участки== items: []
  {
    title: 'Отдел ТО и ПП', icon: 'mdi-report', items: [
      { title: 'Ремонт оборудования' },
      { title: 'Закупка инструмента' },
      { title: 'Инструмент' },
    ],
  },
  { title: 'Участок заготовки', icon: 'mdi-report' },
  { title: 'Отдел продаж', icon: 'mdi-report' },
  {
    title: 'Слесарный участок', icon: 'mdi-report', items: [
      { title: 'План участка' },
      { title: 'Комментарии' },
    ],
  },
  {
    title: 'Участок ОТК', icon: 'mdi-report', items: [
      { title: 'Выходной контроль' },
      { title: 'Операционный контроль' },
      { title: 'Принятие брака' },
      { title: 'Статистика брака' },
      { title: 'Отработка' },
      { title: 'Совет по качеству' },
    ],
  },
  { title: 'Участок упаковки', icon: 'mdi-report' },
  { title: 'Склад', icon: 'mdi-report' },
  { title: 'Участок упаковки', icon: 'mdi-report' },
  { title: 'Экраны', icon: 'mdi-monitor-dashboard' },
  {
    title: 'Слесарный участок', icon: 'mdi-report', items: [
      { title: 'Участок ОТК' },
      { title: 'Участок упаковки' },
      { title: 'Станки' },
      { title: 'Токарный участок' },
      { title: 'Фрезерный участок' },
    ],
  },
]
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
