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
      console.log('selectItem вызван с:', item)
      if (
        this.currentItem &&
        (!this.history.length ||
          this.currentItem.id !== this.history[this.history.length - 1].id)
      ) {
        console.log(
          'Текущий элемент до добавления в историю:',
          this.currentItem
        )
        this.history.push(this.currentItem)
        console.log('История после добавления текущего элемента:', this.history)
      }
      this.currentItem = item
      this.items = item.nodes
      console.log('Новый currentItem:', this.currentItem)
      console.log('Новые items:', this.items)
    },

    goBack() {
      console.log('goBack вызван')
      if (this.history.length > 1) {
        console.log('История до изменения:', this.history)
        this.history.pop()
        console.log('История после pop:', this.history)
        this.currentItem = this.history[this.history.length - 1]
        this.items = this.currentItem.nodes
        console.log('Текущий currentItem после возврата:', this.currentItem)
        console.log('Текущие items после возврата:', this.items)
      }
    },
    goTo(index) {
      console.log('goTo вызван с индексом:', index)
      console.log('История до обрезки:', this.history)
      this.history = this.history.slice(0, index + 1)
      console.log('История после обрезки:', this.history)
      this.currentItem = this.history[index]
      console.log('Текущий currentItem после goTo:', this.currentItem)
      this.items = this.currentItem.nodes
      console.log('Текущие items после goTo:', this.items)
    },
  },
  async created() {
    this.items = await getToolsTree()
    console.log('Начальные items:', this.items)
    this.currentItem = this.items[0]
    console.log('Начальный currentItem:', this.currentItem)
    this.items = this.currentItem.nodes
    console.log('Начальные nodes для currentItem:', this.items)
  },
}
</script>
