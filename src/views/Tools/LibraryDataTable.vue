<template>
  <v-simple-table class="styled-table">
    <template v-slot:default>
      <thead>
      <tr>
        <th class="text-left">ID</th>
        <th class="text-left">Название</th>
        <th class="text-left">Кнопка</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in items" :key="item.id" class="row">
        <td>{{ item.id }}</td>
        <td>{{ item.name }}</td>
        <td>
          <v-btn density="compact" icon="mdi-plus" @click='deleteItem(item)'>
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </td>
      </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
export default {
  props: ['items'],
  methods: {
    deleteItem(item) {
      this.$emit('deleteItem', item, this.items)
    },
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
