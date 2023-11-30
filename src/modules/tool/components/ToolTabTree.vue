<template>
  <div>
    <v-btn @click="addNewNode">Add New Node</v-btn>
    <v-list dense>
      <template v-for="(item, index) in treeData" :key="index">
        <v-list-item>
          {{ item.label }}
        </v-list-item>
        <!-- Рекурсивно отображаем дочерние элементы, если они есть -->
        <v-list v-if="item.nodes && item.nodes.length" dense>
          <template v-for="(child, childIndex) in item.nodes" :key="childIndex">
            <v-list-item>
              {{ child.label }}
            </v-list-item>
          </template>
        </v-list>
      </template>
    </v-list>
    <p v-if="!treeData.length">No tree data available</p>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { getToolsTree } from '@/api'

export default {
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
