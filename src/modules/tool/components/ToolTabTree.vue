<template>
  <div>
    <v-btn @click="addNewNode">Add New Node</v-btn>
    <v-list dense>
      <TreeNode v-for="(item, index) in treeData" :key="index" :node="item" />
    </v-list>
  </div>
</template>

<script>
import { ref } from 'vue'
import TreeNode from '@/components/shared/TreeNode.vue'

export default {
  components: { TreeNode },
  setup() {
    const treeData = ref([
      { label: 'Root', nodes: [{ label: 'Child 1', nodes: [] }] },
    ])

    const addNewNode = () => {
      const newNode = { label: 'New Node', nodes: [] }
      treeData.value.push(newNode)
    }

    return { treeData, addNewNode }
  },
}
</script>
