<template>
  <v-card>
    <v-tabs v-model="tab">
      <v-tab value="Catalog"> Каталог </v-tab>
      <v-tab value="Tree"> Дерево </v-tab>
      <v-tab value="Param"> Параметры </v-tab>
      <v-tab value="GiveTool"> Получить инструмент </v-tab>
    </v-tabs>

    <v-card-text>
      <v-window v-model="tab">
        <v-window-item value="Catalog">
          <TabCatalog :parentId="parentId" />
        </v-window-item>
        <v-window-item value="Tree">
          <ToolTabTree />
        </v-window-item>
        <v-window-item value="Param">
          <ToolTabParam />
        </v-window-item>
        <v-window-item value="GiveTool">
          <GiveTool />
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

// Получаем parentId как prop
const props = defineProps({
  parentId: String,
})

const tab = ref('Catalog') // Начальное значение
</script>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TabsTools',
})
</script>
