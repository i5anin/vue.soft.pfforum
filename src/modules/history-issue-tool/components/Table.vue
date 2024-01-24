<template>
  <v-container>
    <edit-tool-modal
      v-if="openDialog"
      :persistent="true"
      :id_part="editingToolId"
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
import { issueHistoryApi } from '@/modules/history-issue-tool/api/history'

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
        { title: 'ID партии', value: 'id_part', sortable: false },
        { title: 'Название', value: 'name', sortable: false, width: '300px' },
        { title: 'Обозначение', value: 'description', sortable: false },
        { title: 'Дата', value: 'date', sortable: false },
        { title: 'Кол-во', value: 'quantity', sortable: false, width: '80px' },
        { title: 'Операций', value: 'operation_count', sortable: false },
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
      return format(parseISO(date), 'dd.MM.yyyy')
    },
    async fetchAndFormatToolHistory() {
      const response = await issueHistoryApi.fetchToolHistory(
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
      this.editingToolId = tool.id_part
      this.openDialog = true
    },
    onSaveChanges() {
      this.openDialog = false
      this.$emit('changes-saved')
    },
  },
}
</script>
