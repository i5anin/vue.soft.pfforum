<template>
  <v-card>
    <v-tabs v-model="tab">
      <v-tab v-for="item in tabs" :key="item.component" :value="item.component">
        {{ item.name }}
      </v-tab>
    </v-tabs>

    <v-card-text>
      <v-window v-model="tab">
        <v-window-item
          v-for="item in tabs"
          :key="item.component"
          :value="item.component"
        >
          <component :is="item.component" :parentId="parentId" />
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

// eslint-disable-next-line no-unused-vars
const props = defineProps({
  parentId: String,
})

const tab = ref('Catalog')

const tabs = [
  { name: 'Каталог', component: TabCatalog },
  { name: 'Дерево', component: ToolTabTree },
  { name: 'Параметры', component: ToolTabParam },
  { name: 'Получить инструмент', component: GiveTool },
]
</script>
