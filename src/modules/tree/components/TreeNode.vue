<template>
  <v-list-item>
    <div class="tree-node">
      <v-btn
        variant="plain"
        density="compact"
        icon
        :disabled="!node.nodes || node.nodes.length === 0"
        @click="toggleNode"
      >
        <v-icon size="x-small">
          {{ expanded ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
        </v-icon>
      </v-btn>
      <v-icon class="pl-4 pr-4" :color="appColor" icon="mdi-folder" />

      <span :class="{ 'text-grey': node.totalElements === 0 }">
        {{ node.label }}
        <span v-if="node.available !== 0">
          <v-chip class="ma-2" color="secondary" label>
            <!-- <template #prepend>-->
            <!-- <v-icon icon="mdi-box-cutter" start />–>-->
            <!-- </template>-->
            {{ node.available }} / {{ node.elements }}
          </v-chip>
        </span>
      </span>
      <div v-if="expanded && node.nodes && node.nodes.length" class="pl-3">
        <tree-node
          v-for="child in node.nodes"
          :key="child.id"
          :node="child"
          :expanded="expanded"
          @toggle-node="$emit('toggle-node', child.id)"
        />
      </div>
    </div>
  </v-list-item>
</template>

<script>
export default {
  name: 'TreeNode',
  props: {
    node: { type: Object, required: true },
    // Добавляем prop 'expanded' для управления состоянием раскрытия
    expanded: { type: Boolean, default: false },
  },
  computed: {
    appColor() {
      return import.meta.env.VITE_NODE_ENV === 'build'
        ? import.meta.env.VITE_BUILD_COLOR
        : import.meta.env.VITE_DEV_COLOR
    },
  },
  methods: {
    toggleNode() {
      // Испускаем событие 'toggle-node' с ID узла
      this.$emit('toggle-node', this.node.id)
    },
  },
}
</script>
