<template>
  <v-table>
    <thead>
    <tr>
      <th class='text-left'> Name</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for='tool in tools' :key='tool.id'>
      <td>{{ tool.name }}</td>
    </tr>
    </tbody>
  </v-table>
  <input v-model="newToolName" placeholder="Enter tool name" />
  <button @click="addTool">Add Tool</button>
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
        const addedTool = await apiAddTool(this.newToolName);
        this.tools.push(addedTool);
        this.newToolName = '';
      }
    },
  },
}
</script>
