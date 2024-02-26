<template>
  <v-container>
    <tool-filter />
    <v-btn color="blue" @click="onAddTool">Новый инструмент</v-btn>
    <ModalDamaged
      v-if="openDialog && currentModal === 'damaged'"
      :persistent="true"
      :tool-id="editingToolId"
      @canceled="onClosePopup"
      @changes-saved="onSaveChanges"
    />
    <ModalIssue
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
      <template v-slot:item.issue="{ item }">
        <v-btn color="primary" @click="(event) => onIssueTool(event, item)">
          Выдать
        </v-btn>
      </template>

      <template v-slot:item.damaged="{ item }">
        <v-btn color="red" @click="(event) => onDamagedTool(event, item)">
          Поврежден
        </v-btn>
      </template>
    </v-data-table-server>
  </v-container>
</template>

<script>
import ModalIssue from './ModalIssue.vue'
import ModalDamaged from './ModalDamaged.vue'
import ToolFilter from '@/modules/shared/components/ToolFilter.vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import { mapActions, mapMutations, mapGetters } from 'vuex'

export default {
  emits: [],
  components: {
    VDataTableServer,
    ToolFilter,
    ModalIssue,
    ModalDamaged,
  },
  props: {
    namespace: {
      type: String,
      default: 'tool',
    },
  },
  computed: {
    ...mapGetters('IssueToolStore', [
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
          { title: 'Выдача', key: 'issue', sortable: false },
          ...(dynamicFilters && dynamicFilters.length > 0
            ? dynamicFilters.map(({ label: title, key }) => ({
                title,
                key,
                sortable: true,
              }))
            : []),
          // { title: 'Норма', key: 'norma', sortable: false },
          // { title: 'Склад', key: 'sklad', sortable: false },
          // { title: 'Заказ', key: 'zakaz', sortable: false },
          // { title: 'Лимит', key: 'limit', sortable: false },
          { title: 'Поврежден', key: 'damaged', sortable: false },
        ]
      },
    },
  },

  async mounted() {
    await this.fetchToolsDynamicFilters()
    this.isDataLoaded = true
  },
  methods: {
    ...mapActions('IssueToolStore', [
      'fetchToolsDynamicFilters',
      'fetchToolsByFilter',
    ]),
    ...mapMutations('IssueToolStore', [
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
