<template>
  <v-container>
    <v-data-table-server
      v-if="toolsHistory && toolsHistory.length > 0"
      noDataText="Нет данных"
      itemsPerPageText="Пункты на странице:"
      loadingText="Загрузка данных"
      item-value="name"
      :headers="headers"
      :items-length="totalCount"
      :items="toolsHistory"
      :items-per-page-options="[15, 50, 100, 300]"
    >
    </v-data-table-server>
  </v-container>
</template>

<script>
import { fetchToolHistory } from '@/api'
import { VDataTableServer } from 'vuetify/labs/components'
import { format, parseISO } from 'date-fns'

export default {
  components: { VDataTableServer },
  data() {
    return {
      toolsHistory: [],
      totalCount: 0,
      headers: [
        { title: 'Название', key: 'name', sortable: true },
        { title: 'Обозначение', key: 'description', sortable: true },
        { title: 'Номер операции', key: 'no_oper', sortable: true },
        { title: 'Тип операции', key: 'type_oper', sortable: true },
        { title: 'Кол-во', key: 'quantity', sortable: true },
        { title: 'ФИО', key: 'user_fio', sortable: true },
        { title: 'Дата приход', key: 'date_p', sortable: true },
        { title: 'Дата уход', key: 'date_u', sortable: true },
        { title: 'Название инструмента', key: 'name_tool', sortable: true },
        { title: 'Характеристики', key: 'property', sortable: true },
      ],
    }
  },
  async mounted() {
    await this.fetchAndFormatToolHistory()
  },
  methods: {
    formatDate(date) {
      return format(parseISO(date), 'dd.MM.yyyy')
    },
    async fetchAndFormatToolHistory() {
      try {
        const response = await fetchToolHistory()
        this.toolsHistory = response.toolsHistory.map((tool) => ({
          ...tool,
          date_p: this.formatDate(tool.date_p),
          date_u: this.formatDate(tool.date_u),
        }))
        this.totalCount = response.totalCount
      } catch (error) {
        console.error('Ошибка при загрузке истории инструментов:', error)
      }
    },
  },
}
</script>
