<template>
  <v-container>
    <edit-tool-modal
      v-if="openDialog"
      :persistent="true"
      :id_part="editingToolId"
      :selected_date="selectedDate"
      :selected_tool="selectedTool"
      @canceled="onClosePopup"
      @changes-saved="fetchAndFormatToolHistory"
      @close="onClosePopup"
    />
    <div class="d-flex align-center justify-center">
      <v-row class="fill-height">
        <v-col cols="12" md="4" class="d-flex align-center">
          <v-text-field
            variant="outlined"
            clearable
            v-model="searchQuery"
            label="Поиск по партии, названию, обозначению"
            class="flex-grow-1 mr-2"
            @input="debouncedFetchAndFormatToolHistory"
            prepend-inner-icon="mdi-magnify"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-combobox
            clearable
            :items="toolOptions"
            item-value="id_tool"
            item-title="name"
            v-model="selectedTool"
            label="Выберите инструмент"
            @update:model-value="fetchAndFormatToolHistory"
            prepend-inner-icon="mdi-box-cutter"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            :items="dateOptions"
            item-value="value"
            item-title="title"
            v-model="selectedDate"
            label="Выберите дату"
            @update:model-value="fetchAndFormatToolHistory"
            prepend-inner-icon="mdi-calendar"
          />
        </v-col>
      </v-row>
    </div>

    <v-data-table-server
      class="scrollable-table"
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
          v-if="item.is_archive"
          class="mdi mdi-archive check-icon--large--gray"
          title="В архиве"
        />
        <span
          v-else-if="
            item.status_otgruzka && item.ready_count < item.operation_count
          "
          class="mdi mdi-help check-icon--large--red"
          title="Отгружено, не все операции завершены, не в производстве"
        />
        <span
          v-else-if="item.status_otgruzka"
          class="mdi mdi-truck-check check-icon--large--green"
          title="Отгружено"
        />
        <span
          v-else-if="
            item.quantity_prod >= item.quantity_prod_all && item.status_ready
          "
          class="mdi mdi-check check-icon--large--green"
          title="Произведено"
        />
        <span
          v-else-if="item.status_ready"
          class="mdi mdi-stop check-icon--large--yellow"
          title="Не в производстве"
        />
      </template>
      <template v-slot:item.operation_status="{ item }">
        {{ item.ready_count }} / {{ item.operation_count }}
      </template>
      <template v-slot:item.quantity_prod_all="{ item }">
        {{ item.quantity_prod }} / {{ item.quantity_prod_all }}
      </template>
    </v-data-table-server>
  </v-container>
</template>

<script>
import { VDataTableServer } from 'vuetify/labs/components'
import { format, parseISO } from 'date-fns'
import EditToolModal from './Modal.vue'
import { issueHistoryApi } from '@/modules/history-issue/api/history'

export default {
  components: { EditToolModal, VDataTableServer },
  data() {
    return {
      toolOptions: [],
      selectedTool: null,
      searchQuery: '',
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
          title: 'Готовность операций',
          value: 'operation_status',
          sortable: false,
        }, // Новый столбец
        {
          title: 'Произведено / План',
          value: 'quantity_prod_all',
          sortable: false,
          width: '180px',
        },
      ],
    }
  },
  async mounted() {
    this.toolOptions = await issueHistoryApi.getAllIssuedToolIdsWithNames()
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
      const options = [{ value: '', title: 'ВСЕ' }]
      const baseDate = new Date()
      baseDate.setHours(0, 0, 0, 0)
      // Установка времени на начало дня (полночь), чтобы избежать проблем с временными зонами

      for (let i = 0; i < 30; i++) {
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
      console.log('fetchAndFormatToolHistory')
      this.isLoading = true

      try {
        let response = await issueHistoryApi.fetchToolHistory(
          this.searchQuery,
          this.filters.currentPage,
          this.filters.itemsPerPage,
          this.selectedDate ? this.selectedDate : null,
          this.selectedTool ? this.selectedTool.id_tool : null
        )

        console.log(response)

        this.toolsHistory = response.toolsHistory.map((tool) => ({
          ...tool,
          first_issue_date: this.formatDate(tool.first_issue_date),
        }))
        this.totalCount = response.totalCount
      } catch (error) {
        console.error('Ошибка при получении истории инструментов:', error)
        this.$emit('error', error)
      } finally {
        this.isLoading = false
      }
    },
    onClosePopup() {
      this.openDialog = false
      this.fetchAndFormatToolHistory()
    },
    onInfoRow(_, { item: tool }) {
      this.editingToolId = tool.id_part
      this.openDialog = true
    },
    onSaveChanges() {
      this.fetchAndFormatToolHistory()
      this.openDialog = false
    },
  },
}
</script>

<style>
.scrollable-table {
  height: 74vh; /* Замените это значение на желаемую высоту */
  overflow-y: auto;
}

.check-icon--large--yellow {
  font-size: 16px; /* или любой другой размер, который вам нужен */
  color: #cfcf00; /* Пример изменения цвета */
}

.check-icon--large--green {
  font-size: 24px; /* или любой другой размер, который вам нужен */
  color: #009500; /* Пример изменения цвета */
}

.check-icon--large--red {
  font-size: 24px; /* или любой другой размер, который вам нужен */
  color: #950000; /* Пример изменения цвета */
}

.check-icon--large--gray {
  font-size: 24px; /* или любой другой размер, который вам нужен */
  color: #848484; /* Пример синего цвета */
}
</style>
