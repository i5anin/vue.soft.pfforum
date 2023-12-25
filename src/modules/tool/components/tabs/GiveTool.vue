<template>
  <v-container>
    <v-data-table
      v-if="isDataLoaded"
      noDataText="Нет данных"
      itemsPerPageText="Пункты на странице:"
      loadingText="Загрузка данных"
      :headers="headers"
      :items="tools"
      :items-per-page-options="[15, 50, 100, 300]"
      density="compact"
      class="elevation-1"
      fixed-header
      :hover="true"
    >
      <!-- Конфигурация слотов -->
    </v-data-table>
  </v-container>
</template>

<script>
import { fetchToolHistory } from '@/api'
import { VDataTable } from 'vuetify/labs/components'

export default {
  components: { VDataTable },
  data() {
    return {
      tools: [],
      isDataLoaded: false,
      headers: [
        // Здесь определите заголовки для вашей таблицы
        { text: 'ID Операции', value: 'id_oper' },
        { text: 'Название', value: 'name' },
        // Другие заголовки...
      ],
    }
  },
  async mounted() {
    await this.fetchTools()
    this.isDataLoaded = true
  },
  methods: {
    async fetchTools() {
      const data = await fetchToolHistory()
      if (data) {
        this.tools = data
      }
    },
  },
}
</script>
