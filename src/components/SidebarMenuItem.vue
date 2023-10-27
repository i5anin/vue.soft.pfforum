<template>
  <v-list-item
    v-if="!item.items"
    :prepend-icon="item.icon"
    :title="item.title"
    @click.native="navigate"
  >
  </v-list-item>
  <v-list-group v-else :value="item.title">
    <template v-slot:activator="{ props }">
      <v-list-item
        v-bind="props"
        :prepend-icon="item.icon"
        :title="item.title"
        @click.native="navigate"
      >
      </v-list-item>
    </template>
    <sidebar-menu-item
      v-for="(subItem, subIndex) in item.items"
      :key="subIndex"
      :item="subItem"
    />
  </v-list-group>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  props: {
    item: Object,
  },
  setup(props) {
    const router = useRouter();

    const navigate = () => {
      if (props.item.path) {
        router.push(props.item.path);
      }
    };

    return {
      navigate,
    };
  },
};
</script>
