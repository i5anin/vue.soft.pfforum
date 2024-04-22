<template>
  <Modal :title="popupTitle" widthDefault="1450px">
    <template #content>
      <div style="padding-left: 16px">
        <v-row>
          <div>
            <h2 v-if="info" class="text-h5 ml-3 py-4">
              {{ info.name }} - {{ info.description }}
            </h2>
            <v-col cols="12" class="my-2">
              <div>
                Прогресс:
                <v-chip
                  v-for="item in operations"
                  :key="item + 'progress'"
                  :color="completedOperations.includes(item) ? 'green' : 'grey'"
                  :variant="
                    completedOperations.includes(item) ? 'elevated' : 'text'
                  "
                  class="ma-2"
                  outlined
                >
                  {{ item }}
                </v-chip>
              </div>
            </v-col>
          </div>
          <v-spacer />
          <v-col v-if="this.selectedOperation !== 'all'" cols="12" md="2">
            <v-text-field
              label="Количество для отмены"
              v-model="cancelQuantity"
              type="number"
              min="1"
              :max="selectedOperationQuantity"
              solo
            />
            <!--todo: selectedOperationQuantity  предполагается, что вы каким-то образом знаете максимальное количество-->
          </v-col>
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
      <v-table hover class="elevation-1">
        <thead>
          <tr>
            <th>#</th>
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
            v-for="(item, index) in filteredData"
            :key="item.id"
            :class="{ 'bg-blue-darken-2': item.type === 'sum' }"
          >
            <td class="grey">{{ index + 1 }}</td>
            <td v-for="header in currentHeaders" :key="header.value">
              <template v-if="header.value === 'cancelled'">
                <template v-if="item.cancelled">
                  {{ item.canceller_login }}
                </template>
                <template v-else>
                  <v-btn
                    icon
                    small
                    :disabled="
                      new Date() - new Date(item.timestamp) > 432000000
                    "
                    @click.stop="cancelOperation(item.id)"
                    color="error"
                  >
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </template>
              </template>
              <template v-else-if="header.value === 'timestamp'">
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
import Modal from '@/modules/shared/components/Modal.vue'
import { issueHistoryApi } from '../api/history'
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
      cancelQuantity: 1,
      selectedOperationQuantity: 100,
      operations: [],
      completedOperations: [],
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
        { title: 'Тип', value: 'type_oper' },
        { title: 'Выдал', value: 'issuer_fio' },
        { title: 'Отмена', value: 'cancelled' },
      ],
      filteredData: [],
    }
  },
  computed: {
    popupTitle() {
      return this.info
        ? `Инструмент затраченный на партию: ${this.id_part}`
        : 'Информация о партии'
    },
    currentHeaders() {
      return this.selectedOperation === 'all' ? this.headersAll : this.headers
    },
    headersAll() {
      return [
        { title: 'Инструмент', value: 'name_tool' },
        { title: 'Дата первой выдачи', value: 'timestamp' },
        { title: 'Кол-во', value: 'quantity', width: '90px' },
      ]
    },
  },
  watch: {
    selectedOperation: {
      immediate: true,
      handler() {
        this.filterData()
      },
    },
  },
  methods: {
    async cancelOperation(operationId) {
      if (!operationId) {
        console.error('Invalid operation ID:', operationId)
        alert('Internal error: The operation ID is invalid.')
        return
      }

      // Проверяем, что количество для отмены валидно
      if (
        !this.cancelQuantity ||
        this.cancelQuantity <= 0 ||
        this.cancelQuantity > this.selectedOperationQuantity
      ) {
        alert('Некорректное количество для отмены.')
        return
      }

      // Подтверждение действия пользователем
      if (
        !confirm(
          `Вы уверены, что хотите отменить ${this.cancelQuantity} из этой операции?`
        )
      ) {
        return
      }

      const token = localStorage.getItem('token')
      if (!token) {
        console.error('Token not found in local storage.')
        alert('Ошибка авторизации: Токен не найден.')
        return
      }

      try {
        const response = await issueHistoryApi.cancelOperation(
          operationId,
          token,
          this.cancelQuantity // Передаём количество для отмены в API вызов
        )

        if (response.success) {
          // Обновляем данные в интерфейсе
          const item = this.filteredData.find((x) => x.id === operationId)
          if (item) {
            item.cancelled = true
            item.canceller_login = response.canceller_login // Предполагается, что ответ включает логин отменившего
          }
          alert('Операция успешно отменена')
          this.$emit('operation-cancelled', operationId)
        } else {
          alert('Не удалось отменить операцию: ' + response.message)
        }
      } catch (error) {
        console.error('Ошибка при отмене операции:', error)
        alert('Ошибка при отмене операции: ' + error.message)
      }
    },

    filterData() {
      if (this.selectedOperation === 'all') {
        this.filteredData = this.originalData['all'] || []
      } else {
        this.filteredData = this.originalData[this.selectedOperation] || []
      }
    },
    formatDate(date) {
      try {
        return format(parseISO(date), 'dd.MM.yyyy HH:mm:ss')
      } catch (error) {
        console.error('Error formatting date:', error)
        return 'Invalid Date'
      }
    },
    onCancel() {
      this.$emit('canceled')
    },
    async fetchHistoryData() {
      try {
        const response = await issueHistoryApi.fetchHistoryByPartId(
          this.id_part,
          this.selected_date
        )
        const partInfoResponse = await issueHistoryApi.fetchHistoryByPartIdInfo(
          this.id_part
        )

        this.operations = partInfoResponse.info.operations
        this.completedOperations = partInfoResponse.info.completed_operations

        if (response && typeof response === 'object') {
          this.info = response.info
          this.originalData = response
          this.availableOperations = Object.keys(this.originalData).filter(
            (key) => key !== 'info'
          )
          this.filterData()
        } else {
          console.log('No history data found')
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
