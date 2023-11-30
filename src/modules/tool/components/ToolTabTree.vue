<template>
  <div>
    <v-list dense>
      <template v-for="(item, index) in treeData" :key="index">
        <v-list-group :value="true">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi mdi-square-root">
              <v-list-item-content>
                <v-list-item-title v-text="item.label" />
              </v-list-item-content>
            </v-list-item>
          </template>
          <v-list-item v-for="(child, index) in item.nodes" :key="index">
            <v-list-item-content>
              <v-list-item-title v-text="child.label" />
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
      </template>
    </v-list>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { getToolsTree } from '@/api'

export default {
  name: 'MyComponent',
  setup() {
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

    return { treeData }
  },
}
</script>
