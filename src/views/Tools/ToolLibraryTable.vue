<template>
  <v-container>
    <v-row>
      <v-col class='pa-3 text-right'>
        <v-btn color='green' @click='getData'>Обновить данные</v-btn>
      </v-col>
    </v-row>

    <v-simple-table>
      <template v-slot:default>
        <thead>
        <tr>
          <th class="text-left">ID</th>
          <th class="text-left">Name</th>
          <th class="text-left">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in data" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>
            <v-btn color='red' @click='deleteItem(item)'>Удалить</v-btn>
          </td>
        </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-container>
</template>

<script>
import { getLibraries } from '@/api'

export default {
  data() {
    return {
      data: [],
    }
  },
  methods: {
    async getData() {
      try {
        const response = await getLibraries()
        this.data = [
          ...response.groups,
          ...response.materials,
          ...response.types,
        ].map((item, index) => ({ ...item, id: index + 1 }))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    },
    deleteItem(item) {
      const index = this.data.indexOf(item)
      this.data.splice(index, 1)
    },
  },
  mounted() {
    this.getData()
  },
}
</script>
