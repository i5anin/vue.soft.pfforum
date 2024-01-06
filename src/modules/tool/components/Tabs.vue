<template>
  <v-card>
    <v-tabs v-model="tab">
      <v-tab
        v-for="item in tabs"
        :key="item.name"
        @click="navigateToTab(item.routeName)"
      >
        {{ item.name }}
      </v-tab>
    </v-tabs>

    <v-card-text>
      <router-view />
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const tab = ref('')

const tabs = [
  { name: 'Каталог', routeName: 'Catalog' },
  { name: 'Дерево', routeName: 'Tree' },
  { name: 'Параметры', routeName: 'ToolTabParam' },
  { name: 'Выдача', routeName: 'TabIssueCatalog' },
  { name: 'Склад', routeName: 'TabCatalog' },
  { name: 'История', routeName: 'GiveTool' },
]

watch(
  () => route.name,
  (newRouteName) => {
    tab.value =
      tabs.find((tab) => tab.routeName === newRouteName)?.name || tabs[0].name
  }
)

const navigateToTab = (routeName) => {
  router.push({ name: routeName })
}
</script>
