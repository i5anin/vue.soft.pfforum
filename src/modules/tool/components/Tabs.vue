<template>
  <v-card>
    <v-tabs v-model="tab">
      <v-tab v-for="item in tabs" :key="item.name" :value="item.name">
        {{ item.name }}
      </v-tab>
    </v-tabs>

    <v-card-text>
      <v-window v-model="tab">
        <v-window-item v-for="item in tabs" :key="item.name" :value="item.name">
          <component
            :is="item.component"
            :parentId="parentId"
            :type="item.type"
          />
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import ToolTabParam from '@/modules/tool/components/tabs/Param.vue'
import GiveTool from '@/modules/tool/components/tabs/GiveTool.vue'
import ToolTabTree from '@/modules/tool/components/tabs/Tree.vue'

import TabCatalog from '@/modules/tool/components/tabs/Catalog.vue'
import StorageCatalog from '@/modules/tool/components/tabs/StorageCatalog.vue'
import TabIssueCatalog from '@/modules/tool/components/tabs/IssueCatalog.vue'

// Определение пропсов
const props = defineProps({
  parentId: { type: Object, default: () => ({ id: null, label: null }) },
})

// Ссылка на текущую выбранную вкладку
const tab = ref('Каталог')

// Определение вкладок
const tabs = [
  { name: 'Каталог', component: TabCatalog, type: 'Catalog' },
  { name: 'Дерево', component: ToolTabTree },
  { name: 'Параметры', component: ToolTabParam },
  { name: 'Выдача', component: TabIssueCatalog, type: 'Get' },
  { name: 'Склад', component: StorageCatalog, type: 'Sklad' },
  { name: 'История', component: GiveTool },
]

// Наблюдатель (watcher) для отслеживания изменений в выбранной вкладке
watch(tab, (newTabName) => {
  const currentTab = tabs.find((t) => t.name === newTabName)
  if (currentTab) {
    console.log('Текущий тип вкладки:', currentTab.type)
  }
})
</script>
