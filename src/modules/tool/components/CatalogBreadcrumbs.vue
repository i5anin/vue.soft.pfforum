<template>
  <!-- Интеграция хлебных крошек -->
  <!-- <div class="breadcrumbs">-->
  <div>
    <span v-for="(item, index) in tree" :key="index">
      <span :class="getBreadcrumbClass(index)" @click="goTo(index)">
        {{ item.label }}
        <span v-if="item.available !== 0"> ({{ item.available }}) </span>
      </span>
      <span v-if="index < tree.length - 1"> &nbsp;&nbsp;/&nbsp;&nbsp; </span>
    </span>
  </div>

  <!-- Отображение списка элементов -->
  <div v-if="currentItem && currentItem.nodes">
    <v-list-item
      v-for="item in currentItem.nodes"
      :key="item.id"
      @click="selectItem(item)"
      class="align-center"
    >
      <div class="flex">
        <v-icon color="info" icon="mdi-folder" class="icon" />
        <v-list-item-title>
          {{ item.label }}
          <span v-if="item.available !== 0"> ({{ item.available }}) </span>
        </v-list-item-title>
      </div>
    </v-list-item>
  </div>
</template>

<script>
export default {
  name: 'CatalogBreadcrumbs',
  emits: ['go-to', 'item-selected'],
  props: {
    tree: {
      type: Array,
      default: () => [],
    },
    currentItem: {
      type: Object,
      default: () => null,
    },
  },
  methods: {
    getBreadcrumbClass(index) {
      return {
        'breadcrumbs-item': index < this.tree.length - 1,
        'breadcrumbs-item-final': index === this.tree.length - 1,
      }
    },
    goTo(index) {
      this.$emit('go-to', index)
    },
    async selectItem(item) {
      this.$emit('item-selected', item)
    },
  },
}
</script>

<style scoped>
/* Стили для хлебных крошек */
.breadcrumbs-item-final {
  color: grey;
}

.flex {
  display: flex;
}

.icon {
  margin-right: 10px;
}
</style>
