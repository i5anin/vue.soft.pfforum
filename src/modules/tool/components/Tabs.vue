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
import { ref, watch, onMounted } from 'vue'
import ToolTabParam from '@/modules/tool/components/tabs/Param.vue'
import GiveTool from '@/modules/history-tool/components/Table.vue'
import ToolTabTree from '@/modules/tool/components/tabs/Tree.vue'

import EditorCatalog from '@/modules/editor-tool/components/Catalog.vue'
import StorageCatalog from '@/modules/storage-tool/components/Catalog.vue'
import TabIssueCatalog from '@/modules/issue-tool/components/Catalog.vue'

import Report from '@/modules/tool/components/tabs/Report.vue'

// Ссылка на текущую выбранную вкладку
const tab = ref('Редактор')

// Определение вкладок
const tabs = [
  { name: 'Редактор', url: '#editor', component: EditorCatalog },
  { name: 'Дерево', url: '#tree', component: ToolTabTree },
  { name: 'Параметры', url: '#params', component: ToolTabParam },
  { name: 'Выдача', url: '#item4', component: TabIssueCatalog },
  { name: 'Склад', url: '#item5', component: StorageCatalog },
  { name: 'История', url: '#item6', component: GiveTool },
  { name: 'Отчёты', url: '#item7', component: Report },
]

watch(tab, () => {

  // console.log(tabs)

  let current_tab = tabs.find((el) => el.name == tab.value)

  window.location.hash = current_tab.url;
  // console.log(current_tab)
  // console.log(window.location)
})

onMounted(() => {
  console.log(window.location.hash)

  let current_tab = tabs.find((el) => el.url == window.location.hash)

  if(current_tab != undefined)
    tab.value = current_tab.name

})


</script>
