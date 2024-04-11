<template>
  <Modal :title="popupTitle" widthDefault="1450px">
    <template #content>
      <div style="padding-left: 16px">
        <v-row>
          <h2 v-if="this.info" style="padding-left: 25px">
            {{ this?.info.name }} {{ this?.info.description }}
            <!-- todo: this?.info.name не отображается -->
          </h2>
          <v-spacer />
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
      </div>
      <v-table class="elevation-1">
        <thead>
          <tr>
            <th
              v-for="header in currentHeaders"
              :key="header.value"
              class="text-left"
            >
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
            <td v-for="header in currentHeaders" :key="header.value">
              <template v-if="header.value === 'cancelled'">
                <v-btn small color="error" @click="cancelOperation(item.id)">
                  Отменить выдачу
                </v-btn>
              </template>
              <template v-if="header.value === 'timestamp'">
                {{ formatDate(item[header.value]) }}
              </template>
              <template
                v-else-if="
                  header.value === 'no_oper' || header.value === 'type_oper'
                "
              >
                <v-chip small color="lighten-4">
                  {{ item[header.value] }}
                </v-chip>
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
import Modal from '@/modules/shared/components/Modal.vue'
import { issueHistoryApi } from '../api/history'
// import { issueHistoryApi } from '../api/cancel'
import { format, parseISO } from 'date-fns'

export default {
  name: 'HistoryModal',
  components: { Modal },
  props: {
    id_part: { type: Number, default: null },
    selected_date: { type: String, default: '' },
  },
  data() {
    return {
      info: null,
      originalData: [],
      selectedOperation: 'all',
      availableOperations: [],
      headers: [
        { title: 'Инструмент', value: 'name_tool' },
        { title: 'Кол-во', value: 'quantity', width: '90px' },
        { title: 'Выдано', value: 'user_fio' },
        { title: 'Тип выдачи', value: 'type_issue' },
        { title: 'Дата время', value: 'timestamp' },
        // { title: 'Операция', value: 'no_oper' },
        { title: 'Тип', value: 'type_oper' },
        // { title: 'Комментарий', value: 'comment' },
        { title: 'Выдал', value: 'issuer_fio' },
        { title: 'Отмена', value: 'cancelled' },
      ],
      headersAll: [
        { title: 'Инструмент', value: 'name_tool' },
        { title: 'Дата первой выдачи', value: 'timestamp' },
        { title: 'Кол-во', value: 'quantity', width: '90px' },
      ],
      filteredData: [],
      showOperationModal: false,
      currentNoOper: null,
    }
  },
  computed: {
    popupTitle() {
      // console.log('вызов popupTitle')
      if (this.info) {
        return `Инструмент затраченный на партию: ${this.id_part} `
        // ${this.selected_date}
      }
    },
    currentHeaders() {
      if (this.selectedOperation === 'all') {
        return this.headersAll
      } else {
        return this.headers
      }
    },
  },
  methods: {
    async cancelOperation(operationId) {
      if (!confirm('Вы уверены, что хотите отменить эту операцию?')) return

      const token = localStorage.getItem('token')
      if (!token) {
        console.error('Token is not found in local storage.')
        alert('Ошибка авторизации: Токен не найден.')
        return
      }

      try {
        const response = await issueHistoryApi.cancelOperation(
          operationId,
          token
        )
        if (response.success) {
          this.$emit('operation-cancelled', operationId) // Эмитируем событие для обновления таблицы или UI
          await this.fetchHistoryData() // Перезагружаем данные, чтобы отразить изменения
        } else {
          alert('Не удалось отменить операцию: ' + response.message)
        }
      } catch (error) {
        console.error('Ошибка при отмене операции:', error)
        alert('Ошибка при отмене операции: ' + error.message)
      }
    },
    filterData() {
      this.filteredData =
        this.selectedOperation === 'all'
          ? this.originalData['all'] || []
          : this.originalData[this.selectedOperation] || []
    },
    formatDate(date) {
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
      console.log(this.selected_date)
      try {
        const response = await issueHistoryApi.fetchHistoryByPartId(
          this.id_part,
          this.selected_date
        )
        this.info = response.info
        if (response && typeof response === 'object') {
          // Removing the 'info' key from the response object
          const { info, ...operations } = response
          this.originalData = operations
          this.filteredData = operations['all'] || []
          this.availableOperations = Object.keys(operations)
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
