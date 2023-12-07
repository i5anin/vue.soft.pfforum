<template>
  <v-app>
    <v-main>
      <v-container>
        <!-- Рекурсивное отображение дерева -->
        <v-list-item-group>
          <tree-node v-for="node in treeData" :key="node.id" :node="node" />
        </v-list-item-group>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { getToolsTree } from '@/api'
import TreeNode from './TreeNode.vue'

export default {
  name: 'TreeView',
  components: {
    TreeNode,
  },
  data() {
    return {
      treeData: [], // Инициализация пустого массива для данных дерева
    }
  },
  async created() {
    const toolsTree = await getToolsTree()
    if (toolsTree && toolsTree.length > 0) {
      this.treeData = toolsTree
    }
  },
}
</script>

<style scoped>
.flex {
  display: flex;
}
</style>
