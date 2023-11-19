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
      <template v-slot:item.id='{ item }'>
        <td>{{ item.id }}</td>
      </template>
      <template v-slot:item.name='{ item }'>
        <td>{{ item.name }}</td>
      </template>
<!--      <td>-->
<!--        <v-btn prepend-icon='$delete'>-->
<!--          удалить-->
<!--        </v-btn>-->
<!--      </td>-->


    </v-data-table>
  </v-container>
</template>

<script>
import { getLibraries } from '@/api'
import { VDataTable } from 'vuetify/labs/VDataTable'


export default {
  components: { VDataTable },
  data() {
    return {
      data: [],
      headers: [
        { text: 'ID', value: 'id' },
        { text: 'Name', value: 'name' },
      ],
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
  },
}
</script>
