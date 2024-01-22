<template>
  <Modal :title="popupTitle" widthDefault="1300px">
    <template #content>
      <v-row>
        <v-col cols="12" md="3">
          <v-select
            label="Операция"
            v-model="selectedOperation"
            :items="availableOperations"
            @update:model-value="filterData"
            solo
          />
        </v-col>
      </v-row>
      <v-table class="elevation-1">
        <thead>
          <tr>
            <th v-for="header in headers" :key="header.value" class="text-left">
              {{ header.title }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in historyData"
            :key="item.id"
            :class="{ 'bg-blue-darken-2': item.type === 'sum' }"
            @click="openOperationModal(item.no_oper)"
          >
            <td v-for="header in headers" :key="header.value">
              <template v-if="header.value === 'date'">
                {{ formatDate(item[header.value]) }}
              </template>
              <template v-else>
                {{ item[header.value] }}
              </template>
            </td>
          </tr>
        </tbody>
      </v-table>
    </template>
    <template #action>
      <v-btn
        color="red darken-1"
        variant="text"
        @click="onCancel"
        class="text-none text-subtitle-1 ml-3"
      >
        Закрыть
      </v-btn>
    </template>
  </Modal>
</template>

<script>
import Modal from '@/components/shared/Modal.vue'
import { detailHistoryApi } from '../api/history'
import { format, parseISO } from 'date-fns'
import OperationModal from './OperationModal.vue'

export default {
  name: 'ToolModal',
  components: {
    Modal,
    OperationModal, // Добавьте вторую модалку в компоненты
  },
  props: {
    id_part: { type: Number, default: null },
  },
  data() {
    return {
      originalData: [],
      selectedOperation: 'all',
      availableOperations: [],
      headers: [
        { title: 'Инструмент', value: 'name_tool' },
        { title: 'Инструмент', value: 'name_tool' },
        { title: 'Кол-во', value: 'quantity', width: '90px' },
        { title: 'Дата', value: 'date' },
        { title: 'Операция', value: 'no_oper' },
      ],
      historyData: [],
      showOperationModal: false,
      currentNoOper: null,
    }
  },
  computed: {
    popupTitle() {
      return `Инструмент затраченный на операцию: ${this.id_part}`
    },
  },
  methods: {
    filterData() {
      console.log('filterData')
      console.log(this.selectedOperation)
      if (this.selectedOperation === 'all') {
        this.aggregateData()
      } else {
        this.historyData = this.originalData.filter(
          (item) => item.no_oper === this.selectedOperation
        )
      }
    },

    aggregateData() {
      const aggregatedData = []

      this.originalData.forEach((item) => {
        const existingOperation = aggregatedData.find(
          (op) => op.no_oper === item.no_oper
        )

        if (existingOperation) {
          existingOperation.quantity += item.quantity
        } else {
          aggregatedData.push({ ...item })
        }
      })
      console.log(this.historyData)
      this.historyData = aggregatedData
    },
    formatDate(date) {
      console.log('date=', date)
      // Регулярное выражение для проверки формата ISO даты
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/

      if (!isoDateRegex.test(date)) {
        // Если дата не соответствует формату ISO, возвращаем её как есть
        console.log('Date already formatted:', date)
        return date
      }

      try {
        return format(parseISO(date), 'dd.MM.yyyy HH:mm:ss')
      } catch (error) {
        console.error('Error formatting date:', error, 'Date:', date)
        return 'Invalid Date'
      }
    },
    onCancel() {
      this.$emit('canceled')
    },
    openOperationModal(no_oper) {
      this.currentNoOper = no_oper
      this.showOperationModal = true
    },
    closeOperationModal() {
      this.showOperationModal = false
    },
    async fetchHistoryData() {
      try {
        const response = await detailHistoryApi.fetchHistoryByPartId(
          this.id_part
        )
        if (Array.isArray(response) && response.length > 0) {
          const formattedData = response.map((tool) => ({
            ...tool,
            date:
              typeof tool.date === 'string'
                ? this.formatDate(tool.date)
                : tool.date,
          }))
          this.historyData = formattedData
          this.availableOperations = [
            'all',
            ...new Set(formattedData.map((item) => item.no_oper)),
          ]
        } else {
          console.log('No history data found')
          this.historyData = []
          this.availableOperations = ['all']
        }
      } catch (error) {
        console.error('Error fetching history data:', error)
      }
    },
  },
  created() {
    this.fetchHistoryData()
  },
}
</script>

<style>
.sum {
  background-color: #a41111; /* Или другой оттенок красного, который вам нужен */
  color: white; /* Опционально, для лучшей читаемости текста */
}
</style>
