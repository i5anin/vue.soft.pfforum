<template>
  <v-container>
    <v-row cols="12" sm="4">
      <v-col v-for="filter in filterParamsList" :key="filter.key">
        <v-select
          :label="filter.label"
          :items="filter.values"
          v-model="filters[filter.key]"
          @change="onParamsFilterUpdate"
        />
      </v-col>
    </v-row>

    <tool-filter :namespace="namespace">
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
      width="true"
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
        <td :class="colorClassGrey(item)" style="white-space: nowrap">
          {{ item.sklad }}
        </td>
      </template>
      <template v-slot:item.norma="{ item }">
        <td :class="colorClassGrey(item)" style="white-space: nowrap">
          {{ item.norma }}
        </td>
      </template>
      <template v-slot:item.zakaz="{ item }">
        <td :class="colorClassGrey(item)" style="white-space: nowrap">
          {{ calculateOrder(item) }}
        </td>
      </template>
      <template v-slot:item.limit="{ item }">
        <td :class="colorClassGrey(item)" style="white-space: nowrap">
          {{ item.limit }}
        </td>
      </template>
    </v-data-table-server>
  </v-container>
</template>

<script>
import EditToolModal from './Modal.vue'
import ToolFilter from '@/modules/tool/components/ToolFilter.vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import { toolApi } from '@/api'
import { toolEditorApi } from '@/modules/editor-tool/api/editor'

export default {
  emits: [
    'changes-saved',
    'canceled',
    'page-changed',
    'page-limit-changed',
    'params-filter-changed',
  ],
  components: {
    VDataTableServer,
    EditToolModal,
    ToolFilter,
  },
  props: {
    parentId: {
      type: Number, // или String, в зависимости от типа идентификатора
      required: true,
    },
    // filterParamsList: {
    //   type: Array,
    //   default: () => [],
    // },
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
      filterParamsList: [
        // todo: срочно заменить на toolEditorApi.filterParamsByParentId(parent_id) = возвращает тоже самое по стуктуре но в динамике
        {
          key: '2',
          label: 'Группа',
          values: [
            '№6. 35 градусов двухгранная  "рыбка".',
            '№5. 55 градусов 4х-гранная ',
          ],
        },
        {
          key: '3',
          label: 'Материал',
          values: ['сталь', 'нержавеющая сталь'],
        },
        {
          key: '12',
          label: 'Радиус',
          values: ['0.4', '0.8'],
        },
      ],
      selectedValue: null,
      activeTabType: 'Catalog', // Например, 'Catalog', 'Sklad', 'Give' и т.д.
      openDialog: false,
      isDataLoaded: false,
      editingToolId: null, //редактирование идентификатора инструмента
      toolTableHeaders: [], //заголовки таблиц инструментов,
      toolsList: {},
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
          { title: 'Маркировка', key: 'name', sortable: false },
          ...(newVal && newVal.length > 0
            ? newVal.map((param) => ({
                title: param.label,
                key: param.key,
                sortable: true,
              }))
            : []),
          // { title: 'Действие', key: 'actions', sortable: false },
          { title: 'Норма', key: 'norma', sortable: false },
          { title: 'Склад', key: 'sklad', sortable: false },
          { title: 'Заказ', key: 'zakaz', sortable: false },
          { title: 'Лимит', key: 'limit', sortable: false },
        ]
      },
    },
  },

  async mounted() {
    await this.fetchFilterParams()
  },
  methods: {
    async fetchFilterParams() {
      try {
        this.filterParamsList = await toolEditorApi.filterParamsByParentId(
          this.parentId
        ) // Предполагается, что API возвращает данные в подходящем формате
        this.isDataLoaded = true // Установите флаг загрузки данных, если это необходимо
      } catch (error) {
        console.error('Ошибка при загрузке параметров фильтрации:', error)
        // Обработайте ошибку, возможно, показав сообщение пользователю
      }
    },
    onParamsFilterUpdate() {
      // this.$emit(
      //   'params-filter-changed',
      //   this.paramsList.reduce(
      //     (acc, curr) =>
      //       curr.selectedValue
      //         ? { ...acc, [`param_${curr.key}`]: curr.selectedValue }
      //         : acc,
      //     {}
      //   )
      // )
      this.fetchTools()
    },
    onIssueTool(event, item) {
      event.stopPropagation() // Предотвратить всплытие события
      console.log('Выдать инструмент:', item)
    },
    calculateOrder(tool) {
      if (tool.norma != null) return tool.norma - tool.sklad
    },
    colorClassGrey(item) {
      return { grey: !item.sklad || item.sklad === 0 }
    },
    onChangePage(page) {
      this.filters.currentPage = page
      this.fetchTools()
    },
    onUpdateItemsPerPage(itemsPerPage) {
      this.filters.itemsPerPage = itemsPerPage
      this.fetchTools()
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
    fetchTools() {
      // Предполагается, что toolApi.getTools включает возможность передачи параметров фильтрации
      toolApi
        .getTools({ ...this.filters })
        .then((data) => {
          this.formattedTools = data.tools
          this.toolsTotalCount = data.totalCount
        })
        .catch((error) => {
          console.error('Ошибка при получении данных инструментов:', error)
        })
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
</style>
