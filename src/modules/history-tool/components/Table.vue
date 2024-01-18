<template>
  <v-container>
    <edit-tool-modal
      v-if="openDialog"
      :persistent="true"
      :specs_op_id="editingToolId"
      @canceled="onClosePopup"
      @changes-saved="onSaveChanges"
    />
    <v-data-table-server
      v-if="toolsHistory && toolsHistory.length > 0"
      no-data-text="Нет данных"
      items-per-page-text="Пункты на странице:"
      loading-text="Загрузка данных"
      :headers="headers"
      :items-length="totalCount"
      :items="toolsHistory"
      :items-per-page="filters.itemsPerPage"
      :page="filters.currentPage"
      :loading="isLoading"
      :items-per-page-options="[15, 50, 100, 300]"
      @update:page="onChangePage"
      @update:items-per-page="onUpdateItemsPerPage"
      @click:row="onInfoRow"
      hover
      fixed-header
      width="true"
    />
  </v-container>
</template>

<script>
import { VDataTableServer } from 'vuetify/labs/components'
import { format, parseISO } from 'date-fns'
import EditToolModal from './Modal.vue'
import { toolInventoryApi } from '@/modules/storage-tool/api/storage'
import { detailHistoryApi } from '@/modules/history-tool/api/history'

export default {
  components: { EditToolModal, VDataTableServer },
  data() {
    return {
      openDialog: false,
      filters: { itemsPerPage: 15, currentPage: 1 },
      isLoading: false,
      showModal: false,
      toolsHistory: [],
      editingToolId: null,
      totalCount: 0,
      headers: [
        // { title: 'Операция', value: 'specs_op_id', sortable: false },
        { title: 'ID', value: 'id', sortable: false },
        { title: 'Название', value: 'name', sortable: false, width: '300px' },
        { title: 'Обозначение', value: 'description', sortable: false },
        { title: 'Номер операции', value: 'no_oper', sortable: false },
        { title: 'Тип операции', value: 'type_oper', sortable: false },
        { title: 'Кол-во', value: 'quantity', sortable: false, width: '80px' },
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
      this.filters.currentPage = page
      await this.fetchAndFormatToolHistory()
    },
    async onUpdateItemsPerPage(itemsPerPage) {
      this.filters.itemsPerPage = itemsPerPage
      await this.fetchAndFormatToolHistory()
    },
    formatDate(date) {
      return format(parseISO(date), 'dd.MM.yyyy HH:mm:ss')
    },
    async fetchAndFormatToolHistory() {
      const response = await detailHistoryApi.fetchToolHistory(
        '',
        this.filters.currentPage,
        this.filters.itemsPerPage
      )
      this.toolsHistory = response.toolsHistory.map((tool) => ({
        ...tool,
        date: this.formatDate(tool.date),
      }))
      this.totalCount = response.totalCount
    },
    onClosePopup() {
      this.openDialog = false
    },
    onInfoRow(event, { item: tool }) {
      this.editingToolId = tool.specs_op_id
      this.openDialog = true
    },
    onSaveChanges() {
      this.openDialog = false
      this.$emit('changes-saved')
    },
  },
}
</script>
