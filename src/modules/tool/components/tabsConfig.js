// src/config/tabsConfig.js

import ToolTabParam from '@/modules/tool/components/tabs/Param.vue'
import HistoryIssue from '@/modules/history-issue-tool/components/Table.vue'
import HistoryDamaged from '@/modules/history-damaged-tool/components/Table.vue'
import ToolTabTree from '@/modules/tool/components/tabs/Tree.vue'
import EditorCatalog from '@/modules/editor-tool/components/Catalog.vue'
import StorageCatalog from '@/modules/storage-tool/components/Catalog.vue'
import IssueCatalog from '@/modules/issue-tool/components/Catalog.vue'
import NaladCatalog from '@/modules/nalad-tool/components/Catalog.vue'
import Report from '@/modules/tool/components/tabs/Report.vue'

const tabs = [
  {
    name: 'Редактор',
    url: '#editor',
    component: EditorCatalog,
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
  },
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
    name: 'История поврежденного',
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
    name: 'Дерево',
    url: '#tree',
    component: ToolTabTree,
    access: ['Admin', 'Editor', 'Issue', 'Sklad'],
  },
  { name: 'Отчёты', url: '#report', component: Report, access: ['Admin'] },
]

export default tabs
