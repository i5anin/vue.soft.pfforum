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
        { text: 'Название(Тип)', value: 'type_name' },
        { text: 'Группа', value: 'group_name' },
        { text: 'Применяемость материала', value: 'mat_name' },
        { text: 'Радиус', value: 'rad' },
        { text: 'Маркировка', value: 'name' },
        { text: 'Количество на складе', value: 'kolvo_sklad' },
        { text: 'Нормальный запас на неделю', value: 'norma' },
        { text: 'Заказ', value: 'zakaz' },
      ],
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
    async onSaveChanges(editedTool) {
      this.openDialog = false
      const updatedTool = await updateTool(editedTool.id, editedTool)
      if (updatedTool) {
        await this.fetchTools()
      }
    },
    onAddTool() {
      this.editingTool = {
        id: null, group_name: '', type_name: '', mat_name: '', name: '', kolvo_sklad: 0, norma: 0, zakaz: 0, rad: 0,
      }
      this.openDialog = true
    },
    onEditRow(tool) {
      this.editingTool = tool
      this.openDialog = true
    },
  },
}
</script>
