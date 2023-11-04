<template>
  <header>
    <v-navigation-drawer
      class='header'
      location='left'
      width='330'
      expand-on-hover
      permanent
      :rail='isRail'
    >
      <v-list>
        <v-list-item prepend-avatar='@/assets/logoWhite.svg' title='СОФТ 2.0' />
      </v-list>
      <v-divider />
      <v-list>
        <v-list-item
          prepend-avatar='@/assets/avatar.png'
          title='Исанин Сергей'
          subtitle='Администратор'
        />
      </v-list>
      <v-divider />
      <!--  -->
      <menu-list
        :menu-items='originalMenuItemsComputed'
        :group-states='groupStates'
      />
      <v-divider />
      <v-list-item v-if='isHovered'>
        <v-list-item-title>Участки</v-list-item-title>
      </v-list-item>
      <!-- Участки -->
      <menu-list
        :menu-items='plotsMenuItemsComputed'
        :group-states='groupStates'
      />
    </v-navigation-drawer>

    <v-app-bar color='primary' sticky prominent dark>
      <!-- Левая кнопка -->
      <v-app-bar-nav-icon
        variant='text'
        @click.stop='isRail = !isRail'
      ></v-app-bar-nav-icon>
      <!-- Название -->
      <v-toolbar-title>PF-FORUM</v-toolbar-title>
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
  </header>
</template>

<script>
import MenuList from '@/components/SidebarMenuList.vue'
import { originalMenuItems, plotsMenuItems } from '@/data/menuItems'

export default {
  name: 'Header',
  components: { MenuList },
  data: () => ({
    isRail: true,
    isHovered: false,
  }),
  computed: {
    originalMenuItemsComputed() {
      return this.processMenuItems(originalMenuItems)
    },
    plotsMenuItemsComputed() {
      return this.processMenuItems(plotsMenuItems)
    },
    groupStates() {
      return []
    },
  },
  methods: {
    processMenuItems(items) {
      return items.map((item) => {
        if (!item.icon) item.icon = 'mdi-circle-outline'
        if (item.items) {
          item.items = item.items.map((subItem) => {
            if (!subItem.icon) subItem.icon = 'mdi-circle-outline'
            return subItem
          })
        }
        return item
      })
    },
  },
}
</script>

<style scoped lang='css'>
.header > div {
  ::v-deep ::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }

  ::-webkit-scrollbar-track {
    width: 0 !important;
  }
  ::-webkit-scrollbar-thumb {
    width: 0 !important;
  }
}

::v-deep .v-navigation-drawer__content::-webkit-scrollbar-track{
  -webkit-box-shadow: inset 0 0 6px #5d5d5d;
  background-color: #5d5d5d;
}
::v-deep .v-navigation-drawer__content::-webkit-scrollbar{
  width: 0;
}
::v-deep .v-navigation-drawer__content::-webkit-scrollbar-thumb{
  -webkit-box-shadow: inset 0 0 6px #424242;
  background-color: #424242;
}

</style>
