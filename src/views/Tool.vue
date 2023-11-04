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
    <v-data-table
      :headers='headers'
      :items='tools'
      :server-items-length='totalTools'
      :items-per-page='itemsPerPage'
      :page.sync='currentPage'
      :loading='loading'
      @update:page='fetchTools'
      @update:items-per-page='updateItemsPerPage'
      @click:row='onEditRow'
      class='elevation-1'
      hover
      :items-per-page-options='[50, 100, 300]'
    >
      <template v-slot:item.type_name='{ item }'>
        {{ item.type_name }}
      </template>
      <template v-slot:item.group_name='{ item }'>
        {{ item.group_name }}
      </template>
      <template v-slot:item.mat_name='{ item }'>
        {{ item.mat_name }}
      </template>
      <template v-slot:item.rad='{ item }'>
        {{ item.rad }}
      </template>
      <template v-slot:item.name='{ item }'>
        {{ item.name }}
      </template>
      <template v-slot:item.kolvo_sklad='{ item }'>
        {{ item.kolvo_sklad }}
      </template>
      <template v-slot:item.norma='{ item }'>
        {{ item.norma }}
      </template>
      <template v-slot:item.zakaz='{ item }'>
        {{ item.zakaz }}
      </template>
    </v-data-table>
  </v-container>
</template>
<script>
import EditToolModal from '@/modules/tool/components/EditToolModal.vue'
import { fetchTools, updateTool } from '@/api/api'
import { VDataTable } from 'vuetify/labs/VDataTable'

export default {
  components: { VDataTable, EditToolModal },
  data() {
    return {
      openDialog: false,
      tools: [],
      editingTool: null,
      radiusOptions: [0.2, 0.4, 0.6, 0.8, 1.0, 1.2],
      headers: [
        { title: 'Название(Тип)', key: 'type_name', sortable: true },
        { title: 'Группа', key: 'group_name', sortable: true },
        { title: 'Применяемость материала', key: 'mat_name' , sortable: true},
        { title: 'Радиус', key: 'rad', sortable: true },
        { title: 'Маркировка', key: 'name', sortable: true },
        { title: 'Количество на складе', key: 'kolvo_sklad', sortable: true },
        { title: 'Нормальный запас на неделю', key: 'norma', sortable: true },
        { title: 'Заказ', key: 'zakaz', sortable: true },
      ],
      response: {
        page: 1,
        totalPages: 15,
        totalElements: 150,
        pageSize: 10,
        data: [], // tools[]
      },
      toolsResponse: [{
        group: {
          name: 'Пластина',
          id: 1,
        },
        id: null,
        kolvo_sklad: 101,
        mat: null,
        name: 'новое имя инструмента',
        norma: 1201,
        rad: 0.8,
        type_id: 1,
        zakaz: 1301,
      }],
      putResponse: {
        group_id: 1,
        id: null,
        kolvo_sklad: 101,
        mat_id: 2,
        name: 'новое имя инструмента',
        norma: 1201,
        rad: 0.8,
        type_id: 1,
        zakaz: 1301,
      },
      totalTools: 0,
      itemsPerPage: 10,
      currentPage: 1,
      loading: false,
    }
  },
  async created() {
    await this.fetchTools()
  },
  methods: {
    async fetchTools(page = this.currentPage, itemsPerPage = this.itemsPerPage) {
      this.loading = true
      const rawData = await fetchTools('', page, itemsPerPage)
      this.tools = this.processToolsData(rawData)
      console.log(rawData)
      this.totalTools = rawData.total
      this.loading = false
    },


    updateItemsPerPage(itemsPerPage) {
      this.itemsPerPage = itemsPerPage
      this.fetchTools()
    },
    processToolsData(rawData) {
      return rawData.tools.map(tool => {
        const group = rawData.groups.find(group => group.id === tool.group_id)
        const material = rawData.materials.find(material => material.id === tool.mat_id)
        const type = rawData.types.find(type => type.id === tool.type_id)
        return {
          ...tool,
          group_name: group ? group.group_name : '',
          mat_name: material ? material.mat_name : '',
          type_name: type ? type.type_name : '',
        }
      })
    },
    onClosePopup() {
      this.openDialog = false
    },
    async onSaveChanges() {
      this.openDialog = false
      await this.fetchTools()

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
