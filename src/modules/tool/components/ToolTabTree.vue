<!-- MyComponent.vue -->
<template>
  <div>
    <v-list dense>
      <template v-for="(item, index) in treeData" :key="index">
        <tree-node :node="item" :open.sync="open"></tree-node>
      </template>
    </v-list>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { getToolsTree } from '@/api'
import TreeNode from './TreeNode.vue'

export default {
  name: 'MyComponent',
  components: { TreeNode },
  setup() {
    const open = ref([]) // Состояние открытых узлов
    const treeData = ref([]) // Ваша структура данных

    const fetchTreeData = async () => {
      try {
        const data = await getToolsTree()
        if (Array.isArray(data)) {
          treeData.value = data
        } else {
          console.error('Fetched data is not an array:', data)
        }
      } catch (error) {
        console.error('Error fetching tree data:', error)
      }
    }

    onMounted(fetchTreeData)

    return { treeData, open }
  },
}
</script>
