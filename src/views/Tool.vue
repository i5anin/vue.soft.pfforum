<template>
  <v-container>
    <v-col class='pa-3 text-right'>
      <v-btn color='blue' @click='onAddTool'>Новый инструмент</v-btn>
    </v-col>
    <edit-tool-modal
      v-if='openDialog'
      v-bind='{ tool: editingTool, persistent: true, radiusOptions: radiusOptions }'
      @canceled='onClosePopup'
      @changes-saved='onSaveChanges'
    />
    <v-data-table-server
      :headers='headers'
      :items='tools'
      :itemsLength='totalTools'
      :items-per-page='itemsPerPage'
      :page.sync='currentPage'
      :loading='loading'
      @update:page='getToolsTab'
      @update:items-per-page='updateItemsPerPage'
      @click:row='onEditRow'
      class='elevation-1'
      hover
      :items-per-page-options='[15, 50, 100, 300]'
    >
      <template v-slot:item.type_name='{ item }'> {{ item.type.name }}</template>
      <template v-slot:item.group_name='{ item }'> {{ item.group.name }}</template>
      <template v-slot:item.mat_name='{ item }'> {{ item.mat.name }}</template>
      <template v-slot:item.rad='{ item }'> {{ item.rad }}</template>
      <template v-slot:item.name='{ item }'> {{ item.name }}</template>
      <template v-slot:item.kolvo_sklad='{ item }'> {{ item.kolvo_sklad }}</template>
      <template v-slot:item.norma='{ item }'> {{ item.norma }}</template>
      <template v-slot:item.zakaz='{ item }'> {{ item.zakaz }}</template>
    </v-data-table-server>
  </v-container>
</template>

<script>
import EditToolModal from '@/modules/tool/components/EditToolModal.vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import { getTools } from '@/api/api'

export default {
  components: { VDataTableServer, EditToolModal },
  data() {
    return {
      openDialog: false,
      tools: [],
      editingTool: null,
      radiusOptions: [0.2, 0.4, 0.6, 0.8, 1.0, 1.2],
      headers: [
        { title: 'Название(Тип)', key: 'type_name', sortable: true },
        { title: 'Группа', key: 'group_name', sortable: true },
        { title: 'Применяемость материала', key: 'mat_name', sortable: true },
        { title: 'Радиус', key: 'rad', sortable: true },
        { title: 'Маркировка', key: 'name', sortable: true },
        { title: 'Количество на складе', key: 'kolvo_sklad', sortable: true },
        { title: 'Нормальный запас на неделю', key: 'norma', sortable: true },
        { title: 'Заказ', key: 'zakaz', sortable: true },
      ],
      totalTools: 0,
      itemsPerPage: 15,
      currentPage: 1,
      loading: false,
    }
  },
  async mounted() {
    await this.getToolsTab()
  },
  methods: {
    async getToolsTab(page = this.currentPage, itemsPerPage = this.itemsPerPage) {
      this.loading = true
      try {
        const response = await getTools('', page, itemsPerPage)  // Передача 'page' и 'itemsPerPage' в 'getTools'
        this.currentPage = page
        this.tools = response.tools
        this.totalTools = response.totalCount
      } catch (error) {
        console.error('There has been a problem with your fetch operation:', error)
      } finally {
        this.loading = false
      }
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
        id: null, group_name: '', type_name: '', mat_name: '', name: '', kolvo_sklad: 0, norma: 0, zakaz: 0, rad: 0,
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
