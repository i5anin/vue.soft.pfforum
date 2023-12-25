<template>
  <v-container>
    <v-data-table-server
      v-if="toolsHistory && toolsHistory.length > 0"
      noDataText="Нет данных"
      itemsPerPageText="Пункты на странице:"
      loadingText="Загрузка данных"
      item-value="name"
      :headers="headers"
      :items-length="totalCount"
      :items="toolsHistory"
      :items-per-page-options="[15, 50, 100, 300]"
    >
      <template v-slot:item.name="{ item }">
        <span style="white-space: nowrap">{{ item.name }}</span>
      </template>
      <template v-slot:item.description="{ item }">
        <span style="white-space: nowrap">{{ item.description }}</span>
      </template>
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
      headers: [
        { title: 'Название', key: 'name', sortable: true },
        { title: 'description', key: 'description', sortable: true },
        { title: 'no_oper', key: 'no_oper', sortable: true },
        { title: 'type_oper', key: 'type_oper', sortable: true },
        { title: 'quantity', key: 'quantity', sortable: true },
        { title: 'user_fio', key: 'user_fio', sortable: true },
        { title: 'date_p', key: 'date_p', sortable: true },
        { title: 'date_u', key: 'date_u', sortable: true },
        { title: 'name_tool', key: 'name_tool', sortable: true },
        { title: 'Характеристики', key: 'property', sortable: true },
      ],
    }
  },
  async mounted() {
    await this.loadToolHistory()
  },
  methods: {
    async loadToolHistory() {
      try {
        const response = await fetchToolHistory()
        this.toolsHistory = response.toolsHistory
        this.totalCount = response.totalCount
      } catch (error) {
        console.error('Ошибка при загрузке истории инструментов:', error)
      }
    },
  },
}
</script>
