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
import ToolTabParam from '@/modules/tool/components/tabs/Param.vue'
import HistoryIssue from '@/modules/history-issue-tool/components/Table.vue'
import HistoryDamaged from '@/modules/history-damaged-tool/components/Table.vue'
import ToolTabTree from '@/modules/tool/components/tabs/Tree.vue'

import EditorCatalog from '@/modules/editor-tool/components/Catalog.vue'
import StorageCatalog from '@/modules/storage-tool/components/Catalog.vue'
import IssueCatalog from '@/modules/issue-tool/components/Catalog.vue'
import NaladCatalog from '@/modules/nalad-tool/components/Catalog.vue'

import Report from '@/modules/tool/components/tabs/Report.vue'

export default {
  data() {
    return {
      tab: 'Редактор',
      tabs: [
        {
          name: 'Редактор',
          url: '#editor',
          component: EditorCatalog,
          access: ['Admin', 'Editor'],
        },
        {
          name: 'Дерево',
          url: '#tree',
          component: ToolTabTree,
          access: ['Admin', 'Editor'],
        },
        {
          name: 'Параметры',
          url: '#params',
          component: ToolTabParam,
          access: ['Admin', 'Editor'],
        },
        {
          name: 'Выдача',
          url: '#issue',
          component: IssueCatalog,
          access: ['Admin', 'Editor', 'Issue'],
        }, //инструментальщик
        {
          name: 'Склад',
          url: '#storage',
          component: StorageCatalog,
          access: ['Admin', 'Editor', 'Sklad'],
        },
        {
          name: 'История выдачи',
          url: '#history_issue',
          component: HistoryIssue,
          access: ['Admin', 'Editor'],
        },
        {
          name: 'История испорченного',
          url: '#history_damaged',
          component: HistoryDamaged,
          access: ['Admin', 'Editor'],
        },
        {
          name: 'Наладчик',
          url: '#nalad',
          component: NaladCatalog,
          access: ['Nalad'],
        },
        {
          name: 'Отчёты',
          url: '#report',
          component: Report,
          access: ['Admin'],
        },
      ],
    }
  },
  watch: {
    tab() {
      let current_tab = this.tabs.find((el) => el.name == this.tab)
      window.location.hash = current_tab.url
    },
  },
  mounted() {
    let current_tab = this.tabs.find((el) => el.url == window.location.hash)
    if (current_tab !== undefined) this.tab = current_tab.name
  },
}
</script>
