<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="searchQuery"
          append-icon="mdi-magnify"
          label="Поиск"
          single-line
          hide-details
          @input="onSearch"
        />
      </v-col>
    </v-row>
    <v-row
      cols="12"
      sm="6"
      v-for="(group, index) in groupedFilters"
      :key="`group-${index}`"
    >
      <v-col v-for="filter in group" :key="filter.key" cols="12" sm="3">
        <v-combobox
          density="compact"
          variant="solo"
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
import store from '@/store/store'

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
    groupedFilters() {
      const result = []
      const itemsPerRow = 4 // Меняйте это значение в зависимости от желаемого количества элементов в строке
      for (let i = 0; i < this.dynamicFilters.length; i += itemsPerRow) {
        result.push(this.dynamicFilters.slice(i, i + itemsPerRow))
      }
      return result
    },
  },
  data() {
    return {
      searchQuery: '',
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
    onSearch() {
      store.commit('EditorToolStore/setSearch', this.searchQuery)
      store.dispatch('EditorToolStore/fetchToolsByFilter')
    },
    // Метод для обработки обновления параметров фильтра
    onParamsFilterUpdate({ key, value }) {
      this.setSelectedDynamicFilters({
        ...this.filters.selectedDynamicFilters,
        [key]: value,
      })
      this.fetchToolsByFilter()
    },
    earchQuery() {},
  },
}
</script>
