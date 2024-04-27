<template>
  <v-dialog v-model="visible" max-width="600px">
    <v-card>
      <v-card-title>Список выданных инструментов</v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="issuedTools"
          class="elevation-1"
        >
          <template v-slot:item="{ item }">
            <td>{{ item.toolName }}</td>
            <td>{{ item.issuedTo }}</td>
            <td>{{ item.operation }}</td>
            <td>{{ item.issueType }}</td>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary darken-1" text @click="close">Закрыть</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'IssuedToolsList',
  props: {
    issuedTools: Array,
    visible: Boolean,
  },
  data() {
    return {
      headers: [
        { text: 'Инструмент', align: 'start', value: 'toolName' },
        { text: 'Кому выдан', value: 'issuedTo' },
        { text: 'На операцию', value: 'operation' },
        { text: 'Тип выдачи', value: 'issueType' },
      ],
    }
  },
  methods: {
    close() {
      this.$emit('update:visible', false)
    },
  },
}
</script>
