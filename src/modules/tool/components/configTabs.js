import { markRaw } from 'vue'

import HistoryIssue from '@/modules/history-issue-tool/components/Table.vue'
import HistoryDamaged from '@/modules/history-damaged-tool/components/Table.vue'

import ToolTabParam from '@/modules/tool/components/other-tabs/Param.vue'
import ToolTabTree from '@/modules/tool/components/other-tabs/Tree.vue'
import Report from '@/modules/tool/components/other-tabs/Report.vue'

import EditorCatalog from '@/modules/editor-tool/components/Catalog.vue'
import StorageCatalog from '@/modules/storage-tool/components/Catalog.vue'
import IssueCatalog from '@/modules/issue-tool/components/Catalog.vue'
import NaladCatalog from '@/modules/nalad-tool/components/Catalog.vue'

const tabs = [
  {
    name: 'Редактор',
    url: '#editor',
    component: markRaw(EditorCatalog),
    access: ['Admin', 'Editor'],
  },
  {
    name: 'Параметры',
    url: '#params',
    component: markRaw(ToolTabParam),
    access: ['Admin', 'Editor'],
  },
  {
    name: 'Выдача',
    url: '#issue',
    component: markRaw(IssueCatalog),
    access: ['Admin', 'Editor', 'Issue'],
  },
  {
    name: 'Склад',
    url: '#storage',
    component: markRaw(StorageCatalog),
    access: ['Admin', 'Editor', 'Sklad'],
  },
  {
    name: 'История выдачи',
    url: '#history_issue',
    component: markRaw(HistoryIssue),
    access: ['Admin', 'Editor'],
  },
  {
    name: 'История поврежденного',
    url: '#history_damaged',
    component: markRaw(HistoryDamaged),
    access: ['Admin', 'Editor'],
  },
  {
    name: 'Наладчик',
    url: '#nalad',
    component: markRaw(NaladCatalog),
    access: ['Nalad'],
  },
  {
    name: 'Дерево',
    url: '#tree',
    component: markRaw(ToolTabTree),
    access: ['Admin', 'Editor', 'Issue', 'Sklad'],
  },
  {
    name: 'Отчёты',
    url: '#report',
    component: markRaw(Report),
    access: ['Admin'],
  },
]

export default tabs
