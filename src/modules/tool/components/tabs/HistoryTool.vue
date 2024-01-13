<template>
  <v-container>
    <v-data-table-server
      v-if="toolsHistory && toolsHistory.length > 0"
      no-data-text="Нет данных"
      items-per-page-text="Пункты на странице:"
      loading-text="Загрузка данных"
      :headers="headers"
      :items-length="totalCount"
      :items="toolsHistory"
      :items-per-page-options="[15, 50, 100, 300]"
      @update:page="onChangePage"
      @update:items-per-page="onUpdateItemsPerPage"
    >
    </v-data-table-server>
  </v-container>
</template>

<script>
import { VDataTableServer } from 'vuetify/labs/components'
import { format, parseISO } from 'date-fns'
import { fetchToolHistory } from '@/api'

export default {
  components: { VDataTableServer },
  data() {
    return {
      showModal: false,
      toolsHistory: [],
      totalCount: 0,
      headers: [
        { title: 'Операция', value: 'specs_op_id', sortable: false },
        { title: 'ID', value: 'id', sortable: false },
        { title: 'Название', value: 'name', sortable: false },
        { title: 'Обозначение', value: 'description', sortable: false },
        { title: 'Номер операции', value: 'no_oper', sortable: false },
        { title: 'Тип операции', value: 'type_oper', sortable: false },
        { title: 'Кол-во', value: 'quantity', sortable: false, width: '100px' },
        { title: 'ФИО', value: 'user_fio', sortable: false, width: '150px' },
        { title: 'Дата', value: 'date', sortable: false },
        { title: 'Инструмент', value: 'name_tool', sortable: false },
      ],
    }
  },
  async mounted() {
    await this.fetchAndFormatToolHistory()
  },
  methods: {
    async onChangePage(page) {
      this.$emit('page-changed', page)
    },
    async onUpdateItemsPerPage(itemsPerPage) {
      this.$emit('page-limit-changed', itemsPerPage)
    },
    formatDate(date) {
      return format(parseISO(date), 'dd.MM.yyyy HH:mm:ss')
    },
    async fetchAndFormatToolHistory() {
      try {
        const response = await fetchToolHistory()
        this.toolsHistory = response.toolsHistory.map((tool) => ({
          ...tool,
          date: this.formatDate(tool.date),
        }))
        this.totalCount = response.totalCount
      } catch (error) {
        console.error('Ошибка при загрузке истории инструментов:', error)
      }
    },
  },
}
</script>
