<!-- TreeNode.vue -->
<template>
  <v-list-group :value="open.includes(node.id)" @input="toggle">
    <template v-slot:activator="{ props }">
      <v-list-item v-bind="props" prepend-icon="mdi mdi-square-root">
        <v-list-item-content>
          <v-list-item-title v-text="node.label" />
        </v-list-item-content>
      </v-list-item>
    </template>
    <v-list-item v-for="(child, index) in node.nodes" :key="index">
      <v-list-item-content>
        <v-list-item-title v-text="child.label" />
      </v-list-item-content>
    </v-list-item>
    <tree-node
      v-for="(child, index) in node.nodes"
      :key="index"
      :node="child"
      :open.sync="open"
    />
  </v-list-group>
</template>

<script>
export default {
  name: 'TreeNode',
  props: ['node', 'open'],
  methods: {
    toggle(value) {
      if (value) {
        this.open.push(this.node.id)
        console.log(`Opened node: ${this.node.id}`)
      } else {
        const index = this.open.indexOf(this.node.id)
        if (index > -1) {
          this.open.splice(index, 1)
        }
        console.log(`Closed node: ${this.node.id}`)
      }
    },
  },
}
</script>
