<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Проводник</v-toolbar-title>
      <v-spacer />
      <v-btn icon @click="goBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-container :fluid="true">
        <v-row>
          <v-col cols="12">
            <div class="text-h6">
              <v-text-field
                v-if="isEditing"
                v-model="editableLabel"
                @blur="finishEditing"
                @keyup.enter="finishEditing"
                dense
                solo
                :flat="true"
                hide-details
                :autofocus="true"
              ></v-text-field>
              <!-- Показываем название и иконку, если редактирование не активно -->
              <span v-else @click="startEditing">
                {{ currentItem ? currentItem.label : 'Выберите элемент' }}
                <v-btn icon small @click.stop="startEditing">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon small @click.stop="addItem">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </span>
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
  // Добавляем глобальный обработчик событий клавиатуры
  mounted() {
    window.addEventListener('keydown', this.handleKeydown)
  },

  // Удаляем глобальный обработчик событий клавиатуры при уничтожении компонента
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeydown)
  },

  data() {
    return {
      history: [],
      currentItem: null,
      selectedItem: null,
      isEditing: false, // Добавляем состояние редактирования
      editableLabel: '', // Добавляем модель для текстового поля
    }
  },
  computed: {
    breadcrumbItems() {
      console.log(this.history)
      return this.history.map((item, index) => item.label)
    },
  },
  methods: {
    handleKeydown(event) {
      // Проверяем, что нажата клавиша Backspace
      if (event.key === 'Backspace') {
        this.goBack()
        event.preventDefault() // Для предотвращения дополнительных действий браузера
      }
    },
    addItem() {
      if (!this.currentItem || !this.currentItem.nodes) {
        alert('Выберите категорию для добавления нового элемента.')
        return
      }
    },
    selectItem(item) {
      this.currentItem = item
      if (!this.history.includes(item)) {
        this.history.push(item)
      }
    },
    startEditing() {
      this.isEditing = true
      this.editableLabel = this.currentItem ? this.currentItem.label : ''
    },
    finishEditing() {
      this.isEditing = false
      if (this.currentItem) {
        // Обновляем название текущего элемента после редактирования
        this.currentItem.label = this.editableLabel
      }
    },
    // Логика для кнопки "назад"
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

<!--<style scoped>-->
<!--/* Стили для хлебных крошек, если нужно */-->
<!--.breadcrumbs-item {-->
<!--  cursor: pointer;-->
<!--  color: blue;-->
<!--}-->
<!--</style>-->
