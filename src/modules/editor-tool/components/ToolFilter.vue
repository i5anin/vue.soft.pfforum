<template>
  <div>
    <v-row cols="12" sm="6">
      <v-col v-for="filter in dynamicFilters" :key="filter.key">
        <v-select
          clearable="true"
          :label="filter.label"
          :items="filter.values"
          :value="filters.selectedDynamicFilters[filter.key]"
          @update:model-value="
            (value) => onParamsFilterUpdate({ key: filter.key, value })
          "
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import EditorToolModal from './Modal.vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import { mapActions, mapMutations, mapGetters } from 'vuex'

export default {
  emits: [],
  components: {
    VDataTableServer,
    EditorToolModal,
  },
  computed: {
    ...mapGetters('EditorToolStore', [
      'toolsTotalCount',
      'formattedTools',
      'dynamicFilters',
      'filters',
      'parentCatalog',
      'isLoading',
    ]),
  },
  data() {
    return {
      openDialog: false,
      isDataLoaded: false,
      editingToolId: null, //редактирование идентификатора инструмента
      toolTableHeaders: [], //заголовки таблиц инструментов
      filterParamsList: [],
    }
  },

  async mounted() {
    await this.fetchToolsDynamicFilters()
    this.isDataLoaded = true
  },
  methods: {
    ...mapActions('EditorToolStore', [
      'fetchToolsDynamicFilters',
      'fetchToolsByFilter',
    ]),
    ...mapMutations('EditorToolStore', [
      'setCurrentPage',
      'setItemsPerPage',
      'setSelectedDynamicFilters',
    ]),
    // Метод для обработки обновления параметров фильтра
    onParamsFilterUpdate({ key, value }) {
      this.setSelectedDynamicFilters({
        ...this.filters.selectedDynamicFilters,
        [key]: value,
      })
      this.fetchToolsByFilter()
    },
  },
}
</script>
