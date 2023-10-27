<template>
  <v-navigation-drawer
    :value='drawer'
    expand-on-hover rail
    width='330'
    @mouseenter='isHovered = true'
    @mouseleave='handleMouseLeave'
    @input="$emit('update:drawer', $event)"
  >
    <v-list>
      <v-list-item
        prepend-avatar='@/assets/logoWhite.svg'
        title='СОФТ 2.0' />
    </v-list>
    <v-divider />
    <v-list>
      <v-list-item
        prepend-avatar='@/assets/avatar.png'
        title='Исанин Сергей'
        subtitle='Администратор' />
    </v-list>
    <v-divider></v-divider>
    <menu-list
      :menu-items='originalMenuItemsComputed'
      @click='handleClick'
      v-bind:group-states='groupStates' />
    <v-divider />
    <v-list-item v-if='isHovered'>
      <v-list-item-title>Участки</v-list-item-title>
    </v-list-item>
    <menu-list
      :menu-items='plotsMenuItemsComputed'
      @click='handleClick'
      v-bind:group-states='groupStates' />
  </v-navigation-drawer>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, defineProps, defineEmits } from 'vue'
import MenuList from '@/components/MenuList.vue'
import { originalMenuItems, plotsMenuItems } from '@/data/menuItems'

const isHovered = ref(false)
const groupStates = ref({})

// Получение props и emits
const { drawer } = defineProps(['drawer'])
const emit = defineEmits(['update:drawer'])

// Функция для переключения состояния drawer
const toggleDrawer = () => {
  emit('update:drawer', !drawer)
}

const handleMouseLeave = () => {
  isHovered.value = false
  Object.keys(groupStates.value).forEach(key => {
    groupStates.value[key] = false
  })
}

const getIcon = (icon) => icon || 'mdi-circle-outline'

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

const router = useRouter()
const handleClick = (item) => {
  console.log('Clicked on:', item.title)
  if (item.path) {
    if (item.path.startsWith('http')) {
      window.location.href = item.path
    } else {
      router.push({ path: item.path })
    }
  }
}
</script>
