<template>
  <v-container>
    <v-row>
      <v-col class='pa-3 text-right'>
        <v-btn color='green' @click='getData'>Обновить данные</v-btn>
      </v-col>
    </v-row>

    <v-simple-table class="styled-table">
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

<style scoped>
.styled-table {
  border-collapse: collapse;
  margin: 15px 0;
  font-size: 0.9em;
  min-width: 400px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
}
.styled-table thead tr {
  background-color: #005b98;
  color: #ffffff;
  text-align: left;
}
.styled-table th,
.styled-table td {
  padding: 12px 15px;
}
.styled-table tbody tr {
  //border-bottom: 1px solid #005b98;
}
.styled-table tbody tr:nth-of-type(even) {
  background-color: #f3f3f3;
}
.styled-table tbody tr:last-of-type {
  border-bottom: 2px solid #005b98;
}
.styled-table tbody tr.active-row {
  font-weight: bold;
  color: #005b98;
}
</style>
