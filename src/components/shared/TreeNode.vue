<!--Vuetify TreeNode.vue-->
<template>
  <!-- Группа списка для отображения узлов дерева -->
  <!-- Если у узла есть дочерние узлы, отобразить группу списка -->
  <!-- Открыть или закрыть группу списка -->
  <v-list-group
    v-if="node.nodes && node.nodes.length"
    :value="isOpen"
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

    <TreeNode v-for="(child, index) in node.nodes" :key="index" :node="child" />
  </v-list-group>

  <!-- Если у узла нет дочерних узлов, просто отобразить элемент списка -->
  <v-list-item v-else @click.stop>
    <v-list-item-title>
      {{ node.label }}
    </v-list-item-title>
  </v-list-item>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'TreeNode',
  props: { node: Object },
  setup() {
    const isOpen = ref(true)

    const toggle = () => {
      isOpen.value = !isOpen.value
      console.log(`Toggled node: ${this.node.label}, new state: ${this.isOpen}`)
    }

    return { isOpen, toggle }
  },
  created() {
    console.log(`Created node: ${this.node.label}`)
  },
  mounted() {
    console.log(`Mounted node: ${this.node.label}`)
  },
}
</script>
