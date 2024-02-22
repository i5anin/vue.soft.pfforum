<template>
  <div>
    Фильтры: {{ filterParamsList }}
    <v-row cols="12" sm="4">
      <v-col v-for="filter in filterParamsList" :key="filter.key">
        <v-select
          clearable="true"
          :label="filter.label"
          :items="filter.values"
          v-model="filters[filter.key]"
          @update:model-value="$emit('filter-update', filters)"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  props: {
    filterParamsList: {
      type: Array,
      default: () => [],
    },
    filters: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['filter-update'],
}
</script>
