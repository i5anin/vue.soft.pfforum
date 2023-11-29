<template>
  <div>
    <button @click="addNewNode">Add New Node</button>
    <vue3-jstree :data="treeData" />
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
        treeData.value = data
      } catch (error) {
        console.error('Error fetching tree data:', error)
      }
    }

    // Method to add a new node
    const addNewNode = () => {
      console.log('addNewNode')
      const newNode = {
        id: new Date().getTime(), // Generating a unique ID
        name: 'New Node', // Name of the new node
        children: [], // Empty children array
      }

      treeData.value.push(newNode) // Adding the new node at the root level
    }

    onMounted(fetchTreeData)

    return { treeData, addNewNode }
  },
}
</script>

<style>
/* Your custom styles go here */
</style>
