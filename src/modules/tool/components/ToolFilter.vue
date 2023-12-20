<template>
  <v-row>
    <v-col cols="12" md="3">
      <v-text-field
        v-model="filterModel.search"
        label="Маркировка"
        outlined
        :clearable="true"
      />
    </v-col>
    <v-col cols="12" md="2">
      <v-combobox
        :chips="true"
        multiple
        v-model="filterModel.types"
        :items="typeOptions"
        item-text="name"
        item-value="id"
        label="Тип"
        return-object
      />
    </v-col>
    <v-col cols="12" md="2">
      <v-combobox
        :chips="true"
        multiple
        v-model="filterModel.groups"
        :items="groupOptions"
        item-text="name"
        item-value="id"
        label="Группа"
        return-object
      />
    </v-col>
    <v-col cols="12" md="2">
      <v-combobox
        :chips="true"
        multiple
        v-model="filterModel.materials"
        :items="materialOptions"
        item-text="name"
        item-value="id"
        label="Материал"
        return-object
      />
    </v-col>
    <v-col cols="12" md="3">
      <v-combobox
        :chips="true"
        multiple
        v-model="filterModel.selectedParams"
        :items="paramsOptions"
        label="Параметры"
        return-object
      />
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12" md="3">
      <v-checkbox
        label="Незаполненные данные"
        v-model="filterModel.includeNull"
        :color="checkboxColor"
      />
    </v-col>
    <v-col cols="12" md="3">
      <v-checkbox label="Склад" v-model="Sklad" :color="checkboxSklad" />
    </v-col>
    <v-col class="pa-3 text-right">
      <slot name="default" />
    </v-col>
  </v-row>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  name: 'ToolFilter',
  data: () => ({
    filterModel: null,
  }),
  computed: {
    ...mapGetters('tool', [
      'filters',
      'groupOptions',
      'materialOptions',
      'typeOptions',
      'paramsOptions',
    ]),
    checkboxColor() {
      return this.filters.includeNull ? 'red' : ''
    },
  },
  watch: {
    filters: {
      immediate: true,
      handler(filters) {
        if (this.filterModel != null) {
          return
        }
        this.filterModel = filters
      },
    },
    filterModel: {
      deep: true,
      handler(filters) {
        // console.log(filters)
        this.setFilters({ ...filters })
        this.fetchToolsByFilter()
      },
    },
  },
  methods: {
    ...mapActions('tool', ['fetchToolsByFilter']),
    ...mapMutations('tool', ['setFilters']),
  },
}
</script>

<style scoped></style>
