<template>
  <vue-jstree :data="treeData" :multiple="true" :checkbox="true"></vue-jstree>
</template>

<script>
import VueJstree from 'vue-jstree'
import { getToolsTree } from '@/api'

export default {
  components: { VueJstree },
  data() {
    return {
      treeData: [],
    }
  },
  async created() {
    try {
      let tree = await getToolsTree()
      tree = this.formatTreeData(tree)
      console.log(tree)
      this.treeData = tree
    } catch (error) {
      console.error('Error loading tree data:', error)
    }
  },
  methods: {
    formatTreeData(nodes) {
      return nodes.map((node) => ({
        id: node.id,
        text: node.name,
        children:
          node.children.length > 0 ? this.formatTreeData(node.children) : [],
      }))
    },
  },
}
</script>
