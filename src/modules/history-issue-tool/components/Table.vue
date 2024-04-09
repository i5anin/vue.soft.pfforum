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
        <v-col cols="12" md="4">
          {{ dateOptions }}
          <v-select
            :items="dateOptions"
            item-value="value"
            item-text="text"
            v-model="selectedDate"
            label="Выберите дату"
            @change="fetchAndFormatToolHistory"
          />
        </v-col>
        <v-col cols="12" md="2" class="d-flex align-center">
          <v-btn text @click="resetDate">Сброс</v-btn>
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
          class="mdi mdi-check check-icon--large"
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
      selectedDate: '',
      dateOptions: this.generateDateOptions(),
      date: '',
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
          value: 'first_issue_date',
          sortable: false,
        },
        {
          title: 'Выдано инструмента',
          value: 'quantity_tool',
          sortable: false,
          width: '80px',
        },
        {
          title: 'Произведено продукции',
          value: 'quantity_prod',
          sortable: false,
          width: '80px',
        },
        {
          title: 'План',
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
    this.dateOptions = this.generateDateOptions()
    this.debouncedFetchAndFormatToolHistory = this.debounce(
      this.fetchAndFormatToolHistory,
      500
    )
  },
  methods: {
    generateDateOptions() {
      let options = []
      let today = new Date()
      for (let i = 0; i < 10; i++) {
        let date = new Date(today)
        date.setDate(today.getDate() - i)
        let isoDate = date.toISOString().split('T')[0] // Get date in YYYY-MM-DD format
        let label = date.toLocaleDateString('ru-RU') // Get date in local format, add labels for today and yesterday
        if (i === 0) label += ' - СЕГОДНЯ'
        else if (i === 1) label += ' - ВЧЕРА'
        options.push({ value: isoDate, text: label })
      }
      return options
    },
    resetDate() {
      this.date = '' // Сброс даты
      this.fetchAndFormatToolHistory() // Обновление истории инструментов без фильтрации по дате
    },
    setToday() {
      const today = new Date()
      this.date = this.formatDateISO(today) // Установка даты в нужном формате
      this.fetchAndFormatToolHistory() // Вызов обновления данных
    },
    setYesterday() {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      this.date = this.formatDateISO(yesterday) // Установка даты в нужном формате
      this.fetchAndFormatToolHistory() // Вызов обновления данных
    },
    formatDateISO(date) {
      return date.toISOString().substr(0, 10)
    },
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
    formatDate(date) {
      return format(parseISO(date), 'dd.MM.yyyy')
    },
    async fetchAndFormatToolHistory() {
      this.isLoading = true
      try {
        const response = await issueHistoryApi.fetchToolHistory(
          this.searchQuery,
          this.filters.currentPage,
          this.filters.itemsPerPage,
          this.date // Передаем дату, которая была установлена кнопками Сегодня или Вчера
        )
        this.toolsHistory = response.toolsHistory.map((tool) => ({
          ...tool,
          first_issue_date: this.formatDate(tool.first_issue_date),
        }))
        this.totalCount = response.totalCount
      } catch (error) {
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
