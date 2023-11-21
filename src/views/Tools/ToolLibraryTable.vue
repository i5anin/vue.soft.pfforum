<template>
  <v-container>
    <v-row>
      <v-col class='pa-3 text-right'>
        <v-btn color='green' @click='getData'>Обновить данные</v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols='4' v-for='(items, title) in tables' :key='title'>
        <h2 class='text-h4'>{{ title }}</h2>
        <data-table :items='items' @deleteItem='deleteItem' />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { getLibraries } from '@/api'
import DataTable from './LibraryDataTable.vue'

export default {
  components: { DataTable },
  data() {
    return { tables: { 'Группы': [], 'Материалы': [], 'Типы': [] } }
  },
  methods: {
    async getData() {
      try {
        const response = await getLibraries();
        this.tables['Группы'] = response.groups.sort((a, b) => a.name.localeCompare(b.name));
        this.tables['Материалы'] = response.materials.sort((a, b) => a.name.localeCompare(b.name));
        this.tables['Типы'] = response.types.sort((a, b) => a.name.localeCompare(b.name));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },

    deleteItem(item, list) {
      if (confirm('Вы уверены, что хотите удалить этот элемент?')) {
        const index = list.indexOf(item)
        list.splice(index, 1)
      }
    },
  },
  mounted() {
    this.getData()
  },
}
</script>

<style scoped>
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
  border-bottom: 1px solid #dddddd;
}

.styled-table tbody tr:nth-of-type(even) {
  background-color: #f3f3f3;
}

.styled-table tbody tr:last-of-type {
  border-bottom: 2px solid #005b98;
}

.styled-table tbody {
  font-weight: bold;
  color: #005b98;
}

</style>
