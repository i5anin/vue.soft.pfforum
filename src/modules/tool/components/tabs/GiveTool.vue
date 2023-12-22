<template>
  <v-container>
    <!-- Остальные компоненты -->
    <v-data-table-server
      v-if="isDataLoaded"
      noDataText="Нет данных"
      itemsPerPageText="Пункты на странице:"
      loadingText="Загрузка данных"
      :headers="ToolTableHeaders"
      :items="tools"
      :itemsLength="toolsTotalCount"
      :items-per-page="filters.itemsPerPage"
      :page="filters.currentPage"
      :loading="isLoading"
      :items-per-page-options="[15, 50, 100, 300]"
      density="compact"
      @update:page="onChangePage"
      @update:items-per-page="onUpdateItemsPerPage"
      @click:row="onEditRow"
      class="elevation-1"
      hover
      fixed-header
      width
    >
      <!-- Конфигурация слотов -->
    </v-data-table-server>
  </v-container>
</template>

<script>
// Импорты
import EditToolModalSklad from '@/modules/tool/components/modal/EditToolModalSklad.vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import { mapActions, mapMutations, mapGetters } from 'vuex'
import GetTool from '@/modules/tool/components/GetTool.vue'
import { fetchToolHistory } from '@/api'

export default {
  // Конфигурация компонента
  data() {
    return {
      // Остальные свойства данных
      tools: [], // Сюда будут загружаться данные
    }
  },
  // Вычисляемые свойства, методы и т.д.
  async mounted() {
    await this.fetchToolsByFilter() // Загрузка данных при монтировании
    this.isDataLoaded = true
    console.log('Данные загружены:', this.isDataLoaded)
  },

  methods: {
    ...mapActions('tool', ['fetchToolsByFilter']),
    // Остальные методы

    async fetchToolsByFilter() {
      try {
        const response = await fetchToolHistory()
        if (response) {
          this.tools = response
          console.log('Загруженные инструменты:', this.tools)
          this.toolsTotalCount = response.length
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error)
      }
    },

    // Остальные методы
  },
}
</script>

<style scoped>
/* Стили */
</style>
