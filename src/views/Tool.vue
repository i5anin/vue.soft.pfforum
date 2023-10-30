<template>
  <v-btn @click="openDialog = true">Добавить</v-btn>
  <v-table>
    <thead>
    <tr>
      <th class='text-left'>id</th>
      <th class='text-left'>Группа</th>
      <th class='text-left'>Применяемость материала</th>
      <th class='text-left'>Радиус</th>
      <th class='text-left'>Маркировка</th>
      <th class='text-left'>Количесво на складе</th>
      <th class='text-left'>Название(Тип)</th>
      <th class='text-left'>Нормальный запас на неделю</th>
      <th class='text-left'>Заказ</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for='tool in tools' :key='tool.id'>
      <td>{{ tool.id }}</td> <!-- id -->
      <td>{{ tool.group_name }}</td> <!-- Группа -->
      <td>{{ tool.mat_name }}</td> <!-- Применяемость материала -->
      <td>{{ tool.rad }}</td> <!-- Радиус -->
      <td>{{ tool.name }}</td> <!-- Маркировка -->
      <td>{{ tool.kolvo_sklad }}</td> <!-- Количесво на складе -->
      <td>{{ tool.type_name }}</td> <!-- Название(Тип) -->
      <td>{{ tool.norma }}</td> <!-- Нормальный запас на неделю -->
      <td>{{ tool.zakaz }}</td> <!-- Заказ -->
    </tr>
    </tbody>
  </v-table>
</template>

<script>
import { fetchTools, addTool as apiAddTool } from '@/api'

export default {
  data() {
    return {
      tools: [],
      newToolName: '',
    }
  },
  async created() {
    this.tools = await fetchTools()
  },
  methods: {
    async addTool() {
      if (this.newToolName) {
        const addedTool = await apiAddTool(this.newToolName)
        if (addedTool) {
          this.tools.push(addedTool)
          this.newToolName = ''
        }
      }
    },
  },
}
</script>
