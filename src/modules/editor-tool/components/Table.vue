<template>
  <v-container>
    <!-- <tool-filter :namespace="namespace">-->
    <!-- <v-btn color="blue" @click="onAddTool">Редактировать склад</v-btn>-->
    <!-- </tool-filter>-->

    <v-row cols="12" sm="4">
      <v-col v-for="filter in filterParamsList" :key="filter.key">
        <v-select
          clearable="true"
          :label="filter.label"
          :items="filter.values"
          v-model="filters[filter.key]"
          @update:model-value="onParamsFilterUpdate"
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
import { toolEditorApi } from '@/modules/editor-tool/api/editor'

export default {
  emits: ['changes-saved', 'canceled', 'page-changed', 'page-limit-changed'],
  components: {
    VDataTableServer,
    EditorToolModal,
    ToolFilter,
  },
  props: {
    toolsTotalCount: {
      type: Number,
      default: 0,
    },
    formattedTools: {
      type: Array,
      default: () => [],
    },
    filters: {
      type: Object,
      required: true,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    paramsList: {
      type: Array,
      default: () => [],
    },
    namespace: {
      type: String,
      default: 'tool',
    },
  },
  data() {
    return {
      activeTabType: 'Catalog', // Например, 'Catalog', 'Sklad', 'Give' и т.д.
      openDialog: false,
      isDataLoaded: false,
      editingToolId: null, //редактирование идентификатора инструмента
      toolTableHeaders: [], //заголовки таблиц инструментов
    }
  },
  watch: {
    parentId: {
      immediate: true,
      handler(newValue, oldValue) {
        if (newValue !== oldValue) {
          this.fetchFilterParams()
        }
      },
    },
    paramsList: {
      immediate: true,
      handler(newVal) {
        this.toolTableHeaders = [
          { title: '№', key: 'index', sortable: false },
          { title: 'Маркировка', key: 'name', sortable: true },
          ...(newVal && newVal.length > 0
            ? newVal.map((param) => ({
                title: param.label,
                key: param.key,
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
    this.isDataLoaded = true
  },
  methods: {
    async fetchFilterParams() {
      console.log('Таблица. parentId = ', this.parentId)
      if (this.parentId)
        this.filterParamsList = await toolEditorApi.filterParamsByParentId(
          this.parentId
        )
      this.isDataLoaded = true
    },
    colorClassGrey(item) {
      return { grey: !item.sklad || item.sklad === 0 }
    },
    colorClassRed(item) {
      return { red: !item.sklad || item.sklad === 0 }
    },
    onIssueTool(event, item) {
      event.stopPropagation() // Предотвратить всплытие события
      console.log('Выдать инструмент:', item)
    },
    calculateOrder(tool) {
      if (tool.norma || tool.sklad) return tool.norma - tool.sklad
    },

    async onChangePage(page) {
      this.$emit('page-changed', page)
    },
    async onUpdateItemsPerPage(itemsPerPage) {
      this.$emit('page-limit-changed', itemsPerPage)
    },
    onClosePopup() {
      this.openDialog = false
    },
    onSaveChanges() {
      this.openDialog = false
      this.$emit('changes-saved')
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
