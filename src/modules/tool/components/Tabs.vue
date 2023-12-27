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
import GiveTool from '@/modules/tool/components/tabs/GiveTool.vue'
import TabCatalog from '@/modules/tool/components/tabs/Catalog.vue'
import ToolTabTree from '@/modules/tool/components/tabs/Tree.vue'

const props = defineProps({
  parentId: {
    type: Object,
    default: () => ({ id: null, label: null }),
  },
})

const tab = ref('Каталог')

const tabs = [
  { name: 'Каталог', component: TabCatalog, type: 'Catalog' },
  { name: 'Дерево', component: ToolTabTree },
  { name: 'Параметры', component: ToolTabParam },
  { name: 'Выдача', component: TabCatalog, type: 'Get' },
  { name: 'Склад', component: TabCatalog, type: 'Sklad' },
  { name: 'История', component: GiveTool },
]
</script>
