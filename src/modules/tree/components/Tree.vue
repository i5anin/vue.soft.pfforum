<template>
  <v-app>
    <v-main>
      <v-container>
        <v-row justify="end">
          <v-col cols="auto">
            <v-btn variant="text" @click="refreshTreeData">
              <v-icon left>mdi-refresh</v-icon>
              Обновить
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn variant="text" @click="toggleAllNodes">
              <v-icon left>mdi-folder-open</v-icon>
              {{ isAllExpanded ? 'Свернуть все' : 'Развернуть все' }}
            </v-btn>
          </v-col>
        </v-row>

        <v-list-item class="mt-4">
          <tree-node
            v-for="(node, index) in treeData"
            :key="node.id"
            :node="node"
            :expanded="isAllExpanded"
            @toggle-node="toggleNode"
          />
        </v-list-item>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { toolTreeApi } from '@/modules/tree/api/tree'
import TreeNode from './TreeNode.vue'

export default {
  name: 'TreeView',
  components: { TreeNode },
  data() {
    return {
      treeData: [],
      isAllExpanded: false,
    }
  },
  async created() {
    await this.refreshTreeData()
  },
  methods: {
    async refreshTreeData() {
      try {
        const updatedTree = await toolTreeApi.getTree()
        if (updatedTree && updatedTree.length > 0) {
          const rootNode = updatedTree.find((node) => node.id === 1)
          this.treeData = rootNode && rootNode.nodes ? rootNode.nodes : []
        }
      } catch (error) {
        console.error('Ошибка при обновлении дерева:', error)
      }
    },
    toggleAllNodes() {
      this.isAllExpanded = !this.isAllExpanded
    },
    // Функция для обработки события toggle-node от дочерних компонентов
    toggleNode(nodeId) {
      // Находим узел по ID и обновляем его состояние expanded
      const updateNode = (nodes) => {
        for (const node of nodes) {
          if (node.id === nodeId) {
            node.expanded = !node.expanded
            return
          }
          if (node.nodes && node.nodes.length) {
            updateNode(node.nodes)
          }
        }
      }
      updateNode(this.treeData)
    },
  },
}
</script>
