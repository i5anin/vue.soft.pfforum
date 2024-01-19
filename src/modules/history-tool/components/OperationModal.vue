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
            v-for="(items, no_oper) in groupedHistoryData"
            :key="no_oper"
            @click="openOperationModal(no_oper)"
          >
            <td v-for="item in items" :key="item.id">
              <template v-if="header.value === 'date'">
                {{ formatDate(item.date) }}
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
      headers: [
        { title: 'Инструмент', value: 'name_tool' },
        { title: 'Кол-во', value: 'quantity', width: '90px' },
        { title: 'Дата', value: 'date' },
        { title: 'Операция', value: 'no_oper' },
      ],
      historyData: [],
      groupedHistoryData: {},
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
    groupByNoOper(data) {
      return data.reduce((acc, item) => {
        const key = item.no_oper
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(item)
        return acc
      }, {})
    },
    async fetchHistoryData() {
      const data = await detailHistoryApi.fetchHistoryByPartId(this.id_part)
      this.historyData = data
      this.groupedHistoryData = this.groupByNoOper(data)
    },
  },
  created() {
    this.fetchHistoryData()
  },
}
</script>

<style>
.sum {
  background-color: #a41111;
  color: white;
}
</style>
