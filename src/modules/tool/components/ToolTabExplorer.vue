<template>
  <v-app>
    <v-app-bar app color="primary" dark>
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
              {{ currentItem ? currentItem.label : 'Выберите элемент' }}
            </div>
            <!-- Интеграция хлебных крошек -->
            <v-breadcrumbs :items="breadcrumbItems" divider="/">
              <template v-slot:item="{ item }">
                <v-breadcrumbs-item
                  :disabled="item.disabled"
                  @click="item.clickable ? goTo(item.index) : null"
                >
                  {{ item.text }}
                </v-breadcrumbs-item>
              </template>
            </v-breadcrumbs>
            <!-- Отображение списка элементов -->
            <v-list-item-group
              v-if="currentItem && currentItem.nodes"
              v-model="selectedItem"
              active-class="deep-purple--text text--accent-4"
            >
              <v-list-item
                v-for="item in currentItem.nodes"
                :key="item.id"
                @click="selectItem(item)"
              >
                <v-list-item-title v-text="item.label" />
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
  data() {
    return {
      currentItem: null,
      history: [],
      selectedItem: null,
    }
  },
  computed: {
    breadcrumbItems() {
      console.log(this.history)
      return this.history.map((item, index) => item.label)
    },
  },
  methods: {
    selectItem(item) {
      this.currentItem = item
      if (!this.history.includes(item)) {
        this.history.push(item)
      }
    },
    goBack() {
      if (this.history.length > 1) {
        this.history.pop()
        this.currentItem = this.history[this.history.length - 1]
      }
    },
    goTo(index) {
      this.history = this.history.slice(0, index + 1)
      this.currentItem = this.history[index]
    },
  },
  async created() {
    const toolsTree = await getToolsTree()
    if (toolsTree && toolsTree.length > 0) {
      this.currentItem = toolsTree[0]
      this.history.push(this.currentItem)
    }
  },
}
</script>

<style scoped>
/* Стили для хлебных крошек, если нужно */
.breadcrumbs-item {
  cursor: pointer;
  color: blue;
}
</style>
