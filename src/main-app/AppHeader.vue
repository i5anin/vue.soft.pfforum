<template>
  <header>
    <v-navigation-drawer
      class="header"
      location="left"
      width="330"
      expand-on-hover
      permanent
      :rail="isRail"
    >
      <v-list>
        <v-list-item prepend-avatar="@/assets/logoWhite.svg" title="СОФТ 2.0" />
      </v-list>
      <v-divider />
      <v-list>
        <v-list-item
          prepend-avatar="@/assets/avatar.png"
          :title="userInfo.user"
          :subtitle="appTitle"
        />
        <!--        subtitle="Тестирование"-->
        <!-- title='Исанин Сергей' subtitle='Администратор'-->
      </v-list>
      <v-divider />
      <!--  -->
      <!--      <menu-list-->
      <!--        :menu-items="originalMenuItemsComputed"-->
      <!--        :group-states="groupStates"-->
      <!--      />-->
      <!--      <v-divider />-->
      <v-list-item v-if="isHovered">
        <v-list-item-title>Участки</v-list-item-title>
      </v-list-item>
      <!-- Участки -->
      <menu-list
        :menu-items="plotsMenuItemsComputed"
        :group-states="groupStates"
      />
    </v-navigation-drawer>

    <v-app-bar :color="appColor" sticky prominent dark>
      <!-- Левая кнопка -->
      <v-app-bar-nav-icon
        variant="text"
        @click.stop="isRail = !isRail"
      ></v-app-bar-nav-icon>
      <!-- Название -->
      <v-toolbar-title>{{ appTitle }}</v-toolbar-title>
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
        <v-icon @click="logout">mdi-exit-to-app</v-icon>
      </v-btn>
    </v-app-bar>
  </header>
</template>

<script>
import MenuList from '@/main-app/SidebarMenuList.vue'
import { originalMenuItems, plotsMenuItems } from '@/main-app/data/menuItems'
import { authApi } from '@/api/login'

export default {
  name: 'AppHeader',
  components: { MenuList },
  data: () => ({
    isRail: true,
    isHovered: false,
    userInfo: {},
  }),
  async created() {
    this.userInfo = await authApi.checkLogin()
  },
  computed: {
    appTitle() {
      return import.meta.env.VITE_APP_TITLE || 'LOGO'
    },
    appColor() {
      return import.meta.env.VITE_NODE_ENV === 'build' ? 'blue-grey' : 'primary'
    },
    originalMenuItemsComputed() {
      return this.filterForHohlov(originalMenuItems)
    },
    plotsMenuItemsComputed() {
      return this.filterForHohlov(plotsMenuItems)
    },
    groupStates() {
      // Инициализация состояния группы, если необходимо
      return []
    },
  },
  methods: {
    filterForHohlov(items) {
      return items
        .filter((item) => item.access && item.access.includes('hohlov'))
        .map((item) => {
          // Задаем иконку по умолчанию, если не задана
          if (!item.icon) item.icon = 'mdi-circle-outline'
          // Проверяем подпункты
          if (item.items) {
            item.items = item.items.map((subItem) => {
              if (!subItem.icon) subItem.icon = 'mdi-circle-outline'
              return subItem
            })
          }
          return item
        })
    },
    logout() {
      localStorage.removeItem('token') // Если вы используете Vuex для отслеживания статуса аутентификации
      this.$router.push('/Login') // Перенаправление на страницу входа
    },
  },
}
</script>

<style scoped lang="css">
::v-deep .v-navigation-drawer__content::-webkit-scrollbar {
  width: 0;
}
</style>
