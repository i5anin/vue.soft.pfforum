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
      hover
      fixed-header
      width="true"
      class="scrollable-table"
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
        {
          title: 'Название инструмента',
          value: 'tool_name',
          sortable: false,
          width: '280px',
        },
        { title: 'ФИО', value: 'user_name', sortable: false, width: '150px' },
        {
          title: 'CNC название',
          value: 'cnc_name',
          sortable: false,
          width: '150px',
        },
        { title: 'Комментарий', value: 'comment', sortable: false },
        { title: 'Кол-во', key: 'quantity', sortable: false, width: '80px' },
        { title: 'Дата', key: 'timestamp', sortable: false, width: '150px' },
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
      return format(parseISO(date), 'dd.MM.yyyy hh:mm')
    },
    onAddTool() {
      this.editingToolId = null
      this.openDialog = true
    },

    async fetchAndFormatToolHistory() {
      try {
        const response = await damagedHistoryApi.fetchDamagedHistory(
          '',
          this.filters.currentPage,
          this.filters.itemsPerPage
        )
        this.toolsHistory = response.toolsHistory.map((tool) => ({
          ...tool,
          timestamp: tool.timestamp ? this.formatDate(tool.timestamp) : null,
        }))
        this.totalCount = response.totalCount
      } catch (error) {
        console.error('Error fetching tool history:', error)
      }
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

<style>
.scrollable-table {
  height: 74vh; /* Замените это значение на желаемую высоту */
  overflow-y: auto;
}
</style>
