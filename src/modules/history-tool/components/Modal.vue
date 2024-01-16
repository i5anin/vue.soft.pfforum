<template>
  <Modal :title="popupTitle" widthDefault="800px">
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
          <tr v-for="item in historyData" :key="item.id">
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
import { detailApi } from '../api/history'
import { format, parseISO } from 'date-fns'

export default {
  name: 'ToolModal',
  components: {
    Modal,
  },
  props: {
    specs_op_id: { type: Number, default: null },
  },
  data() {
    return {
      headers: [
        { title: 'Кол-во', value: 'quantity', width: '70px' },
        { title: 'ФИО', value: 'user_fio' },
        { title: 'Дата', value: 'date' },
        { title: 'Инструмент', value: 'name_tool' },
      ],
      historyData: [],
    }
  },
  computed: {
    popupTitle() {
      return `Инструмент затраченный на операцию: ${this.specs_op_id}`
    },
  },
  methods: {
    formatDate(date) {
      return format(parseISO(date), 'dd.MM.yyyy HH:mm:ss')
    },
    onCancel() {
      this.$emit('canceled')
    },
    async fetchHistoryData() {
      this.historyData = await detailApi.historyToolById(this.specs_op_id)
    },
  },
  created() {
    this.fetchHistoryData()
  },
}
</script>

<style>
/* Add your CSS styles if needed */
</style>
