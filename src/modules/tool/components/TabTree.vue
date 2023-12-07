<template>
  <v-app>
    <v-main>
      <v-container>
        <!-- Рекурсивное отображение дерева -->
        <div class="tree-view">
          <tree-node v-for="node in treeData" :key="node.id" :node="node" />
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { getToolsTree } from '@/api'

export default {
  name: 'TreeView',
  data() {
    return {
      treeData: [], // Инициализация пустого массива для данных дерева
    }
  },
  components: {
    TreeNode: {
      name: 'TreeNode',
      props: {
        node: Object,
      },
      template: `
        <div>
          <div>{{ node.label }}</div>
          <div v-if="node.nodes && node.nodes.length" class="child-nodes">
            <tree-node
              v-for="child in node.nodes"
              :key="child.id"
              :node="child"
            />
          </div>
        </div>
      `,
    },
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
.tree-view {
  /* Стили для вашего дерева */
}

.child-nodes {
  padding-left: 20px; /* Отступ для вложенных узлов */
}
</style>
