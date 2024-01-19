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
            v-for="item in operationData"
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

export default {
  name: 'OperationModal',
  components: {
    Modal,
  },
  props: {
    no_oper: { type: String, default: null },
  },
  data() {
    return {
      headers: [
        { title: 'Инструмент', value: 'name_tool' },
        { title: 'ФИО', value: 'user_fio' },
        { title: 'Кол-во', value: 'quantity', width: '90px' },
        { title: 'Дата', value: 'date' },
      ],
      operationData: [],
    }
  },
  computed: {
    popupTitle() {
      return `Операция: ${this.no_oper}`
    },
  },
  methods: {
    formatDate(date) {
      if (date) return format(parseISO(date), 'dd.MM.yyyy HH:mm:ss')
    },
    onCancel() {
      this.$emit('canceled')
    },
    async fetchOperationData() {
      this.operationData = await detailHistoryApi.fetchHistoryByOperationId(
        this.no_oper
      )
    },
  },
  created() {
    this.fetchOperationData()
  },
}
</script>

<style>
.sum {
  background-color: #a41111;
  color: white;
}
</style>
