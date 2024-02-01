<template>
  <v-card>
    <v-tabs v-model="tab">
      <v-tab v-for="item in tabs" :key="item.name" :value="item.name">
        {{ item.name }}
      </v-tab>
    </v-tabs>

    <v-card-text>
      <v-window v-model="tab">
        <v-window-item
          v-for="item in tabs"
          :key="`window-item-${item.name}`"
          :value="item.name"
        >
          <component
            :is="item.component"
            :key="`component-${item.name}-${tab}`"
            :parentId="parentId"
            :type="item.type"
          />
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script>
import { computed, ref, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import tabsConfig from './tabsConfig' // Убедитесь, что путь правильный

export default {
  setup() {
    const store = useStore()
    const tab = ref('Редактор')
    const tabs = ref(tabsConfig) // Используем нашу конфигурацию вкладок
    const userRole = computed(() => store.getters['authStore/userRole'])

    // Фильтруем вкладки на основе роли пользователя
    const filteredTabs = computed(() => {
      return tabs.value.filter((tabItem) =>
        tabItem.access.includes(userRole.value)
      )
    })

    // Следим за изменениями в tab, чтобы обновлять window.location.hash
    watch(tab, (newValue) => {
      const currentTab = tabs.value.find((tabItem) => tabItem.name === newValue)
      if (currentTab) {
        window.location.hash = currentTab.url
      }
    })

    // Устанавливаем текущую вкладку на основе window.location.hash при монтировании
    onMounted(() => {
      const hash = window.location.hash
      const currentTab = tabs.value.find(
        (tabItem) => `#${tabItem.url.split('#')[1]}` === hash
      )
      if (currentTab) {
        tab.value = currentTab.name
      } else if (filteredTabs.value.length > 0) {
        // Устанавливаем первую доступную вкладку, если hash не соответствует ни одной вкладке
        tab.value = filteredTabs.value[0].name
      }
    })

    return {
      tab,
      filteredTabs,
    }
  },
}
</script>
