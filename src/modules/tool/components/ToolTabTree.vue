<template>
  <v-app>
    <v-app-bar app color="indigo" dark>
      <v-toolbar-title>Проводник</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="goBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <v-row>
          <v-col cols="12">
            <h1>{{ currentItem ? currentItem.label : '' }}</h1>
            <v-list-item-group
              v-model="selectedItem"
              active-class="deep-purple--text text--accent-4"
            >
              <v-list-item
                v-for="item in items"
                :key="item.id"
                @click="selectItem(item)"
              >
                <v-list-item-content>
                  <v-list-item-title v-text="item.label"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { getToolsTree } from '@/api'

export default {
  data: () => ({
    items: [],
    selectedItem: null,
    currentItem: null,
    history: [],
  }),
  methods: {
    selectItem(item) {
      this.history.push(this.items)
      this.items = item.nodes
      this.currentItem = item
    },
    goBack() {
      if (this.history.length > 0) {
        this.items = this.history.pop()
      }
    },
  },
  async created() {
    this.items = await getToolsTree()
  },
}
</script>
