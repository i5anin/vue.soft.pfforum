<template>
  <v-container>
    <v-row>
      <v-col class='pa-3'>
        <v-text-field
          v-model='searchQuery'
          label='Поиск'
          outlined
          clearable
          @input='onSearch'
        ></v-text-field>
      </v-col>
      <v-col class='pa-3 text-right'>
        <v-btn color='blue' @click='onAddTool'>Новый инструмент</v-btn>
      </v-col>
    </v-row>
    <edit-tool-modal
      v-if='openDialog'
      :tool='editingTool'
      :persistent='true'
      :radiusOptions='radiusOptions'
      @canceled='onClosePopup'
      @changes-saved='onSaveChanges'
    />
    <v-data-table-server
      noDataText='Нет данных'
      itemsPerPageText='Пункты на странице:'
      loadingText='Загрузка данных'
      :headers='headers'
      :items='tools'
      :itemsLength='totalTools'
      :items-per-page='itemsPerPage'
      :page.sync='currentPage'
      :loading='loading'
      density='compact'
      :items-per-page-options='[15, 50, 100, 300]'
      @update:page='getToolsTab'
      @update:items-per-page='updateItemsPerPage'
      @click:row='onEditRow'
      class='elevation-1'
      hover
      fixed-header
      headers
      width
    >
      <template class='gray' v-slot:item.index='{ index }'><span style='color: gray;'>{{ index + 1 }}</span></template>

      <template v-slot:item.type_name='{ item }'> {{ item.type.name }}</template>
      <template v-slot:item.group_name='{ item }'> {{ item.group.name }}</template>
      <template v-slot:item.mat_name='{ item }'> {{ item.mat.name }}</template>

      <template v-slot:item.radius='{ item }'> {{ item.spec.radius !== '0' ? item.spec.radius : '' }}</template>
      <template v-slot:item.diam='{ item }'> {{ item.spec.diam !== '0' ? item.spec.diam : '' }}</template>
      <template v-slot:item.shag='{ item }'> {{ item.spec.shag !== '0' ? item.spec.shag : '' }}</template>
      <template v-slot:item.gabarit='{ item }'> {{ item.spec.gabarit !== '0' ? item.spec.gabarit : '' }}</template>
      <template v-slot:item.width='{ item }'> {{ item.spec.width !== '0' ? item.spec.width : '' }}</template>

      <template v-slot:item.name='{ item }'> {{ item.name }}</template>

    </v-data-table-server>
  </v-container>
</template>

<script>
import EditToolModal from '@/modules/tool/components/EditToolModal.vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import { getTools } from '@/api'

export default {
  emits: ['changes-saved', 'canceled'],
  components: { VDataTableServer, EditToolModal },
  data() {
    return {
      openDialog: false,
      tools: [],
      editingTool: null,
      headers: [
        { title: '№', key: 'index', sortable: false },
        { title: 'Название(Тип)', key: 'type_name', sortable: true },
        { title: 'Группа', key: 'group_name', sortable: true },
        { title: 'Применяемость материала', key: 'mat_name', sortable: true },

        { title: 'Радиус', key: 'radius', sortable: true },
        { title: 'Диаметр', key: 'diam', sortable: true },
        { title: 'Шаг', key: 'shag', sortable: true },
        { title: 'Габариты', key: 'gabarit', sortable: true },
        { title: 'Вылет', key: 'width', sortable: true },

        { title: 'Маркировка', key: 'name', sortable: true },
      ],
      totalTools: 0,
      spec: 0,
      itemsPerPage: 15,
      currentPage: 1,
      loading: false,
      searchQuery: '',
    }
  },
  async mounted() {
    await this.getToolsTab()
  },
  methods: {
    async getToolsTab(page = this.currentPage, itemsPerPage = this.itemsPerPage, search = this.searchQuery) {
      this.loading = true
      try {
        const response = await getTools(search, page, itemsPerPage)
        this.currentPage = page
        this.tools = response.tools
        this.totalTools = response.totalCount
        this.spec = response.tools.spec

        console.log(response)
      } catch (error) {
        console.error('There has been a problem with your fetch operation:', error)
      } finally {
        this.loading = false
      }
    },
    onSearch() {
      this.getToolsTab()
    },
    updateItemsPerPage(itemsPerPage) {
      this.itemsPerPage = itemsPerPage
      this.getToolsTab()
    },
    onClosePopup() {
      this.openDialog = false
    },
    async onSaveChanges() {
      this.openDialog = false
      await this.getToolsTab()
    },
    onAddTool() {
      this.editingTool = {
        id: null, group_name: '', type_name: '', mat_name: '', name: '',
        radius: 0, shag: 0, gabarit: 0, width: 0, diam: 0,
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


