<template>
  <v-app class="custom-container">
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>
        <div class="text-h6">
          <v-text-field
            v-if="isEditing"
            v-model="editableLabel"
            @blur="finishEditing"
            @keyup.enter="finishEditing"
            dense
            solo
            hide-details
            :flat="true"
            :autofocus="true"
          />
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
      </v-toolbar-title>
      <v-spacer />
      <v-btn icon @click="goBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-container :fluid="true">
        <v-row>
          <v-col cols="12">
            <!-- Интеграция хлебных крошек -->
            <div class="breadcrumbs">
              <span v-for="(item, index) in history" :key="index">
                <span :class="getBreadcrumbClass(index)" @click="goTo(index)">
                  {{ item.label }} ({{ item.elements }})
                </span>
                <span v-if="index < history.length - 1">
                  &nbsp;&nbsp;/&nbsp;&nbsp;
                </span>
              </span>
            </div>

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
                class="d-flex align-center"
              >
                <v-list-item-content class="flex">
                  <v-icon color="info" icon="mdi-folder" class="icon" />
                  <v-list-item-title>
                    {{ item.label }}
                    <span v-if="item.elements !== 0">
                      ({{ item.elements }})
                    </span>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
  <TabMainTable />
</template>

<script>
import { addBranch, getToolsTree } from '@/api'
import TabMainTable from '@/modules/tool/components/tabs/MainTable.vue'
import { normSpaces } from '@/modules/tool/components/normSpaces'

export default {
  name: 'TabCatalog',
  components: { TabMainTable },

  data() {
    return {
      history: [],
      currentItem: null,
      selectedItem: null,
      isEditing: false,
      editableLabel: '',
    }
  },
  methods: {
    getBreadcrumbClass(index) {
      return {
        'breadcrumbs-item': index < this.history.length - 1,
        'breadcrumbs-item-final': index === this.history.length - 1,
      }
    },

    async addItem() {
      if (!this.currentItem || !this.currentItem.nodes) {
        return alert('Выберите категорию для добавления нового элемента.')
      }

      let branchName = prompt('Введите название новой ветки:')
      if (branchName) {
        branchName = normSpaces(branchName)
        try {
          const newBranch = await addBranch(branchName, this.currentItem.id)
          alert(`Ветка добавлена успешно: ${newBranch.newBranchId}`)
          await this.refreshTree()
        } catch (error) {
          console.error('Ошибка при добавлении новой ветки:', error)
          alert('Произошла ошибка при добавлении ветки.')
        }
      }
    },

    async refreshTree() {
      try {
        const updatedTree = await getToolsTree()
        this.treeData = updatedTree
        if (this.currentItem) {
          const updatedCurrentItem = updatedTree.find(
            (item) => item.id === this.currentItem.id
          )
          if (updatedCurrentItem) {
            this.currentItem = updatedCurrentItem
          }
        }
      } catch (error) {
        console.error('Ошибка при обновлении дерева:', error)
      }
    },

    async selectItem(item) {
      this.currentItem = item
      if (!this.history.includes(item)) {
        this.history.push(item)
      }

      try {
        await this.$store.dispatch('tool/fetchToolsByFilter', {
          parentId: item.id,
        })
      } catch (error) {
        console.error('Ошибка при получении данных:', error)
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
        this.history.pop() // Удаляем последний элемент истории
        this.currentItem = this.history[this.history.length - 1] // Обновляем currentItem на предыдущий элемент
      }
    },
    goTo(index) {
      console.log('Переход к элементу с индексом:', index)
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

<style>
/* Стили для хлебных крошек */
.breadcrumbs-item {
  cursor: pointer;
}

.breadcrumbs {
  margin-bottom: 8px;
}

.breadcrumbs-item-final {
  color: gray;
}

.custom-container > div {
  min-height: 0 !important;
}

.flex {
  display: flex;
}

.icon {
  margin-right: 10px;
}
</style>
