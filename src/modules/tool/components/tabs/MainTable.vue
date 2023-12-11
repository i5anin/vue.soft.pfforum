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
      noDataText="Нет данных"
      itemsPerPageText="Пункты на странице:"
      loadingText="Загрузка данных"
      :headers="ToolTableHeaders"
      :items="tools"
      :itemsLength="toolsTotalCount"
      :items-per-page="filters.itemsPerPage"
      :page.sync="filters.currentPage"
      :loading="isLoading"
      density="compact"
      :items-per-page-options="[15, 50, 100, 300]"
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
        <td class="index">
          {{ index + 1 }}
        </td>
      </template>
      <!--name-->
      <template v-slot:item.name="{ item }">
        <span style="white-space: nowrap">{{ item.name }}</span>
      </template>
      <!--type-->
      <template v-slot:item.type_name="{ item }">
        <span :style="item.type.name === null ? 'color: red;' : ''">
          {{ item.type.name === null ? 'null' : item.type.name }}
        </span>
      </template>
      <!--group-->
      <template v-slot:item.group_name="{ item }">
        <span :style="item.group.name === null ? 'color: red;' : ''">
          {{ item.group.name === null ? 'null' : item.group.name }}
        </span>
      </template>
      <!--mat-->
      <template v-slot:item.mat_name="{ item }">
        <span :style="item.mat.name === null ? 'color: red;' : ''">
          {{ item.mat.name === null ? 'null' : item.mat.name }}
        </span>
      </template>
      <!--property-->
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
import { ToolTableHeaders } from '@/modules/tool/components/config'
import ToolFilter from '@/modules/tool/components/ToolFilter.vue'

export default {
  emits: ['changes-saved', 'canceled'],
  components: { VDataTableServer, EditToolModal, ToolFilter },
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
      ToolTableHeaders,
    }
  },
  computed: {
    ...mapGetters('tool', ['toolsTotalCount', 'tools', 'filters', 'isLoading']),
  },
  async mounted() {
    await this.fetchToolsByFilter()
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
