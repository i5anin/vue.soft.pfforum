<template>
  <v-container>
    <Modal :title="popupTitle" v-if="showModal" />
    <!--    <v-btn color="primary" @click="openModal">Открыть модальное окно</v-btn>-->
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
import { VDataTableServer } from 'vuetify/labs/components'
import { format, parseISO } from 'date-fns'
import { fetchToolHistory } from '@/api'
import Modal from '@/modules/tool/components/modal/AddSkladToolModal.vue'

export default {
  components: { Modal, VDataTableServer },
  data() {
    return {
      showModal: false,
      toolsHistory: [],
      totalCount: 0,
      headers: [
        { title: 'Название', key: 'name', sortable: true },
        { title: 'Обозначение', key: 'description', sortable: true },
        { title: 'Номер операции', key: 'no_oper', sortable: true },
        { title: 'Тип операции', key: 'type_oper', sortable: true },
        { title: 'Кол-во', key: 'quantity', sortable: true },
        { title: 'ФИО', key: 'user_fio', sortable: true, width: '150px' },
        { title: 'Дата', key: 'date', sortable: true },
        { title: 'Инструмент', key: 'name_tool', sortable: true },
        // { title: 'Характеристики', key: 'property', sortable: true },
      ],
    }
  },
  async mounted() {
    await this.fetchAndFormatToolHistory()
  },
  methods: {
    openModal() {
      this.showModal = true // Установите переменную, контролирующую видимость модального окна
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
