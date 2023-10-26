// menuItems.js
export const originalMenuItems = [
  {
    title: 'Главная', icon: 'mdi-home',
  },
  {
    title: 'Станки', icon: 'mdi-account', items: [
      { title: 'Мониторинг', icon: 'mdi-monitor-dashboard' },
      { title: 'Загрузка станков', icon: 'mdi-upload' },
    ],
  },
  { title: 'План', icon: 'mdiFormatListCheckbox' },
  { title: 'Статистика', icon: 'mdi-stat' },
  // ==Участки== items: []
  {
    title: 'Отдел ТО и ПП', icon: 'mdi-report', items: [
      { title: 'Ремонт оборудования' },
      { title: 'Закупка инструмента' },
      { title: 'Инструмент' },
    ],
  },
  { title: 'Участок заготовки', icon: 'mdi-report' },
  { title: 'Отдел продаж', icon: 'mdi-report' },
  {
    title: 'Слесарный участок', icon: 'mdi-report', items: [
      { title: 'План участка' },
      { title: 'Комментарии' },
    ],
  },
  {
    title: 'Участок ОТК', icon: 'mdi-report', items: [
      { title: 'Выходной контроль' },
      { title: 'Операционный контроль' },
      { title: 'Принятие брака' },
      { title: 'Статистика брака' },
      { title: 'Отработка' },
      { title: 'Совет по качеству' },
    ],
  },
  { title: 'Участок упаковки', icon: 'mdi-report' },
  { title: 'Склад', icon: 'mdi-report' },
  { title: 'Участок упаковки', icon: 'mdi-report' },
  { title: 'Экраны', icon: 'mdi-monitor' },
  {
    title: 'Слесарный участок1', icon: 'mdi-report', items: [
      { title: 'Участок ОТК' },
      { title: 'Участок упаковки' },
      { title: 'Станки' },
      { title: 'Токарный участок' },
      { title: 'Фрезерный участок' },
    ],
  },
];


