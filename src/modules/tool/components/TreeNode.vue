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
        <span v-if="node.totalElements !== 0">
          [ Доступно: {{ node.available }} / {{ node.elements }} ]
        </span>
        <span class="node-id">id: {{ node.id }} </span>
      </span>

      <div class="pl-3" v-if="isExpanded && node.nodes && node.nodes.length">
        <tree-node
          v-for="(child, index) in node.nodes"
          :key="child.id"
          :node="child"
          :class="{
            'child-node': true,
            'last-child-node': index === node.nodes.length - 1,
          }"
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
      return import.meta.env.VITE_NODE_ENV === 'build' ? 'blue-grey' : 'primary'
    },
  },
}
</script>

<style scoped>
.child-node {
  padding-left: 35px;
  border-left: 1px solid #989898;
}

.child-node::before {
  content: '';
  position: absolute;
  left: 0;
  top: 24px;
  width: 20px;
  border-bottom: 1px solid #989898;
}

.last-child-node::before {
  border-bottom: none; /* Убираем горизонтальную линию для последнего узла */
}

.node-id {
  color: grey;
}

.text-grey {
  color: grey;
}
</style>
