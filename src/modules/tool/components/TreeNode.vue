<template>
  <v-list-item>
    <div className="tree-node">
      <div className="node-content">
        <v-icon color="info">mdi-folder</v-icon>
        <span>
          {{ node.label }}
          <span v-if="node.elements !== 0">
            [ Доступно: {{ node.available }} / {{ node.elements }} ]
          </span>
          <span class="node-id">id: {{ node.id }} </span>
        </span>
      </div>
      <div v-if="node.nodes && node.nodes.length">
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
}
</script>

<style scoped>
.tree-node {
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

.child-node::after {
  content: '';
  position: absolute;
  left: -1px;
  top: 24px;
  width: 1px;
  background: rgb(var(--v-theme-background));
}
</style>
