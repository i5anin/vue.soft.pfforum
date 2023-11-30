<template>
  <!-- Группа списка для отображения узлов дерева -->
  <!-- Открыть или закрыть группу списка -->
  <v-list-group
    v-bind:opened="open"
    @update:opened="open = $event"
    no-action
    sub-group
    @click:stop="toggle"
  >
    <template v-slot:activator>
      <v-list-item @click.stop>
        <v-list-item-title>
          {{ node.label }}
        </v-list-item-title>
      </v-list-item>
    </template>

    <TreeNode
      v-for="(child, index) in node.nodes"
      :key="index"
      :node="child"
      :open.sync="open"
    />
  </v-list-group>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'TreeNode',
  props: { node: Object, open: Array },
  setup() {
    const toggle = () => {
      this.open = !this.open
      console.log(`Toggled node: ${this.node.label}, new state: ${this.open}`)
    }

    return { toggle }
  },
  created() {
    console.log(`Created node: ${this.node.label}`)
  },
  mounted() {
    console.log(`Mounted node: ${this.node.label}`)
  },
}
</script>
