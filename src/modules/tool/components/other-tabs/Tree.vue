<template>
  <v-app>
    <v-main>
      <v-container>
        <!-- Кнопка обновления -->
        <v-btn color="primary" @click="refreshTreeData">
          <v-icon left>mdi-refresh</v-icon>
          Обновить
        </v-btn>

        <!-- Рекурсивное отображение дерева -->
        <v-list-item class="mt-3">
          <tree-node
            v-for="node in treeData"
            :key="node.id"
            :node="node"
            @refresh-node="refreshTreeData"
          />
        </v-list-item>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { toolTreeApi } from '@/modules/tool/api/tree'
import TreeNode from '../TreeNode.vue'

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
  methods: {
    async refreshTreeData() {
      try {
        const updatedTree = await toolTreeApi.getTree()
        if (updatedTree && updatedTree.length > 0) {
          this.treeData = updatedTree
        }
      } catch (error) {
        console.error('Ошибка при обновлении дерева:', error)
      }
    },
  },
  async created() {
    await this.refreshTreeData()
  },
}
</script>
