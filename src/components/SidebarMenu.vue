<template>
  <v-navigation-drawer :modelValue='drawer' @update:modelValue='updateDrawer' permanent app width='350'>
    <v-list>
      <template v-for='(item, index) in menuItems' :key='index'>
        <v-list-item v-if='!item.items' :prepend-icon='item.icon' :title='item.title' @click='handleClick(item.title)'>
        </v-list-item>
        <v-list-group v-else :value='item.title'>
          <template v-slot:activator='{ props }'>
            <v-list-item v-bind='props' :prepend-icon='item.icon' :title='item.title'>
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
import { defineProps, defineEmits } from 'vue'
import SidebarMenuItem from '@/components/SidebarMenuItem.vue'

const { drawer } = defineProps(['drawer'])
const emits = defineEmits(['updateDrawer'])

const menuItems = [
  {
    title: 'Главная', icon: 'mdi-home',
  },
  {
    title: 'Станки', icon: 'mdi-account', items: [
      { title: 'Мониторинг', icon: 'mdi-monitor' },
      { title: 'Загрузка станков', icon: 'mdi-upload' },
    ],
  },
  { title: 'План', icon: 'mdi-settings' },
  { title: 'Статистика', icon: 'mdi-stat' },
  // ==Участки== items: []
  {
    title: 'Отдел ТО и ПП', icon: 'mdi-report', items: [
      { title: 'Ремонт оборудования', icon: 'mdi-quality-high' },
      { title: 'Закупка инструмента', icon: 'mdi-file-outline' },
    ],
  },
  { title: 'Участок заготовки', icon: 'mdi-report' },
  { title: 'Отдел продаж', icon: 'mdi-report' },
  {
    title: 'Слесарный участок', icon: 'mdi-report', items: [
      { title: 'План участка', icon: 'mdi-quality-high' },
      { title: 'Комментарии', icon: 'mdi-file-outline' },
    ],
  },
  {
    title: 'Участок ОТК', icon: 'mdi-report', items: [
      { title: 'Выходной контроль', icon: 'mdi-quality-high' },
      { title: 'Операционный контроль', icon: 'mdi-file-outline' },
      { title: 'Принятие брака', icon: 'mdi-file-outline' },
      { title: 'Статистика брака', icon: 'mdi-file-outline' },
      { title: 'Отработка', icon: 'mdi-file-outline' },
      { title: 'Совет по качеству', icon: 'mdi-file-outline' },
    ],
  },
  { title: 'Участок упаковки', icon: 'mdi-report' },
  { title: 'Склад', icon: 'mdi-report' },
  { title: 'Участок упаковки', icon: 'mdi-report' },
  { title: 'Экраны', icon: 'mdi-monitor-dashboard' },
  {
    title: 'Слесарный участок', icon: 'mdi-report', items: [
      { title: 'Участок ОТК', icon: 'mdi-quality-high' },
      { title: 'Участок упаковки', icon: 'mdi-file-outline' },
      { title: 'Станки', icon: 'mdi-update' },
      { title: 'Токарный участок', icon: 'mdi-delete' },
      { title: 'Фрезерный участок', icon: 'mdi-delete' },
    ],
  },
]
const updateDrawer = (value) => {
  emits('updateDrawer', value)
  console.log('Drawer toggled:', value)
}

const handleClick = (title) => {
  console.log('Clicked on:', title)
}

</script>
