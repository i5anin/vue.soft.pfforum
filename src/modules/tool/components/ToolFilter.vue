<template>
  <v-row>
    <v-col cols="12" md="3">
      <!--      <v-text-field-->
      <!--        v-model="filterModel.search"-->
      <!--        label="Маркировка (поиск по всем)"-->
      <!--        outlined-->
      <!--        :clearable="true"-->
      <!--      />-->
    </v-col>
    <!--    <v-col cols="12" md="2">-->
    <!--      <v-combobox-->
    <!--        :chips="true"-->
    <!--        multiple-->
    <!--        v-model="filterModel.types"-->
    <!--        item-text="name"-->
    <!--        item-value="id"-->
    <!--        label="Тип"-->
    <!--        return-object-->
    <!--      />-->
    <!--    </v-col>-->
    <!--    <v-col cols="12" md="2">-->
    <!--      <v-combobox-->
    <!--        :chips="true"-->
    <!--        multiple-->
    <!--        v-model="filterModel.groups"-->
    <!--        item-text="name"-->
    <!--        item-value="id"-->
    <!--        label="Группа"-->
    <!--        return-object-->
    <!--      />-->
    <!--    </v-col>-->
    <!--    <v-col cols="12" md="2">-->
    <!--      <v-combobox-->
    <!--        :chips="true"-->
    <!--        multiple-->
    <!--        v-model="filterModel.materials"-->
    <!--        item-text="name"-->
    <!--        item-value="id"-->
    <!--        label="Материал"-->
    <!--        return-object-->
    <!--      />-->
    <!--    </v-col>-->
    <!--    <v-col cols="12" md="3">-->
    <!--      <v-combobox-->
    <!--        :chips="true"-->
    <!--        multiple-->
    <!--        v-model="filterModel.selectedParams"-->
    <!--        :items="paramsOptions"-->
    <!--        label="Параметры"-->
    <!--        return-object-->
    <!--      />-->
    <!--    </v-col>-->
  </v-row>
  <v-row>
    <v-col cols="12" md="3">
      <!--      <v-checkbox-->
      <!--        label="Незаполненные данные"-->
      <!--        v-model="filterModel.includeNull"-->
      <!--        :color="checkboxColor"-->
      <!--      />-->
    </v-col>
    <v-col cols="12" md="3">
      <!-- <v-checkbox label="Склад" v-model="Sklad" :color="checkboxSklad" />-->
    </v-col>
    <v-col class="pa-3 text-right">
      <slot name="default" />
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'ToolFilter',
  props: {
    namespace: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    filterModel: {
      search: '',
    },
  }),
  computed: {
    filters() {
      // console.log(this.$store.getters)
      return this.$store.getters[`${this.namespace}/filters`]
    },
    paramsOptions() {
      return this.$store.getters[`${this.namespace}/paramsOptions`]
    },
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
        this.setFilters({ ...filters })
        this.fetchToolsByFilter()
      },
    },
  },
  methods: {
    fetchToolsByFilter() {
      this.$store.actions[`${this.namespace}/fetchToolsByFilter`]()
    },
    setFilters(filters) {
      this.$store.mutations[`${this.namespace}/setFilters`](filters)
    },
  },
}
</script>

<style scoped></style>
