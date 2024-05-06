<template>
  <div>
    <div v-for="(group, index) in toolGroups" :key="index" class="tool-group">
      <v-chip variant="text" size="large" @click="toggleVisibility(index)">
        <template v-slot:prepend>
          <v-icon icon="mdi-folder" start />
        </template>
        {{ group.path }}
      </v-chip>
      <v-chip variant="flat" color="red">{{ group.tools.length }}</v-chip>
      <div v-if="visibleGroups.includes(index)">
        <v-table dense>
          <thead>
            <tr>
              <th class="text-left">#</th>
              <th class="text-left">Название</th>
              <th class="text-left">Кол-во</th>
              <th class="text-left">Дата начала</th>
              <th class="text-left">Дата конец</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tool, toolIndex) in group.tools" :key="toolIndex">
              <td class="grey">{{ toolIndex + 1 }}</td>
              <td>{{ tool.name }}</td>
              <td>{{ tool.quantity }}</td>
              <td class="grey">{{ formatDate(tool.date_start) }}</td>
              <td class="grey">{{ formatDate(tool.date_end) }}</td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </div>
  </div>
</template>

<script>
import { reportApi } from '../api/report'
import { format, parseISO } from 'date-fns' // Импортируем API

export default {
  data() {
    return {
      toolGroups: [],
      visibleGroups: [],
    }
  },
  mounted() {
    this.fetchZakazData()
  },
  methods: {
    formatDate(date) {
      return format(parseISO(date), 'dd.MM.yyyy HH:mm') // Формат dd.MM.yyyy, например, 06.05.2024
    },
    async fetchZakazData() {
      try {
        this.toolGroups = await reportApi.getBuchWeek() // Убедитесь, что это правильный путь к данным в вашем API
      } catch (error) {
        console.error('Ошибка при получении данных: ', error)
        // Здесь можно добавить обработку ошибок, например, отображение сообщения пользователю
      }
    },
    toggleVisibility(index) {
      const visibleIndex = this.visibleGroups.indexOf(index)
      if (visibleIndex === -1) {
        this.visibleGroups.push(index)
      } else {
        this.visibleGroups.splice(visibleIndex, 1)
      }
    },
  },
}
</script>

<style>
.grey {
  color: grey;
}

.tool-group + .tool-group {
  margin-top: 10px;
}
</style>
