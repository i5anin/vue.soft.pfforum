<template>
  <div>
    <button @click="addNewNode">Add New Node</button>
    <vue3-jstree v-if="treeData.length > 0" :data="treeData" />
    <p v-else>No tree data available</p>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import Vue3Jstree from '@ventralnet/vue3-jstree'
import { getToolsTree } from '@/api'

export default {
  components: {
    Vue3Jstree,
  },
  setup() {
    const treeData = ref([])

    // Method to fetch the initial tree data
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

    // Method to add a new node
    const addNewNode = () => {
      console.log('Adding new node')
      const newNode = {
        id: new Date().getTime(), // Generating a unique ID
        name: 'New Node', // Name of the new node
        children: [], // Empty children array
      }

      // Ensure treeData is an array before pushing
      if (Array.isArray(treeData.value)) {
        treeData.value.push(newNode) // Adding the new node at the root level
      } else {
        console.error('treeData is not an array:', treeData.value)
      }
    }

    onMounted(fetchTreeData)

    return { treeData, addNewNode }
  },
}
</script>

<style>
/* Your custom styles go here */
</style>
