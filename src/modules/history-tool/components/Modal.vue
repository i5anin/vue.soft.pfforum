<template>
  <Modal :title="popupTitle">
    <template #content>
      <v-data-table :headers="headers" :items="historyData" class="elevation-1">
      </v-data-table>
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
    specs_op_id: { type: Number, default: null }, // Убедитесь, что toolId передаётся правильно
  },
  data() {
    return {
      headers: [
        { title: 'Операция', value: 'specs_op_id', sortable: false },
        { title: 'ID', value: 'id', sortable: false },
        { title: 'Название', value: 'name', sortable: false },
        { title: 'Обозначение', value: 'description', sortable: false },
        { title: 'Номер операции', value: 'no_oper', sortable: false },
        { title: 'Тип операции', value: 'type_oper', sortable: false },
        { title: 'Кол-во', value: 'quantity', sortable: false },
        { title: 'ФИО', value: 'user_fio', sortable: false },
        { title: 'Дата', value: 'date', sortable: false },
        { title: 'Инструмент', value: 'name_tool', sortable: false },
      ],
      historyData: [], // Данные для таблицы
    }
  },
  computed: {
    popupTitle() {
      return 'История инструмента'
    },
  },
  methods: {
    onCancel() {
      this.$emit('canceled')
    },
    async fetchHistoryData() {
      try {
        console.log(this.specs_op_id)
        const data = await detailApi.historyToolById(this.specs_op_id) // Обновлено использование specs_op_id
        this.historyData = data // Обновление данных таблицы
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error)
      }
    },
  },
  created() {
    this.fetchHistoryData() // Загрузите данные при создании компонента
  },
}
</script>

<style>
/* Стили, если нужно */
</style>
