<template>
  <v-container>
    <v-row>
      <v-col class='pa-3 text-right'>
        <v-btn color='green' @click='getData'>Обновить данные</v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols='4'>
        <h2 class='text-h4'>Группы</h2>
        <v-simple-table class='styled-table'>
          <template v-slot:default>
            <thead>
            <tr>
              <th class='text-left'>ID</th>
              <th class='text-left'>Название</th>
              <th class='text-left'>Кнопка</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for='item in groups' :key='item.id' class='row'>
              <td>{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>
                <v-btn density='compact' icon='mdi-open-in-new' @click='deleteItem(item, groups)'>
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>

      <v-col cols='4'>
        <h2 class='text-h4'>Материалы</h2>
        <v-simple-table class='styled-table'>
          <template v-slot:default>
            <thead>
            <tr>
              <th class='text-left'>ID</th>
              <th class='text-left'>Название</th>
              <th class='text-left'>Кнопка</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for='item in materials' :key='item.id' class='row'>
              <td>{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>
                <v-btn density='compact' icon='mdi-open-in-new' @click='deleteItem(item, materials)'>
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>

      <v-col cols='4'>
        <h2 class='text-h4'>Типы</h2>
        <v-simple-table class='styled-table'>
          <template v-slot:default>
            <thead>
            <tr>
              <th class='text-left'>ID</th>
              <th class='text-left'>Название</th>
              <th class='text-left'>Кнопка</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for='item in types' :key='item.id' class='row'>
              <td>{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>
                <v-btn density='compact' icon='mdi-open-in-new' @click='deleteItem(item, types)'>
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { getLibraries } from '@/api'

export default {
  data() {
    return {
      groups: [],
      materials: [],
      types: [],
    }
  },
  methods: {
    async getData() {
      try {
        const response = await getLibraries()
        this.groups = response.groups.map((item, index) => ({ ...item, id: index + 1 }))
        this.materials = response.materials.map((item, index) => ({ ...item, id: index + 1 }))
        this.types = response.types.map((item, index) => ({ ...item, id: index + 1 }))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    },
    deleteItem(item, list) {
      const index = list.indexOf(item)
      list.splice(index, 1)
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
  border-bottom: 1px solid #dddddd;
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

.row:hover .delete-button {
  display: block;
}

.delete-button {
  display: none;
  border-radius: 50%;
}
</style>
