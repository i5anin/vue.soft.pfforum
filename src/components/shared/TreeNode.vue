<template>
  <v-list-group
    v-if="node.nodes && node.nodes.length"
    :value="true"
    no-action
    sub-group
  >
    <template v-slot:activator>
      <v-list-item-content>
        <v-list-item-title>{{ node.label }}</v-list-item-title>
      </v-list-item-content>
    </template>
    <v-list-item v-for="(child, index) in node.nodes" :key="index">
      <tree-node :node="child"></tree-node>
    </v-list-item>
  </v-list-group>
  <v-list-item v-else>
    <v-list-item-content>
      <v-list-item-title>{{ node.label }}</v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
export default {
  props: {
    node: Object,
  },
}
</script>
