<template>
  <v-container>
    <!-- <tool-filter :namespace="namespace">-->
    <!-- <v-btn color="blue" @click="onAddTool">Новый инструмент</v-btn>-->
    <!-- </tool-filter>-->
    <issue-modal
      v-if="openDialog && currentModal === 'issue'"
      :persistent="true"
      :tool-id="editingToolId"
      @canceled="onClosePopup"
      @changes-saved="onSaveChanges"
    />

    <damaged-modal
      v-if="openDialog && currentModal === 'damaged'"
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
      <template v-slot:item.name="{ item }">
        <span style="white-space: nowrap">{{ item.name }}</span>
      </template>
      <template v-slot:item.sklad="{ item }">
        <span style="white-space: nowrap">{{ item.sklad }}</span>
      </template>
      <template v-slot:item.norma="{ item }">
        <span style="white-space: nowrap">{{ item.norma }}</span>
      </template>
      <template v-slot:item.zakaz="{ item }">
        <span style="white-space: nowrap">{{ calculateOrder(item) }}</span>
      </template>
      <template v-slot:item.issue="{ item }">
        <v-btn color="primary" @click="(event) => onIssueTool(event, item)">
          Выдать
        </v-btn>
      </template>

      <template v-slot:item.damaged="{ item }">
        <v-btn color="red" @click="(event) => onDamagedTool(event, item)">
          Поврежденн
        </v-btn>
      </template>
    </v-data-table-server>
  </v-container>
</template>

<script>
import IssueModal from './ModalIssue.vue'
import DamagedModal from './ModalDamaged.vue'
import ToolFilter from '@/modules/tool/components/ToolFilter.vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'

export default {
  emits: ['changes-saved', 'canceled', 'page-changed', 'page-limit-changed'],
  components: {
    VDataTableServer,
    IssueModal,
    ToolFilter,
    DamagedModal,
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
    paramsList: {
      immediate: true,
      handler(newVal) {
        this.toolTableHeaders = [
          { title: '№', key: 'index', sortable: false },
          { title: 'Маркировка', key: 'name', sortable: true },
          { title: 'Склад', key: 'sklad', sortable: false },
          { title: 'Выдача', key: 'issue', sortable: false },
          ...(newVal && newVal.length > 0
            ? newVal.map((param) => ({
                title: param.label,
                key: param.key,
                sortable: true,
              }))
            : []),
          // { title: 'Норма', key: 'norma', sortable: false },
          // { title: 'Заказ', key: 'zakaz', sortable: false },
          { title: 'Поврежден', key: 'damaged', sortable: false },
        ]
      },
    },
  },

  async mounted() {
    this.isDataLoaded = true
  },
  methods: {
    onIssueTool(event, item) {
      event.stopPropagation()
      this.editingToolId = item.id
      this.currentModal = 'issue'
      this.openDialog = true
    },
    onDamagedTool(event, item) {
      event.stopPropagation()
      this.editingToolId = item.id
      this.currentModal = 'damaged'
      this.openDialog = true
    },
    calculateOrder(tool) {
      if (tool.norma != null) return tool.norma - tool.sklad
    },
    async onChangePage(page) {
      this.$emit('page-changed', page)
    },
    async onUpdateItemsPerPage(itemsPerPage) {
      this.$emit('page-limit-changed', itemsPerPage)
    },
    onClosePopup() {
      this.openDialog = false
      this.currentModal = null
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
</style>
