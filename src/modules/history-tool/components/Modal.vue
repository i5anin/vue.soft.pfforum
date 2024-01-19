<template>
  <Modal :title="popupTitle" widthDefault="1300px">
    <template #content>
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
import OperationModal from './OperationModal.vue' // Импортируйте вторую модалку

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
    formatDate(date) {
      if (date) return format(parseISO(date), 'dd.MM.yyyy HH:mm:ss')
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
      this.historyData = await detailHistoryApi.fetchHistoryByPartId(
        this.id_part
      )
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
