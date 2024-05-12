<template>
  <date-picker
    locale="ru"
    label="Start Date"
    v-model="startDate"
    color="primary"
  ></date-picker>
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
              <th class="text-left">Заказ</th>
              <th class="text-left">Склад</th>
              <th class="text-left">Норма</th>
              <th class="text-left">Повреждено за 7 дней</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tool, toolIndex) in group.tools" :key="toolIndex">
              <td class="grey">{{ toolIndex + 1 }}</td>
              <td>{{ tool.name }}</td>
              <td>{{ tool.zakaz }}</td>
              <td class="grey">{{ tool.sklad }}</td>
              <td class="grey">{{ tool.norma }}</td>
              <td class="grey">{{ tool.damaged_last_7_days }}</td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </div>
  </div>
</template>

<script>
import { reportApi } from '../api/report'
import DatePicker from '@/modules/test/components/DatePicker.vue' // Импортируем API

export default {
  components: { DatePicker },
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
