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
</template>

<script>
import { fetchTools } from '@/api'

export default {
  data() {
    return {
      tools: [],
    }
  },
  async created() {
    this.tools = await fetchTools()
  },
}
</script>
