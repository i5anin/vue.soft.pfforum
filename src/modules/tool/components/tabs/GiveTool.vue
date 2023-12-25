<template>
  <v-container>
    <v-data-table-server
      v-if="isDataLoaded"
      noDataText="Нет данных"
      itemsPerPageText="Пункты на странице:"
      loadingText="Загрузка данных"
      :headers="headers"
      :items="toolsHistory"
      :items-length="totalCount"
      :items-per-page-options="[15, 50, 100, 300]"
      density="compact"
      class="elevation-1"
      fixed-header
      :hover="true"
    >
      <!-- Здесь можно добавить дополнительные слоты и конфигурации, если нужно -->
    </v-data-table-server>
  </v-container>
</template>

<script>
import { fetchToolHistory } from '@/api'
import { VDataTableServer } from 'vuetify/labs/components'

export default {
  components: { VDataTableServer },
  data() {
    return {
      toolsHistory: [],
      totalCount: 0,
      isDataLoaded: false,
      headers: [
        { title: 'ID Операции', key: 'id_oper', sortable: false },
        { title: 'Название', key: 'name', sortable: true },
        // Дополнительные заголовки...
      ],
    }
  },
  async mounted() {
    console.log('Монтирование компонента...')
    await this.loadToolHistory()
    this.isDataLoaded = true
    console.log('Монтирование завершено. isDataLoaded:', this.isDataLoaded)
  },
  methods: {
    async loadToolHistory() {
      try {
        const response = await fetchToolHistory()
        if (response && response.data) {
          this.toolsHistory = response.data.toolsHistory
          this.totalCount = response.data.totalCount
        }
      } catch (error) {
        console.error('Ошибка при загрузке истории инструментов:', error)
      }
    },
  },
}
</script>
