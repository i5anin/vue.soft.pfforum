<template>
  <v-container>
    <v-row>
      <v-col class='pa-3 text-right'>
        <v-btn color='green' @click='getData'>Получить данные</v-btn>
      </v-col>
    </v-row>

    <v-data-table
      :headers='headers'
      :items='data'
      :items-per-page='10'
      class='elevation-1'
    >
      <template v-slot:item='{ item }'>
        <tr>
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
        </tr>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import { getLibraries } from '@/api'

export default {
  data() {
    return {
      data: [],
      headers: [{ text: 'Name', value: 'name' }],
    }
  },
  methods: {
    async getData() {
      try {
        const response = await getLibraries()
        console.log(response.groups[1].name)
        console.log(response.groups[1].id)
        this.data = [
          ...response.groups,
          ...response.materials,
          ...response.types,
        ].map((item, index) => ({ ...item, id: index + 1 }))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    ,
  },
}
</script>
