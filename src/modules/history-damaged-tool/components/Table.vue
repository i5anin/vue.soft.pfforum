<template>
  <v-container>
    <!-- <v-btn color="blue" @click="onAddTool">Добавить</v-btn>-->
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
import HistoryDamagedModal from './Modal.vue'
import { damagedHistoryApi } from '../api/damaged'

export default {
  components: {
    EditToolModal: HistoryDamagedModal,
    VDataTableServer,
  },

  data() {
    return {
      openDialog: false,
      filters: {
        itemsPerPage: 15,
        currentPage: 1,
      },
      isLoading: false,
      showModal: false,
      toolsHistory: [],
      editingToolId: null,
      totalCount: 0,
      headers: [
        { title: 'Название инструмента', value: 'tool_name', sortable: false },
        { title: 'ФИО', value: 'fio', sortable: false },
        { title: 'CNC название', value: 'cnc_name', sortable: false },
        { title: 'Комментарий', value: 'comment', sortable: false },
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
    onAddTool() {
      this.editingToolId = null
      this.openDialog = true
    },

    async fetchAndFormatToolHistory() {
      const response = await damagedHistoryApi.fetchDamagedHistory(
        '',
        this.filters.currentPage,
        this.filters.itemsPerPage
      )
      this.toolsHistory = response.toolsHistory.map((tool) => ({
        ...tool,
        date: tool.date ? this.formatDate(tool.date) : null,
      }))
      this.totalCount = this.toolsHistory.length
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
