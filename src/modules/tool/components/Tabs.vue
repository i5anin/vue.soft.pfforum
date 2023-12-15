<template>
  <v-card>
    <v-tabs v-model="tab">
      <v-tab value="Catalog">Каталог</v-tab>
      <v-tab value="Tree">Дерево</v-tab>
      <!--<v-tab value="ToolTable">Инструмент</v-tab>-->
      <v-tab value="Param">Параметры</v-tab>
      <v-tab value="Inventory">Склад</v-tab>
    </v-tabs>

    <v-card-text>
      <v-window v-model="tab">
        <v-window-item value="Catalog">
          <TabCatalog />
        </v-window-item>
        <v-window-item value="Tree">
          <ToolTabTree />
        </v-window-item>
        <!-- <v-window-item value="ToolTable">-->
        <!-- <TabMainTable />-->
        <!-- </v-window-item>-->
        <v-window-item value="Param">
          <ToolTabParam />
        </v-window-item>
        <v-window-item value="Inventory">
          <ToolTabInventory />
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

// import TabMainTable from '@/modules/tool/components/MainTable.vue'
import ToolTabParam from '@/modules/tool/components/tabs/Param.vue'
import ToolTabInventory from '@/modules/tool/components/tabs/Sklad.vue'
import TabCatalog from '@/modules/tool/components/tabs/Catalog.vue'
import ToolTabTree from '@/modules/tool/components/tabs/Tree.vue'

const tab = ref('Catalog') // Начальное значение
</script>
