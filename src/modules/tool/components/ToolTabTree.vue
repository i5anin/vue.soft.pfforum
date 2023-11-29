<template>
  <div>
    <button @click="addNewNode">Add New Node</button>
    <vue3-jstree v-if="treeData.nodes.length > 0" :data="treeData.nodes" />
    <p v-else>No tree data available</p>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import Vue3Jstree from '@ventralnet/vue3-jstree'
import { getToolsTree } from '@/api'

export default {
  components: { Vue3Jstree },
  setup() {
    const treeData = ref({ label: 'root', nodes: [] })

    // Method to fetch the initial tree data
    const fetchTreeData = async () => {
      try {
        const data = await getToolsTree()
        console.log('Fetched data:', data) // Add this line to log the fetched data
        if (Array.isArray(data)) {
          treeData.value.nodes = data
        } else {
          console.error('Fetched data is not an array:', data)
        }
      } catch (error) {
        console.error('Error fetching tree data:', error)
      }
    }

    // Method to add a new node
    const addNewNode = () => {
      console.log('Adding new node')
      const newNode = {
        label: 'New Node', // Label of the new node
        nodes: [], // Empty nodes array
      }

      console.log('newNode init')

      // Ensure treeData.nodes is an array before pushing
      if (Array.isArray(treeData.value.nodes)) {
        console.log(treeData)
        treeData.value.nodes.push(newNode) // Adding the new node at the root level
      } else {
        console.error('treeData.nodes is not an array:', treeData.value.nodes)
      }
    }

    onMounted(fetchTreeData)

    return { treeData, addNewNode }
  },
}
</script>
