<template>
  <v-list-item>
    <div class="tree-node">
      <v-btn
        variant="plain"
        density="compact"
        icon
        @click.stop="toggle"
        :disabled="!node.nodes || node.nodes.length === 0"
      >
        <v-icon size="x-small">
          {{ isExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
        </v-icon>
      </v-btn>
      <v-icon class="pl-4 pr-4" :color="appColor" icon="mdi-folder" />

      <span :class="{ 'text-grey': node.totalElements === 0 }">
        {{ node.label }}
        <span v-if="node.available !== 0">
          <v-chip class="ma-2" color="secondary" label>
            <template v-slot:prepend>
              <v-icon icon="mdi-wrench-check" start />
            </template>
            {{ node.available }} / {{ node.elements }}
          </v-chip>

          <!-- {{ node.totalElements }}  -->
          <!-- {{ node.totalAvailable }} -->
        </span>
        <span class="node-id">id: {{ node.id }} </span>
      </span>

      <div class="pl-3" v-if="isExpanded && node.nodes && node.nodes.length">
        <tree-node
          v-for="child in node.nodes"
          :key="child.id"
          :node="child"
          class="child-node"
        />
      </div>
    </div>
  </v-list-item>
</template>

<script>
export default {
  name: 'TreeNode',
  props: ['node'],
  data() {
    return {
      isExpanded: false, // Добавляем состояние для отслеживания свернуто/развернуто
    }
  },
  methods: {
    toggle() {
      this.isExpanded = !this.isExpanded // Меняем состояние при клике
    },
  },
  computed: {
    appColor() {
      return import.meta.env.VITE_NODE_ENV === 'build'
        ? import.meta.env.VITE_BUILD_COLOR
        : import.meta.env.VITE_DEV_COLOR
    },
  },
}
</script>

<style scoped>
.child-node {
  padding-left: 20px;
  border-left: 1px solid #989898;
}

.child-node::before {
  content: '';
  position: absolute;
  left: 0;
  top: 20px;
  width: 20px;
  border-bottom: 1px solid #989898;
}

.node-id {
  color: grey;
}

.text-grey {
  color: grey;
}
.pl-3 {
  padding-left: 43px !important;
}
</style>
