<template>
  <v-container>
    <!--    <ToolFilter-->
    <!--      :filter-params-list="filterParamsList"-->
    <!--      :filters="filters"-->
    <!--      @filter-update="onParamsFilterUpdate"-->
    <!--    />-->

    <v-row cols="12" sm="4">
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

    <tool-filter :namespace="namespace">
      <v-btn color="blue" @click="onAddTool">Новый инструмент</v-btn>
    </tool-filter>

    <editor-tool-modal
      v-if="openDialog"
      :persistent="true"
      :tool-id="editingToolId"
      @canceled="onClosePopup"
      @changes-saved="onSaveChanges"
    />
    <v-data-table-server
      v-if="isDataLoaded"
      noDataText="Нет данных"
      itemsPerPageText="Пункты на странице:"
      loadingText="Загрузка данных"
      :headers="toolTableHeaders"
      :items="formattedTools"
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
      <template v-slot:item.index="{ index }">
        <td class="index">{{ index + 1 }}</td>
      </template>
      <!--name-->
      <template v-slot:item.name="{ item }">
        <td :class="colorClassGrey(item)" style="white-space: nowrap">
          {{ item.name }}
        </td>
      </template>
      <template v-slot:item.sklad="{ item }">
        <td :class="colorClassRed(item)" style="white-space: nowrap">
          {{ item.sklad }}
        </td>
      </template>
      <template v-slot:item.norma="{ item }">
        <td style="white-space: nowrap">{{ item.norma }}</td>
      </template>
      <template v-slot:item.zakaz="{ item }">
        <td style="white-space: nowrap">{{ calculateOrder(item) }}</td>
      </template>
    </v-data-table-server>
  </v-container>
</template>

<script>
import EditorToolModal from './Modal.vue'
import ToolFilter from '@/modules/tool/components/ToolFilter.vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import { mapActions, mapMutations, mapGetters } from 'vuex'

export default {
  emits: [],
  components: {
    VDataTableServer,
    EditorToolModal,
    ToolFilter,
  },
  props: {
    namespace: {
      type: String,
      default: 'tool',
    },
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
  watch: {
    'parentCatalog.id'(newId) {
      if (newId != null) {
        this.fetchToolsDynamicFilters()
      }
    },
    dynamicFilters: {
      immediate: true,
      handler(dynamicFilters) {
        this.toolTableHeaders = [
          { title: '№', key: 'index', sortable: false },
          { title: 'Маркировка', key: 'name', sortable: true },
          ...(dynamicFilters && dynamicFilters.length > 0
            ? dynamicFilters.map(({ label: title, key }) => ({
                title,
                key,
                sortable: true,
              }))
            : []),
          { title: 'Норма', key: 'norma', sortable: false },
          { title: 'Склад', key: 'sklad', sortable: false },
          { title: 'Заказ', key: 'zakaz', sortable: false },
          { title: 'Лимит', key: 'limit', sortable: false },
        ]
      },
    },
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
    async onChangePage(page) {
      this.setCurrentPage(page)
      await this.fetchToolsByFilter()
    },
    async onUpdateItemsPerPage(itemsPerPage) {
      this.setItemsPerPage(itemsPerPage)
      await this.fetchToolsByFilter()
    },

    colorClassGrey(item) {
      return { grey: !item.sklad || item.sklad === 0 }
    },
    colorClassRed(item) {
      return { red: !item.sklad || item.sklad === 0 }
    },
    calculateOrder(tool) {
      const order = tool.norma - tool.sklad
      return order < 0 ? '' : order
    },

    onClosePopup() {
      this.openDialog = false
    },
    onSaveChanges() {
      this.openDialog = false
      this.fetchToolsDynamicFilters()
      this.fetchToolsByFilter()
    },
    onAddTool() {
      this.editingToolId = null
      this.openDialog = true
    },
    onEditRow(event, { item: tool }) {
      this.editingToolId = tool.id
      this.openDialog = true
    },
  },
}
</script>

<style scoped>
.index {
  max-width: 40px !important;
  font-size: 0.9em;
  color: grey;
}

.grey {
  color: grey;
}

.red {
  color: red;
}
</style>
