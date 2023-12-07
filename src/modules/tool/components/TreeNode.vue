<template>
  <div>
    <div>{{ node.label }}</div>
    <div v-if="node.nodes && node.nodes.length" class="child-nodes">
      <tree-node v-for="child in node.nodes" :key="child.id" :node="child" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'TreeNode',
  props: ['node'],
}
</script>

<style scoped>
.child-nodes {
  padding-left: 20px; /* Отступ для вложенных узлов */
}
</style>
