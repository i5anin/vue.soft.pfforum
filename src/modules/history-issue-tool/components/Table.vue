<template>
  <v-container>
    <edit-tool-modal
      v-if="openDialog"
      :persistent="true"
      :id_part="editingToolId"
      @canceled="onClosePopup"
      @changes-saved="onSaveChanges"
    />
    <div class="d-flex align-center justify-center">
      <v-row class="fill-height">
        <v-col cols="12" md="5" class="d-flex align-center">
          <v-text-field
            variant="outlined"
            clearable="true"
            v-model="searchQuery"
            label="Поиск по партии, названию, обозначению"
            class="flex-grow-1 mr-2"
            @input="debouncedFetchAndFormatToolHistory"
          />
          <!--          <v-btn @click="fetchAndFormatToolHistory">Поиск</v-btn>-->
        </v-col>
      </v-row>
    </div>

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
    >
      <template v-slot:item.check="{ item }">
        <span
          v-if="item.quantity_prod_all <= item.quantity_prod"
          class="mdi mdi-check-circle-outline check-icon--large"
        ></span>
      </template>
    </v-data-table-server>
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
      debouncedFetchAndFormatToolHistory: null,
      searchQuery: '',
      openDialog: false,
      filters: { itemsPerPage: 15, currentPage: 1 },
      isLoading: false,
      showModal: false,
      toolsHistory: [],
      editingToolId: null,
      totalCount: 0,
      headers: [
        { title: '', value: 'check', sortable: false },
        { title: 'ID партии', value: 'id_part', sortable: false },
        { title: 'Название', value: 'name', sortable: false, width: '300px' },
        { title: 'Обозначение', value: 'description', sortable: false },
        {
          title: 'Дата первой выдачи',
          value: 'timestamp',
          sortable: false,
        },
        {
          title: 'Выданного инструмента',
          value: 'quantity_tool',
          sortable: false,
          width: '80px',
        },
        {
          title: 'Произведенной продукции',
          value: 'quantity_prod',
          sortable: false,
          width: '80px',
        },
        {
          title: 'Продукции в плане (+брак)',
          value: 'quantity_prod_all',
          sortable: false,
          width: '80px',
        },
        { title: 'Операций', value: 'operation_count', sortable: false },
      ],
    }
  },
  async mounted() {
    await this.fetchAndFormatToolHistory()
  },
  watch: {
    searchQuery(newQuery, oldQuery) {
      if (newQuery !== oldQuery) this.debouncedFetchAndFormatToolHistory()
    },
  },
  created() {
    this.debouncedFetchAndFormatToolHistory = this.debounce(
      () => this.fetchAndFormatToolHistory(),
      500
    )
  },
  methods: {
    debounce(func, wait) {
      let timeout
      return function (...args) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          func.apply(this, args)
        }, wait)
      }
    },

    async onChangePage(page) {
      this.filters.currentPage = page
      await this.fetchAndFormatToolHistory()
    },
    async onUpdateItemsPerPage(itemsPerPage) {
      this.filters.itemsPerPage = itemsPerPage
      await this.fetchAndFormatToolHistory()
    },
    formatDate(timestamp) {
      return format(parseISO(timestamp), 'dd.MM.yyyy')
    },
    async fetchAndFormatToolHistory() {
      this.isLoading = true
      try {
        const response = await issueHistoryApi.fetchToolHistory(
          this.searchQuery,
          this.filters.currentPage,
          this.filters.itemsPerPage
        )
        this.toolsHistory = response.toolsHistory.map((tool) => ({
          ...tool,
          timestamp: this.formatDate(tool.timestamp),
        }))
        this.totalCount = response.totalCount
      } catch (error) {
        // Обработка ошибок запроса
        console.error('Ошибка при получении истории инструментов:', error)
        this.$emit('error', error) // Можно испустить событие для обработки ошибок
      } finally {
        this.isLoading = false
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
.check-icon--green {
  color: green;
}

.check-icon--large {
  font-size: 24px; /* или любой другой размер, который вам нужен */
  color: green; /* Пример изменения цвета */
}
</style>
