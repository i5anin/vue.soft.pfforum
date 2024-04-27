<template>
  <Modal :title="popupTitle" widthDefault="1250px">
    <v-container>
      <v-data-table
        :headers="headers"
        :items="movementData"
        :items-per-page="5"
        class="elevation-1"
        hover
      >
        <template v-slot:item="{ item }">
          <tr>
            <td>{{ item.index }}</td>
            <td>{{ item.tool_name }}</td>
            <td>{{ item.datetime_log }}</td>
            <td>{{ item.message }}</td>
            <td>{{ item.old_amount ?? 'Н/Д' }}</td>
            <td>{{ item.new_amount }}</td>
            <td>{{ item.difference }}</td>
            <td>{{ item.user_login || 'Неизвестно' }}</td>
          </tr>
        </template>
        <template v-slot:no-data>
          <v-alert :value="true" color="error" icon="mdi-alert">
            Нет данных для отображения
          </v-alert>
        </template>
      </v-data-table>
    </v-container>
  </Modal>
</template>

<script>
import Modal from '@/modules/shared/components/Modal.vue'
import { editorToolApi } from '../api/view'

export default {
  components: {
    Modal,
  },
  data() {
    return {
      movementData: [],
      headers: [
        { text: '№', value: 'index' },
        { text: 'Инструмент', value: 'tool_name' },
        { text: 'Дата и Время', value: 'datetime_log' },
        { text: 'Комментарий', value: 'message' },
        { text: 'Было', value: 'old_amount' },
        { text: 'Стало', value: 'new_amount' },
        { text: 'Изменение', value: 'difference' },
        { text: 'Пользователь', value: 'user_login' },
      ],
      popupTitle: 'Данные о движении инструмента',
    }
  },
  async created() {
    await this.fetchMovementData()
  },
  methods: {
    async fetchMovementData() {
      // Предполагая, что Id корректно получен где-то в вашем компоненте
      const Id = this.toolId
      const response = await editorToolApi.getToolMovementById(Id)

      // Процесс ответа API и добавление поля difference (если 'old_amount' не предоставлен, считается равным 0)
      this.movementData = response.map((item, index) => ({
        ...item,
        index: index + 1,
        datetime_log: new Date(item.datetime_log).toLocaleString(),
        difference: item.new_amount - (item.old_amount ?? 0),
      }))
    },
  },
  props: {
    toolId: Number, // Принимаем идентификатор инструмента в качестве пропа
  },
}
</script>
