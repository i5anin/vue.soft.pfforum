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
import { ref } from 'vue'
import ToolTabParam from '@/modules/tool/components/tabs/Param.vue'
import GiveTool from '@/modules/history-tool/components/Table.vue'
import ToolTabTree from '@/modules/tool/components/tabs/Tree.vue'

import EditorCatalog from '@/modules/editor-tool/components/Catalog.vue'
import StorageCatalog from '@/modules/storage-tool/components/Catalog.vue'
import TabIssueCatalog from '@/modules/issue-tool/components/Catalog.vue'

import Report from '@/modules/tool/components/tabs/Report.vue'

// Ссылка на текущую выбранную вкладку
const tab = ref('Каталог')

// Определение вкладок
const tabs = [
  { name: 'Редактор', component: EditorCatalog },
  { name: 'Дерево', component: ToolTabTree },
  { name: 'Параметры', component: ToolTabParam },
  { name: 'Выдача', component: TabIssueCatalog },
  { name: 'Склад', component: StorageCatalog },
  { name: 'История', component: GiveTool },
  { name: 'Отчёты', component: Report },
]
</script>
