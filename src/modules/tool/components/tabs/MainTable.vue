<template>
  <v-container>
    <tool-filter>
      <v-btn color="blue" @click="onAddTool">Новый инструмент</v-btn>
    </tool-filter>
    <edit-tool-modal
      v-if="openDialog"
      :tool="editingTool"
      :persistent="true"
      @canceled="onClosePopup"
      @changes-saved="onSaveChanges"
    />
    <v-data-table-server
      v-if="isDataLoaded"
      noDataText="Нет данных"
      itemsPerPageText="Пункты на странице:"
      loadingText="Загрузка данных"
      :headers="ToolTableHeaders"
      :items="tools"
      :itemsLength="toolsTotalCount"
      :items-per-page="filters.itemsPerPage"
      :page.sync="filters.currentPage"
      :loading="isLoading"
      :items-per-page-options="[15, 50, 100, 300]"
      density="compact"
      @update:page="onChangePage"
      @update:items-per-page="onUpdateItemsPerPage"
      @click:row="onEditRow"
      class="elevation-1"
      hover
      fixed-header
      headers
      width
    >
      <template v-slot:item.index="{ index }">
        <td class="index">{{ index + 1 }}</td>
      </template>
      <!--name-->
      <template v-slot:item.name="{ item }">
        <span style="white-space: nowrap">{{ item.name }}</span>
      </template>

      <!-- TODO: параметр будет автоматически генерироваться из paramsList метода getTools()-->
      <!-- TODO: в данном случае "paramsList": [{"key": "1","label": "Тип"},{"key": "2","label": "Группа"... {"key": "13","label": "Геометрия"}],-->

      <template
        v-for="param in paramsList"
        v-slot:[`item.${param.key}`]="{ item }"
      >
        <td>{{ item.properties[param.key] }}</td>
      </template>
      <template v-slot:item.param="{ item }">
        <div v-for="(prop, key) in item.property" :key="key">
          {{ prop.info }}: {{ prop.value }}
        </div>
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
      editingTool: null,
      isDataLoaded: false,
    }
  },
  computed: {
    ...mapGetters('tool', ['toolsTotalCount', 'tools', 'filters', 'isLoading']),
    paramsList() {
      return this.$store.state.tool.paramsList
    },
  },
  watch: {
    paramsList: {
      immediate: true,
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.ToolTableHeaders = [
            { title: '№', key: 'index', sortable: false },
            { title: 'Маркировка', key: 'name', sortable: true },
            { title: 'Характеристики', key: 'param', sortable: true },
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
    await this.$store.dispatch('tool/fetchParamsList')
    await this.fetchToolsByFilter()
    this.isDataLoaded = true
    console.log('Содержимое paramsList на момент монтажа:', this.paramsList)
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
      this.editingTool = {
        id: null,
        group_name: '',
        type_name: '',
        mat_name: '',
        name: '',
      }
      this.openDialog = true
    },
    onEditRow(event, { item: tool }) {
      this.editingTool = tool
      this.openDialog = true
    },
  },
}
</script>

<style scoped>
.narrow-column {
  max-width: 100px !important;
  font-size: 0.9em;
}

.index {
  max-width: 40px !important;
  font-size: 0.9em;
  color: grey;
}
</style>
