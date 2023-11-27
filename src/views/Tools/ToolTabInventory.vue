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
    </v-row>
    <edit-tool-sklad-modal
      v-if="openDialog"
      :tool="editingTool"
      @canceled="onClosePopup"
      @changes-saved="onSaveChanges"
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
      :items-per-page-options='[15, 50, 100, 300]'
      density='compact'
      @update:page='getToolsTab'
      @update:items-per-page='updateItemsPerPage'
      @click:row='onEditRow'
      class='elevation-1'
      hover
      fixed-header
      headers
      width
    >
      <!--      <template class='gray' v-slot:item.index='{ index }'>-->
      <!--        <span style='color: gray; font-size: 0.7em;'>{{ index + 1 }}</span>-->
      <!--      </template>-->
      <template v-slot:item.type_name='{ item }'>
        <span :style="item.type.name === '[нет данных]' ? 'color: red;' : ''">{{ item.type.name }}</span>
      </template>
      <template v-slot:item.group_name='{ item }'>
        <span :style="item.group.name === '[нет данных]' ? 'color: red;' : ''">{{ item.group.name }}</span>
      </template>
      <template v-slot:item.mat_name='{ item }'>
        <span :style="item.mat.name === '[нет данных]' ? 'color: red;' : ''">{{ item.mat.name }}</span>
      </template>
      <template v-slot:item.kolvo_sklad='{ item }'>
        <td class='narrow-column'>{{ item.kolvo_sklad }}</td>
      </template>
      <template v-slot:item.norma='{ item }'>
        <td class='narrow-column'>{{ item.norma }}</td>
      </template>
      <template v-slot:item.zakaz='{ item }'>
        <td class='narrow-column'>{{ item.zakaz }}</td>
      </template>


      <template v-slot:item.name='{ item }'>
        <span style='white-space: nowrap;'>{{ item.name }}</span>
      </template>


    </v-data-table-server>
  </v-container>
</template>

<script>
import EditToolSkladModal from '@/modules/tool/components/EditToolSkladModal.vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import { getToolsWithInventoryInfo  } from '@/api'

export default {
  emits: ['changes-saved', 'canceled'],
  components: { VDataTableServer, EditToolSkladModal },
  data() {
    return {
      openDialog: false,
      editingTool: null,
      tools: [],
      headers: [
        // { title: '№', key: 'index', sortable: false },

        { title: 'Название(Тип)', key: 'type_name', sortable: true },
        { title: 'Группа', key: 'group_name', sortable: true },
        { title: 'Применяемость материала', key: 'mat_name', sortable: true },
        { title: 'Маркировка', key: 'name', sortable: true },

        { title: 'Склад', key: 'kolvo_sklad', sortable: true },
        { title: 'Норма', key: 'norma', sortable: true },
        { title: 'Заказ', key: 'zakaz', sortable: true },

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
        const response = await getToolsWithInventoryInfo(search, page, itemsPerPage) // Обновленный вызов функции
        this.currentPage = page
        this.tools = response.tools
        this.totalTools = response.totalCount

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
      this.editingTool = { ...tool }; // Копируйте объект tool в editingTool
      this.openDialog = true;
    },
  },
}
</script>

<style scoped>
.narrow-column {
  max-width: 100px !important;
  font-size: 0.9em;
}
</style>


