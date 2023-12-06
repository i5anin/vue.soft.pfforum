<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="filters.search"
          label="Маркировка"
          outlined
          :clearable="true"
          @input="onSearch"
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-combobox
          :chips="true"
          multiple
          v-model="selectedType"
          :items="typeOptions"
          item-text="name"
          item-value="id"
          label="Тип"
          return-object
          @change="applyFilters"
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-combobox
          :chips="true"
          multiple
          v-model="selectedGroup"
          :items="groupOptions"
          item-text="name"
          item-value="id"
          label="Группа"
          return-object
          @change="applyFilters"
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-combobox
          :chips="true"
          multiple
          v-model="selectedMaterial"
          :items="materialOptions"
          item-text="name"
          item-value="id"
          label="Материал"
          return-object
          @change="applyFilters"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-combobox
          :chips="true"
          multiple
          v-model="selectedParams"
          :items="paramsOptions"
          label="Параметры"
          return-object
          @change="applyFilters"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="3">
        <v-checkbox
          label="Незаполненные данные"
          v-model="isCheckboxChecked"
          :color="checkboxColor"
        />
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
      <template v-slot:item.index="{ index }">
        <td class="index">
          {{ index + 1 }}
        </td>
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
      <template v-slot:item.name="{ item }">
        <span style="white-space: nowrap">{{ item.name }}</span>
      </template>
      <template v-for="paramId in selectedParams" :key="paramId">
        <div>
          <v-text-field
            :label="toolParams.find((param) => param.id === paramId).info"
            v-model="selectedParamsValues[paramId]"
            @input="updateParamValue(paramId, $event)"
          />
        </div>
      </template>
    </v-data-table-server>
  </v-container>
</template>

<script>
import EditToolModal from '@/modules/tool/components/EditToolModal.vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import { mapActions, mapMutations, mapGetters } from 'vuex'
import { ToolTableHeaders } from '@/modules/tool/components/config'
import { getLibraries, getToolParams } from '@/api'

export default {
  emits: ['changes-saved', 'canceled'],
  components: { VDataTableServer, EditToolModal },
  data() {
    return {
      openDialog: false,
      isCheckboxChecked: false,

      ToolTableHeaders,

      editingTool: null,
      selectedType: null,
      selectedGroup: null,
      selectedMaterial: null,

      selectedParamsValues: {},

      paramsData: '',
      toolParams: [],
      typeOptions: [],
      groupOptions: [],
      paramsOptions: [],
      selectedParams: [],
      materialOptions: [],
    }
  },
  computed: {
    ...mapGetters('tool', ['toolsTotalCount', 'tools', 'filters', 'isLoading']),
    checkboxColor() {
      return this.isCheckboxChecked ? 'red' : ''
    },
  },
  async mounted() {
    await this.fetchToolsByFilter()
    await this.fetchUniqueToolSpecs()
    this.toolParams = await getToolParams()
    try {
      const rawData = await getLibraries()
      const paramsData = await getToolParams()

      this.typeOptions = rawData.types.map((type) => type.name)
      this.groupOptions = rawData.groups.map((group) => group.name)
      this.materialOptions = rawData.materials.map((material) => material.name)
      this.paramsOptions = paramsData.map((param) => param.info)
    } catch (error) {
      console.error('Ошибка при получении данных:', error)
    }
  },
  watch: {
    selectedType: 'onFilterChange',
    selectedGroup: 'onFilterChange',
    selectedMaterial: 'onFilterChange',

    'filters.search': 'onFilterChange',
    'filters.currentPage': 'onFilterChange',
    'filters.itemsPerPage': 'onFilterChange',
    isCheckboxChecked(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.setIncludeNull(newVal)
        this.applyFilters()
      }
    },
  },
  methods: {
    updateParamValue(paramId, value) {
      this.$set(this.selectedParamsValues, paramId, value)
    },
    ...mapActions('tool', ['fetchToolsByFilter', 'fetchUniqueToolSpecs']),
    ...mapMutations({
      setIncludeNull: 'tool/setIncludeNull', // Add your namespaced mutation here
      setCurrentPage: 'tool/setCurrentPage',
      setItemsPerPage: 'tool/setItemsPerPage',
      setSearch: 'tool/setSearch',
    }),

    async applyFilters() {
      console.log('Checkbox value:', this.isCheckboxChecked)
      const filters = {
        type: this.selectedType?.id,
        group: this.selectedGroup?.id,
        material: this.selectedMaterial?.id,
        search: this.filters.search,
        page: this.filters.currentPage,
        limit: this.filters.itemsPerPage,
        includeNull: this.isCheckboxChecked,
      }
      console.log('Filters:', filters)
      await this.fetchToolsByFilter(filters)
      this.setIsLoading(false)
    },
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
