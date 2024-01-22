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
            v-for="item in filteredData"
            :key="item.id"
            :class="{ 'bg-blue-darken-2': item.type === 'sum' }"
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
    OperationModal,
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
        { title: 'Кол-во', value: 'quantity', width: '90px' },
        { title: 'Дата', value: 'date' },
        { title: 'Операция', value: 'no_oper' },
      ],
      filteredData: [],
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
      if (this.selectedOperation === 'all') {
        // Проверяем, является ли originalData.all массивом
        if (Array.isArray(this.originalData['all'])) {
          // Если это массив, копируем его в filteredData
          this.filteredData = [...this.originalData['all']]
        } else {
          // Если это не массив, оборачиваем объект в массив
          this.filteredData = [this.originalData['all']]
        }
      } else {
        // Фильтруем данные по выбранной операции
        this.filteredData = [
          ...(this.originalData[this.selectedOperation] || []),
        ]
      }
    },
    formatDate(date) {
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
      if (!isoDateRegex.test(date)) {
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
    async fetchHistoryData() {
      try {
        const response = await detailHistoryApi.fetchHistoryByPartId(
          this.id_part
        )
        if (response && typeof response === 'object') {
          this.originalData = response
          this.filteredData = response['all'] || []
          this.availableOperations = Object.keys(response)
        } else {
          console.log('No history data found')
          this.originalData = {}
          this.filteredData = []
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
