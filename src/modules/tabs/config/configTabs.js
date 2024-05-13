import { markRaw } from 'vue'

import HistoryIssue from '@/modules/history-issue/components/Table.vue'
import HistoryDamaged from '@/modules/history-damaged/components/Table.vue'

import ToolTabParam from '@/modules/params/components/Param.vue'
import ToolTabGroup from '@/modules/groups/components/Groups.vue'
import ToolTabTree from '@/modules/tree/components/Tree.vue'
import Report from '@/modules/report-zakaz/components/Report.vue'
import ReportBuh from '@/modules/report-buh/components/Report.vue'
import ReportBuh2 from '@/modules/test/components/Report.vue'

import EditorCatalog from '@/modules/editor/components/Catalog.vue'
import IssueCatalog from '@/modules/issue/components/Catalog.vue'

import ViewCatalog from '@/modules/view/components/Catalog.vue'

const tabs = [
  {
    name: 'Редактор',
    url: '#editor',
    component: markRaw(EditorCatalog),
    access: ['Admin', 'Editor'],
    ico: 'mdi-pencil',
  },
  {
    name: 'Параметры',
    url: '#params',
    component: markRaw(ToolTabParam),
    access: ['Admin', 'Editor'],
    ico: 'mdi-playlist-plus',
  },
  {
    name: 'Группы',
    url: '#params',
    component: markRaw(ToolTabGroup),
    access: ['Admin', 'Editor'],
    ico: 'mdi-format-list-group',
  },
  {
    name: 'Выдать / поврежден',
    url: '#issue',
    component: markRaw(IssueCatalog),
    access: ['Admin', 'Editor', 'Issue'],
    ico: 'mdi-list-status',
  },
  {
    name: 'История выдачи',
    url: '#history_issue',
    component: markRaw(HistoryIssue),
    access: ['Admin', 'Editor', 'Issue'],
    ico: 'mdi-history',
  },
  {
    name: 'История поврежденного',
    url: '#history_damaged',
    component: markRaw(HistoryDamaged),
    access: ['Admin', 'Editor', 'Issue'],
    ico: 'mdi-history',
  },
  {
    name: 'Просмотр',
    url: '#view',
    component: markRaw(ViewCatalog),
    access: ['Admin', 'View', 'Editor'],
    ico: 'mdi-eye',
  },
  {
    name: 'Дерево',
    url: '#tree',
    component: markRaw(ToolTabTree),
    access: ['Admin', 'Editor', 'Issue', 'Sklad', 'View'],
    ico: 'mdi-file-tree',
  },
  {
    name: 'Отчёт заказ',
    url: '#report',
    component: markRaw(Report),
    access: ['Admin', 'Editor'],
    ico: 'mdi-package-variant',
  },
  {
    name: 'Отчёт бухгалтерия',
    url: '#report-buh',
    component: markRaw(ReportBuh),
    access: ['Admin', 'Editor'],
    ico: 'mdi-currency-rub',
  },
  {
    name: 'Тест',
    url: '#test',
    component: markRaw(ReportBuh2),
    access: ['Admin'],
    ico: 'mdi-test-tube',
  },
]

export default tabs
