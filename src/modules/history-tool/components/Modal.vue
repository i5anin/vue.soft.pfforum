<template>
  <Modal :title="popupTitle">
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
              {{ item[header.value] }}
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

export default {
  name: 'ToolModal',
  emits: ['canceled'],
  components: {
    Modal,
  },
  props: {
    persistent: { type: Boolean, default: false },
    specs_op_id: { type: Number, default: null },
  },
  data() {
    return {
      headers: [
        { title: 'Операция', value: 'specs_op_id' },
        { title: 'ID', value: 'id' },
        { title: 'Название', value: 'name' },
        { title: 'Обозначение', value: 'description' },
        { title: 'Номер операции', value: 'no_oper' },
        { title: 'Тип операции', value: 'type_oper' },
        { title: 'Кол-во', value: 'quantity' },
        { title: 'ФИО', value: 'user_fio' },
        { title: 'Дата', value: 'date' },
        { title: 'Инструмент', value: 'name_tool' },
      ],
      historyData: [], // Данные для таблицы
    }
  },
  computed: {
    popupTitle() {
      return `Инструмент затраченный на операцию: ${this.specs_op_id}`
    },
  },
  methods: {
    onCancel() {
      this.$emit('canceled')
    },
    async fetchHistoryData() {
      try {
        this.historyData = await detailApi.historyToolById(this.specs_op_id)
        console.log(this.historyData)
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error)
      }
    },
  },
  created() {
    this.fetchHistoryData()
  },
}
</script>
