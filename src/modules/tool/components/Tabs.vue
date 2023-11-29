<template>
  <v-card>
    <v-tabs v-model="tab">
      <v-tab value="ToolTable">Инструмент</v-tab>
      <v-tab value="Library">Библиотека</v-tab>
      <v-tab value="Inventory">Склад</v-tab>
      <v-tab value="Tree">Дерево</v-tab>
    </v-tabs>

    <v-card-text>
      <v-window v-model="tab">
        <v-window-item value="ToolTable">
          <ToolTabTable />
        </v-window-item>

        <v-window-item value="Library">
          <ToolTabLibrary />
        </v-window-item>

        <v-window-item value="Inventory">
          <ToolTabInventory />
        </v-window-item>

        <v-window-item value="Tree">
          <ToolTabTree />
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

import ToolTabTable from '@/modules/tool/components/MainTabTable.vue'
import ToolTabLibrary from '@/modules/tool/components/TabLibrary.vue'
import ToolTabInventory from '@/modules/tool/components/TabInventory.vue'
import ToolTabTree from '@/modules/tool/components/ToolTabTree.vue'

const tab = ref('one') // Initialize the 'tab' variable with a default value
</script>
