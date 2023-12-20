<template>
  <v-container>
    <tool-filter>
      <v-btn color="blue" @click="onAddTool">Новый инструмент</v-btn>
    </tool-filter>
    <edit-tool-modal
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
        <span style="white-space: nowrap">{{ item.name }}</span>
      </template>
      <template v-slot:item.sklad="{ item }">
        <span style="white-space: nowrap">{{ item.kolvo_sklad }}</span>
      </template>
      <template v-slot:item.norma="{ item }">
        <span style="white-space: nowrap">{{ item.norma }}</span>
      </template>
      <template v-slot:item.zakaz="{ item }">
        <span style="white-space: nowrap">{{ item.zakaz }}</span>
      </template>
    </v-data-table-server>
  </v-container>
</template>

<script>
import EditToolModal from '@/modules/tool/components/modal/EditToolModal.vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import { mapActions, mapMutations, mapGetters } from 'vuex'
import ToolFilter from '@/modules/tool/components/ToolFilter.vue'

export default {
  emits: ['changes-saved', 'canceled'],
  components: {
    VDataTableServer,
    EditToolModal,
    ToolFilter,
  },
  props: {
    parentId: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      openDialog: false,
      isDataLoaded: false,
      editingToolId: null, //редактирование идентификатора инструмента
      toolTableHeaders: [], //заголовки таблиц инструментов
    }
  },
  computed: {
    ...mapGetters('tool', [
      'toolsTotalCount',
      'formattedTools',
      'filters',
      'isLoading',
      'paramsList',
    ]),
  },
  watch: {
    paramsList: {
      immediate: true,
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.toolTableHeaders = [
            { title: '№', key: 'index', sortable: false },
            { title: 'Маркировка', key: 'name', sortable: true },
            ...newVal.map((param) => ({
              title: param.label,
              key: param.key,
              sortable: true,
            })),
          ]
        }
      },
    },
  },
  async mounted() {
    await this.fetchToolsByFilter()
    this.isDataLoaded = true
  },
  methods: {
    ...mapActions('tool', ['fetchToolsByFilter']),
    ...mapMutations({
      setCurrentPage: 'tool/setCurrentPage',
      setItemsPerPage: 'tool/setItemsPerPage',
    }),

    async onChangePage(page) {
      this.setCurrentPage(page)
      await this.fetchToolsByFilter()
    },
    async onUpdateItemsPerPage(itemsPerPage) {
      this.setItemsPerPage(itemsPerPage)
      await this.fetchToolsByFilter()
    },
    onClosePopup() {
      this.openDialog = false
    },
    onSaveChanges() {
      this.openDialog = false
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
