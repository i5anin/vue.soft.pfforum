<template>
  <v-app-bar color='primary' sticky prominent dark>
    <!-- Левая кнопка -->
    <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

    <!-- Название -->
    <v-toolbar-title>
      PF-FORUM APP
    </v-toolbar-title>
    <v-spacer />
    <!-- Три кнопки справа -->
    <v-btn icon>
      <v-icon>mdi-magnify</v-icon>
    </v-btn>
    <v-btn icon>
      <v-icon>mdi-fullscreen</v-icon>
    </v-btn>
    <v-btn icon>
      <v-icon>mdi-moon-last-quarter</v-icon>
    </v-btn>
    <v-btn icon>
      <v-icon>mdi-exit-to-app</v-icon>
    </v-btn>
  </v-app-bar>


  <v-navigation-drawer
    :value='true'
    location='left'
    width='330'
    expand-on-hover
    permanent
    :rail='drawer'
    @mouseenter='isHovered = true'
    @mouseleave='handleMouseLeave' @input="$emit('update:drawer', $event)">
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
    <v-divider />
    <!--  -->
    <menu-list
      :menu-items='originalMenuItemsComputed'
      @click='handleClick'
      v-bind:group-states='groupStates' />
    <v-divider />
    <v-list-item v-if='isHovered'>
      <v-list-item-title>Участки</v-list-item-title>
    </v-list-item>
    <!-- Участки -->
    <menu-list
      :menu-items='plotsMenuItemsComputed'
      @click='handleClick'
      v-bind:group-states='groupStates' />
  </v-navigation-drawer>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, defineProps, defineEmits,onMounted, onBeforeUnmount  } from 'vue'
import MenuList from '@/components/SidebarMenuList.vue'
import { originalMenuItems, plotsMenuItems } from '@/data/menuItems'

const isHovered = ref(false)
const drawer = ref(false)
const isDisabledResizeWatcher = ref(false)
const groupStates = ref({})

// Получение props и emits
const emit = defineEmits(['update:drawer'])

const handleMouseLeave = () => {
  isHovered.value = false
  Object.keys(groupStates.value).forEach(key => {
    groupStates.value[key] = false
  })
}

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

const originalMenuItemsComputed =
  computed(() => processMenuItems(originalMenuItems))
const plotsMenuItemsComputed =
  computed(() => processMenuItems(plotsMenuItems))

const onResize = (event) => {
  if (event == null) {
    isDisabledResizeWatcher.value = window.innerWidth > 600
    return
  }
  isDisabledResizeWatcher.value = event.target.innerWidth > 600
}

onMounted(()=> {
  window.addEventListener("resize", onResize);
  onResize()
})

onBeforeUnmount(()=> {
  window.removeEventListener("resize", onResize);

})

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
