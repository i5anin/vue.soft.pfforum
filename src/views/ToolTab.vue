<template>
  <v-card>
    <v-tabs v-model="tab">
      <v-tab value="one">Инструмент</v-tab>
      <v-tab value="two">Библиотека</v-tab>
    </v-tabs>

    <v-card-text>
      <v-window v-model="tab">
        <v-window-item value="one">
          <ToolTable />
        </v-window-item>

        <v-window-item value="two">
          <ToolLibraryTable />
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
import ToolTable from '@/views/ToolTable.vue';
import ToolLibraryTable from '@/views/ToolLibraryTable.vue';

const tab = ref('one'); // Initialize the 'tab' variable with a default value
</script>
