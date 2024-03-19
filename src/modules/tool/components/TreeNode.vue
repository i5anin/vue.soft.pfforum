<template>
  <v-list-item>
    <div class="tree-node">
      <!-- Добавляем кнопку для сворачивания/разворачивания -->
      <v-btn density="compact" icon @click.stop="toggle">
        <v-icon>
          {{ isExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
        </v-icon>
      </v-btn>

      <v-icon :color="appColor">mdi-folder</v-icon>
      <span>
        {{ node.label }}
        <span v-if="node.elements !== 0">
          [ Доступно: {{ node.available }} / {{ node.elements }} ]
        </span>
        <span class="node-id">id: {{ node.id }} </span>
      </span>

      <!-- Отображаем дочерние узлы только если isExpanded истина -->
      <div v-if="isExpanded && node.nodes && node.nodes.length">
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
      return import.meta.env.VITE_NODE_ENV === 'build' ? 'blue-grey' : 'primary'
    },
  },
}
</script>

<style scoped>
.tree-node {
  //display: flex;
  align-items: center;
  position: relative;
}

.node-content {
  display: flex;
  align-items: center;
  min-height: 40px;
}

.child-node {
  padding-left: 20px;
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

.node-id {
  color: grey;
}
</style>
