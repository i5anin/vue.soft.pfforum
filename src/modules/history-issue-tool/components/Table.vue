<template>
  <v-container>
    <edit-tool-modal
      v-if="openDialog"
      :persistent="true"
      :id_part="editingToolId"
      :selected_date="selectedDate"
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
          <v-select
            :items="dateOptions"
            item-value="value"
            item-title="title"
            v-model="selectedDate"
            label="Выберите дату"
            @update:model-value="fetchAndFormatToolHistory"
          />
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
    console.log(this.dateOptions)
    console.log(JSON.parse(JSON.stringify(this.dateOptions)))
    this.debouncedFetchAndFormatToolHistory = this.debounce(
      this.fetchAndFormatToolHistory,
      500
    )
  },
  methods: {
    generateDateOptions() {
      const options = [{ value: '', title: 'ВСЕ' }]
      const baseDate = new Date()
      baseDate.setHours(0, 0, 0, 0) // Установка времени на начало дня (полночь), чтобы избежать проблем с временными зонами

      for (let i = 0; i < 10; i++) {
        const date = new Date(baseDate)
        date.setDate(baseDate.getDate() - i) // Вычитаем дни для создания истории дат
        // Подготовка даты с учетом смещения временной зоны на +3 часа (переводим в UTC)
        const offsetDate = new Date(date.getTime() + 180 * 60000) // Прибавляем 180 минут (3 часа * 60 минут)
        const isoDate = offsetDate.toISOString().substring(0, 10)
        const formattedDate = offsetDate.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
        const suffix = i === 0 ? ' - СЕГОДНЯ' : i === 1 ? ' - ВЧЕРА' : ''
        options.push({ value: isoDate, title: `${formattedDate}${suffix}` })
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
      console.log('Current date being sent:', this.selectedDate) // Updated to use selectedDate
      try {
        const response = await issueHistoryApi.fetchToolHistory(
          this.searchQuery,
          this.filters.currentPage,
          this.filters.itemsPerPage,
          this.selectedDate // Use the selectedDate variable here
        )
        this.toolsHistory = response.toolsHistory.map((tool) => ({
          ...tool,
          first_issue_date: this.formatDate(tool.first_issue_date),
        }))
        this.totalCount = response.totalCount
      } catch (error) {
        console.error('Ошибка при получении истории инструментов:', error)
        this.$emit('error', error) // Handling errors
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
