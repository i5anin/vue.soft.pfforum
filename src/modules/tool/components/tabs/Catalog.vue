<template>
  <v-app class="custom-container">
    <v-app-bar app dark>
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
            <v-btn icon small @click.stop="deleteItem(currentItem.id)">
              <v-icon>mdi-delete</v-icon>
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
            <!-- <div class="breadcrumbs">-->
            <div>
              <span v-for="(item, index) in history" :key="index">
                <span :class="getBreadcrumbClass(index)" @click="goTo(index)">
                  {{ item.label }}
                  <span v-if="item.elements !== 0">
                    ({{ item.elements }})
                  </span>
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
import TabMainTable from '@/modules/tool/components/MainTable.vue'
import { addFolder, deleteFolder, getTree, renameFolder } from '@/api'
import { normSpaces } from '@/modules/tool/components/normSpaces'

export default {
  name: 'Catalog',
  props: { parentId: String },
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
  watch: {
    treeData(newVal) {
      if (newVal && newVal.length > 0) {
        this.someId = 1123
        this.selectItem(this.someId) // замените `this.someId` на актуальный ID
      }
    },
  },
  methods: {
    findItemInTree(parentId, currentNode = null) {
      console.log('Поиск элемента в дереве', parentId)

      if (!currentNode) {
        console.log('Начинаем поиск с корня дерева', this.treeData)
        if (!this.treeData || !Array.isArray(this.treeData)) {
          console.error('Дерево данных не определено или не является массивом')
          return null
        }
        for (let rootNode of this.treeData) {
          const foundNode = this.findItemInTree(parentId, rootNode)
          if (foundNode) return foundNode
        }
        console.log('Корневой узел не найден')
        return null
      }

      console.log(
        `Сравниваем: искомый ID ${parentId} с текущим узлом ID ${currentNode.id}`
      )
      if (currentNode.id == parentId) {
        console.log('Найденный узел:', currentNode)
        return currentNode
      }

      if (currentNode.nodes && currentNode.nodes.length > 0) {
        for (let node of currentNode.nodes) {
          const foundNode = this.findItemInTree(parentId, node)
          if (foundNode) return foundNode
        }
      }
      return null
    },

    async selectItem(itemId) {
      console.log('Метод selectItem вызван с ID:', itemId)
      try {
        const folderDetails = this.findItemInTree(itemId)
        if (folderDetails) {
          this.currentItem = folderDetails
          this.addToHistory(folderDetails)
        } else {
          console.error('Не удалось найти детали папки для ID:', itemId)
        }
      } catch (error) {
        console.error('Ошибка при поиске деталей папки:', error)
      }
    },

    addToHistory(item) {
      console.log('Добавление элемента в историю:', item)
      const exists = this.history.some(
        (historyItem) => historyItem.id === item.id
      )
      if (!exists) {
        this.history.push(item)
      }
    },

    async renameCurrentItem() {
      if (!this.currentItem || !this.editableLabel) {
        return alert(
          'Не выбран элемент для переименования или не введено новое имя.'
        )
      }

      const itemId = this.currentItem.id
      const newName = this.editableLabel

      try {
        const response = await renameFolder(itemId, newName)
        if (response && response.message) {
          alert('Элемент успешно переименован.')

          // Обновляем название текущего элемента без перестроения всего дерева
          this.currentItem.label = newName

          // Необходимо обновить элемент в истории, если он там есть
          const historyItem = this.history.find((item) => item.id === itemId)
          if (historyItem) {
            historyItem.label = newName
          }
        } else {
          alert('Произошла ошибка при переименовании.')
        }
      } catch (error) {
        console.error('Ошибка при переименовании:', error)
        alert('Произошла ошибка при переименовании.')
      }
    },

    async deleteItem() {
      if (!this.currentItem) {
        return alert('Не выбран элемент для удаления.')
      }

      const itemId = this.currentItem.id
      if (
        confirm(`Вы уверены, что хотите удалить ${this.currentItem.label}?`)
      ) {
        try {
          await deleteFolder(itemId)
          alert('Элемент успешно удален.')

          if (this.history.length > 1) {
            this.history.pop()
            this.currentItem = this.history[this.history.length - 1]
          }

          // Вызываем refreshTree для обновления дерева и currentItem
          await this.refreshTree()
        } catch (error) {
          console.error('Ошибка при удалении:', error)
          alert('Произошла ошибка при удалении.')
        }
      }
    },

    getBreadcrumbClass(index) {
      return {
        'breadcrumbs-item': index < this.history.length - 1,
        'breadcrumbs-item-final': index === this.history.length - 1,
      }
    },

    async addItem() {
      console.log('Начало добавления новой папки') // Логирование начала процесса добавления

      // Проверяем, выбран ли текущий элемент
      if (!this.currentItem || !this.currentItem.nodes) {
        console.log('Не выбрана категория для добавления новой папки')
        return alert('Выберите категорию для добавления нового элемента.')
      }

      // Запрашиваем название новой папки
      let branchName = prompt('Введите название новой ветки:')
      if (branchName) {
        branchName = normSpaces(branchName)
        console.log(`Введенное название папки: ${branchName}`) // Логирование введенного названия

        try {
          console.log(
            `Попытка добавления папки '${branchName}' в категорию с ID: ${this.currentItem.id}`
          )
          const newBranch = await addFolder(branchName, this.currentItem.id)
          console.log(
            `Папка добавлена успешно. ID новой папки: ${newBranch.newBranchId}`
          )

          // Создаем объект новой папки
          const newFolder = {
            id: newBranch.newBranchId,
            label: branchName,
            elements: 0,
            nodes: [],
          }

          // Добавляем новую папку в список дочерних элементов текущего элемента
          this.currentItem.nodes.push(newFolder)

          // Обновляем текущий элемент, чтобы отображать новую папку
          this.currentItem = newFolder

          // Добавляем новую папку в историю для навигации
          this.history.push(newFolder)
        } catch (error) {
          console.error('Ошибка при добавлении новой ветки:', error)
          alert('Произошла ошибка при добавлении ветки.')
        }
      } else {
        console.log('Добавление папки отменено пользователем')
      }
    },

    async refreshTree() {
      console.log('Начало обновления дерева')
      try {
        const updatedTree = await getTree()
        console.log('Дерево получено:', updatedTree)
        this.treeData = updatedTree

        // Проверяем, если текущий элемент присутствует в обновленном дереве
        const updatedCurrentItem = updatedTree.find(
          (item) => item.id === this.currentItem.id
        )

        if (updatedCurrentItem) {
          // Обновляем текущий элемент, если он найден
          this.currentItem = updatedCurrentItem
          console.log('Текущий элемент обновлен:', this.currentItem)
        } else {
          // Если текущий элемент не найден, обновляем его на первый элемент из дерева
          // или на null, если дерево пустое
          this.currentItem = updatedTree.length > 0 ? updatedTree[0] : null
          console.log(
            'Текущий элемент обновлен на первый элемент дерева или null'
          )
        }
      } catch (error) {
        console.error('Ошибка при обновлении дерева:', error)
      }
    },

    startEditing() {
      this.isEditing = true
      this.editableLabel = this.currentItem ? this.currentItem.label : ''
    },

    finishEditing() {
      if (
        this.isEditing &&
        this.currentItem &&
        this.editableLabel !== this.currentItem.label
      ) {
        this.renameCurrentItem()
      }
      this.isEditing = false
    },

    goBack() {
      if (this.history.length > 1) {
        this.history.pop() // Удаляем последний элемент истории
        this.currentItem = this.history[this.history.length - 1] // Обновляем currentItem на предыдущий элемент
      }
    },
    goTo(index) {
      this.history = this.history.slice(0, index + 1)
      const selectedItem = this.history[index]
      this.currentItem = selectedItem
      this.$router.push(`/Tool/${selectedItem.id}`).catch((err) => {
        // Обработка ошибки, если такой же маршрут уже активен
        if (err.name !== 'NavigationDuplicated') {
          throw err
        }
      })
    },
  },
  async created() {
    try {
      const toolsTree = await getTree()
      if (toolsTree && toolsTree.length > 0) {
        this.treeData = toolsTree
        const parentId = parseInt(this.$route.params.parentId)
        if (parentId) {
          await this.selectItem(parentId)
        } else {
          this.currentItem = toolsTree[0]
          this.history.push(this.currentItem)
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке дерева:', error)
    }
  },
}
</script>

<style>
/* Стили для хлебных крошек */
/*.breadcrumbs-item {
  cursor: pointer;
} */

.breadcrumbs {
  margin-bottom: 8px;
}

.breadcrumbs-item-final {
  color: grey;
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
