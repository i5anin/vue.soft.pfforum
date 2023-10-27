<template>
  <v-list density='compact' nav>
    <template v-for='(item, index) in menuItems' :key='index'>
      <v-list-item
        v-if='!item.items'
        :prepend-icon='getIcon(item.icon)'
        :title='item.title'
        @click='$emit("click", item.title)'
      >
      </v-list-item>
      <v-list-group
        v-else
        :value='groupStates[item.title]'
        @input='val => { groupStates[item.title] = val; }'
      >
        <template v-slot:activator='{ props }'>
          <v-list-item
            v-bind='props'
            :prepend-icon='getIcon(item.icon)'
            :title='item.title'
          >
          </v-list-item>
        </template>
        <sidebar-menu-item v-for='(subItem, subIndex) in item.items'
                           :key='subIndex'
                           :item='subItem'
                           @click='$emit("click", subItem.title)'
        >
        </sidebar-menu-item>
      </v-list-group>
    </template>
  </v-list>
</template>

<script setup>
import { defineProps } from 'vue';
import SidebarMenuItem from '@/components/SidebarMenuItem.vue';

const { menuItems, groupStates } = defineProps(['menuItems', 'groupStates']);

const getIcon = (icon) => icon || 'mdi-circle-outline';
</script>
