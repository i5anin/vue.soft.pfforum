<template>
  <v-container>
    <v-data-table
      v-if="toolHistory.length > 0"
      :headers="headers"
      :items="toolHistory"
      class="elevation-1"
      hover
    >
      <template v-slot:item="{ item }">
        <tr>
          <td>{{ item.specs_op_id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.description }}</td>
          <td>{{ item.no_oper }}</td>
          <td>{{ item.type_oper }}</td>
          <td>{{ item.quantity }}</td>
          <td>{{ item.user_fio }}</td>
          <td>{{ formatDate(item.date_p) }}</td>
          <td>{{ formatDate(item.date_u) }}</td>
          <td>{{ item.name_tool }}</td>
          <td v-if="item.property">
            <div v-for="(value, key) in item.property" :key="key">
              {{ key }}: {{ value }}
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import { fetchToolHistory } from '@/api' // Убедитесь, что путь к файлу API корректен

export default {
  data() {
    return {
      item: [],
      toolHistory: [], // Данные истории инструментов
      headers: [
        // Заголовки для таблицы
        { text: 'ID Операции', value: 'specs_op_id' },
        { text: 'Название', value: 'name' },
        { text: 'Описание', value: 'description' },
        { text: 'Номер операции', value: 'no_oper' },
        { text: 'Тип операции', value: 'type_oper' },
        { text: 'Количество', value: 'quantity' },
        { text: 'Кому выдана', value: 'user_fio' },
        { text: 'Дата получения', value: 'date_p' },
        { text: 'Дата возврата', value: 'date_u' },
        { text: 'Инструмент', value: 'name_tool' },
        { text: 'Свойства', value: 'property' },
      ],
    }
  },
  async mounted() {
    this.toolHistory = await fetchToolHistory()
    console.log(this.toolHistory)
  },
  methods: {
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString()
    },
  },
}
</script>
