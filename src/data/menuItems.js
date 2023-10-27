// menuItems.js
export const originalMenuItems = [
  {
    title: 'Главная', icon: 'mdi-home', path: '/',
  },
  {
    title: 'Станки', icon: 'mdi-expansion-card-variant', items: [
      { title: 'Мониторинг', icon: 'mdi-monitor-dashboard' },
      { title: 'Загрузка станков', icon: 'mdi-clock-time-eight-outline' },
    ],
  },
  { title: 'План', icon: 'mdi-format-list-checks' },
  {
    title: 'Статистика', icon: 'mdi-chart-bar', items: [
      { title: 'Статистика пр-ва', icon: 'mdi-chart-pie' },
      { title: 'Отклонение Т шт', icon: 'mdi-chart-timeline' },
    ],
  },
  {
    title: 'Отчёты', icon: 'mdi-file-document-outline', items: [
      { title: 'Заготовка (за неделю)' },
      { title: 'Слесарка (за неделю)' },
      { title: 'Слесарка (план)' },
      { title: 'ОТК' },
      { title: 'ОТК Выработка' },
      { title: 'Упаковка' },
      { title: 'Приход на склад' },
      { title: 'Отгрузка за неделю' },
      { title: 'Склад готовой продукции' },
      { title: 'Склад остатков' },
      { title: 'Участки' },
    ],
  },
  // ==Участки== items: []
]

export const plotsMenuItems = [
  {
    title: 'Отдел ТО и ПП', icon: 'mdi-tools', items: [
      { title: 'Ремонт оборудования' },
      { title: 'Закупка инструмента' },
      { title: 'Инструмент', path: '/Tool' },
    ],
  },
  { title: 'Участок заготовки', icon: 'mdi-cog' },
  { title: 'Отдел продаж', icon: 'mdi-chart-line' },
  {
    title: 'Слесарный участок', icon: 'mdi-hammer', items: [
      { title: 'План участка' },
      { title: 'Комментарии' },
    ],
  },
  {
    title: 'Участок ОТК', icon: 'mdi-android-studio', items: [
      { title: 'Выходной контроль' },
      { title: 'Операционный контроль' },
      { title: 'Принятие брака' },
      { title: 'Статистика брака' },
      { title: 'Отработка' },
      { title: 'Совет по качеству' },
    ],
  },
  { title: 'Участок упаковки', icon: 'mdi-package-variant' },
  {
    title: 'Склад', icon: 'mdi-garage', items: [
      { title: 'План' },
      { title: 'Приход с упаковки' },
      { title: 'Приход от аутсорса' },
      { title: 'Корректировка остатков' },
    ],
  },
  {
    title: 'Экраны', icon: 'mdi-monitor', items: [
      { title: 'Слесарный участок' },
      { title: 'Участок ОТК' },
      { title: 'Участок упаковки' },
      { title: 'Станки' },
      { title: 'Токарный участок' },
      { title: 'Фрезерный участок' },
    ],
  },
]

















