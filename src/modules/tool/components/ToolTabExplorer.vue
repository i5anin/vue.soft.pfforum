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
      <v-container :fluid="true">
        <v-row>
          <v-col cols="12">
            <div class="text-h6">
              {{ currentItem ? currentItem.label : '' }}
            </div>
            <div class="breadcrumbs">
              <span v-for="(item, index) in history" :key="index">
                <span @click="goTo(index)">{{ item.label }}</span>
                <span v-if="index < history.length - 1"> / </span>
              </span>
            </div>
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
                  <v-list-item-title v-text="item.label" />
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
      if (
        this.currentItem &&
        (!this.history.length ||
          this.currentItem.id !== this.history[this.history.length - 1].id)
      ) {
        this.history.push(this.currentItem)
      }
      this.currentItem = item
      this.items = item.nodes
    },
    goBack() {
      if (this.history.length > 1) {
        this.history.pop()
        this.currentItem = this.history[this.history.length - 1]
        this.items = this.currentItem.nodes
      }
    },
    goTo(index) {
      this.history = this.history.slice(0, index + 1)
      this.currentItem = this.history[index]
      this.items = this.currentItem.nodes
    },
  },
  async created() {
    this.items = await getToolsTree()
    this.currentItem = this.items[0]
    this.items = this.currentItem.nodes
  },
}
</script>
