<template>
  <v-list-item>
    <div class="tree-node">
      <!-- Отображение текущего узла -->
      <v-list-item-content class="node-content">
        <v-icon color="info">mdi-folder</v-icon>
        <span>{{ node.label }}</span>
      </v-list-item-content>

      <!-- Рекурсивное отображение дочерних узлов -->
      <v-list-item-group v-if="node.nodes && node.nodes.length">
        <tree-node
          v-for="child in node.nodes"
          :key="child.id"
          :node="child"
          class="child-node"
        />
      </v-list-item-group>
    </div>
  </v-list-item>
</template>

<script>
export default {
  name: 'TreeNode',
  props: {
    node: Object,
  },
}
</script>

<style scoped>
.tree-node {
  position: relative;
}

.node-content {
  display: flex;
  align-items: center;
  //padding-left: 20px;
  //margin-bottom: 10px;
}

.child-node {
  padding-left: 20px;
  border-left: 1px solid #989898;
}

.child-node::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 20px;
  border-bottom: 1px solid #989898;
}
</style>
