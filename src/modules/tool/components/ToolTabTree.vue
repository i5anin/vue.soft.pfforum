<!--Vuetify ToolTabTree.vue-->
<template>
  <div>
    <v-btn @click="addNewNode">Add New Node</v-btn>
    <v-list dense>
      <template v-for="(item, index) in treeData" :key="index">
        <tree-node :node="item"></tree-node>
      </template>
    </v-list>
    <p v-if="!treeData.length">No tree data available</p>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { getToolsTree } from '@/api'
import TreeNode from '@/components/shared/TreeNode.vue'

export default {
  components: { TreeNode },
  setup() {
    const treeData = ref([])

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

    const addNewNode = () => {
      const newNode = { label: 'New Node', nodes: [] }
      treeData.value.push(newNode)
    }

    onMounted(fetchTreeData)

    return { treeData, addNewNode }
  },
}
</script>
