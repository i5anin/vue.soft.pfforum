<template>
  <v-container>
    <v-row>
      <!-- Комбобокс для выбора типа инструмента -->
      <v-col cols="12" md="4">
        <v-combobox
          v-model="selectedType"
          :items="types"
          item-text="name"
          item-value="id"
          label="Тип"
          return-object
        ></v-combobox>
      </v-col>

      <!-- Комбобокс для выбора группы инструмента -->
      <v-col cols="12" md="4">
        <v-combobox
          v-model="selectedGroup"
          :items="groups"
          item-text="name"
          item-value="id"
          label="Группа"
          return-object
        ></v-combobox>
      </v-col>

      <!-- Комбобокс для выбора материала инструмента -->
      <v-col cols="12" md="4">
        <v-combobox
          v-model="selectedMaterial"
          :items="materials"
          item-text="name"
          item-value="id"
          label="Материал"
          return-object
        ></v-combobox>
      </v-col>
    </v-row>

    <v-row>
      <v-col class="pa-3">
        <v-text-field
          v-model="filters.search"
          label="Поиск"
          outlined
          :clearable="true"
          @input="onSearch"
        ></v-text-field>
      </v-col>
      <v-col class="pa-3 text-right">
        <v-btn color="blue" @click="onAddTool">Новый инструмент</v-btn>
      </v-col>
    </v-row>
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
      <template class="gray" v-slot:item.index="{ index }">
        <span style="color: gray; font-size: 0.7em">{{ index + 1 }}</span>
      </template>
      <template v-slot:item.type_name="{ item }">
        <span :style="item.type.name === '[нет данных]' ? 'color: red;' : ''">{{
          item.type.name
        }}</span>
      </template>

      <template v-slot:item.group_name="{ item }">
        <span
          :style="item.group.name === '[нет данных]' ? 'color: red;' : ''"
          >{{ item.group.name }}</span
        >
      </template>

      <template v-slot:item.mat_name="{ item }">
        <span :style="item.mat.name === '[нет данных]' ? 'color: red;' : ''">{{
          item.mat.name
        }}</span>
      </template>
      <template v-slot:item.geometry="{ item }">
        <td>{{ item.spec.geometry }}</td>
      </template>
      <template v-slot:item.radius="{ item }">
        <td class="narrow-column">{{ item.spec.radius }}</td>
      </template>
      <template v-slot:item.diam="{ item }">
        <td class="narrow-column">{{ item.spec.diam }}</td>
      </template>
      <template v-slot:item.shag="{ item }">
        <td class="narrow-column">
          {{ item.spec.shag !== '0' ? item.spec.shag : '' }}
        </td>
      </template>
      <template v-slot:item.gabarit="{ item }">
        <td class="narrow-column">
          {{ item.spec.gabarit !== '0' ? item.spec.gabarit : '' }}
        </td>
      </template>
      <template v-slot:item.width="{ item }">
        <td class="narrow-column">
          {{ item.spec.width !== '0' ? item.spec.width : '' }}
        </td>
      </template>

      <template v-slot:item.name="{ item }">
        <span style="white-space: nowrap">{{ item.name }}</span>
      </template>
    </v-data-table-server>
  </v-container>
</template>

<script>
import EditToolModal from '@/modules/tool/components/EditToolModal.vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import { mapActions, mapMutations, mapGetters } from 'vuex'
import { ToolTableHeaders } from '@/modules/tool/components/config'

export default {
  emits: ['changes-saved', 'canceled'],
  components: { VDataTableServer, EditToolModal },
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
    ...mapMutations('tool', ['setCurrentPage', 'setItemsPerPage', 'setSearch']),
    async onChangePage(page) {
      this.setCurrentPage(page)
      await this.fetchToolsByFilter()
    },
    async onSearch(event) {
      this.setSearch(event.target.value)
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
        geometry: '',
        radius: 0,
        shag: 0,
        gabarit: 0,
        width: 0,
        diam: 0,
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
</style>
