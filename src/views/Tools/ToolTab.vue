<template>
  <v-card>
    <v-tabs v-model='tab'>
      <v-tab value='ToolTable'>Инструмент</v-tab>
      <v-tab value='Library'>Библиотека</v-tab>
      <v-tab value='Inventory'>Склад</v-tab>
    </v-tabs>

    <v-card-text>
      <v-window v-model='tab'>
        <v-window-item value='ToolTable'>
          <ToolTabTable />
        </v-window-item>

        <v-window-item value='Library'>
          <ToolTabLibrary />
        </v-window-item>

        <v-window-item value='Inventory'>
          <ToolTabInventory />
        </v-window-item>

      </v-window>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

import ToolTabTable from '@/views/Tools/ToolTabTable.vue'
import ToolTabLibrary from '@/views/Tools/ToolTabLibrary.vue'
import ToolTabInventory from '@/views/Tools/ToolTabInventory.vue'

const tab = ref('one') // Initialize the 'tab' variable with a default value
</script>
