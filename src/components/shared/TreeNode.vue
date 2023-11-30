<template>
  <v-list-group
    v-if="node.nodes && node.nodes.length"
    :value="isOpen"
    no-action
    sub-group
    @click.stop="toggle"
  >
    <template v-slot:activator>
      <v-list-item>
        <v-list-item-content>
          {{ node.label }}
        </v-list-item-content>
      </v-list-item>
    </template>

    <TreeNode v-for="(child, index) in node.nodes" :key="index" :node="child" />
  </v-list-group>

  <v-list-item v-else>
    <v-list-item-content>
      {{ node.label }}
    </v-list-item-content>
  </v-list-item>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'TreeNode',
  props: {
    node: Object,
  },
  setup(props) {
    const isOpen = ref(false)
    const toggle = () => {
      isOpen.value = !isOpen.value
    }

    return { isOpen, toggle }
  },
}
</script>
