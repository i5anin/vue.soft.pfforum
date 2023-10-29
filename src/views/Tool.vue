<template>
  <div>
    <v-text-field v-model="toolName" label="Tool name"></v-text-field>
    <v-btn @click="addTool">Add Tool</v-btn>
    <v-table v-if="tools.length > 0">
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
    <div v-else>No tools available</div>
  </div>
</template>

<script>
import { fetchTools, addTool as apiAddTool } from '@/api'

export default {
  data() {
    return {
      tools: [],
      toolName: '',
    }
  },
  async created() {
    this.tools = await fetchTools()
  },
  methods: {
    async addTool() {
      if (this.toolName) {
        const newTool = await apiAddTool(this.toolName);
        if (newTool) {
          this.tools.push(newTool);
          this.toolName = '';
        } else {
          console.error('Failed to add tool');
        }
      }
    }
  },
}
</script>
