<template>
  <v-table>
    <thead>
    <tr>
      <th class='text-left'>Маркировка</th>
      <th class='text-left'>Группа</th>
      <th class='text-left'>Применяемость материала</th>
      <th class='text-left'>Название(Тип)</th>
      <th class='text-left'>Радиус</th>
      <th class='text-left'>Количесво на складе</th>
      <th class='text-left'>Нормальный запас на неделю</th>
      <th class='text-left'>Заказ</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for='tool in tools' :key='tool.name'>
      <td>{{ tool.name }}</td>
      <td>{{ tool.group_name }}</td>
      <td>{{ tool.mat_name }}</td>
      <td>{{ tool.type_name }}</td>
      <td>{{ tool.rad }}</td>
      <td>{{ tool.kolvo_sklad }}</td>
      <td>{{ tool.norma }}</td>
      <td>{{ tool.zakaz }}</td>
    </tr>
    </tbody>
  </v-table>
  <input v-model='newToolName' placeholder='Enter tool name' />
  <button @click='addTool'>Add Tool</button>
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
