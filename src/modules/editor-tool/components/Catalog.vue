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
            <catalog-breadcrumbs
              v-bind="{ tree, currentItem }"
              @go-to="goTo"
              @item-selected="selectItem"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
  <filling-table
    v-bind="{
      toolsTotalCount,
      formattedTools,
      filters,
      isLoading,
      paramsList,
      namespace: 'EditorToolStore',
    }"
    @page-changed="onPageChanged"
    @page-limit-changed="onUpdateItemsPerPage"
    @changes-saved="fetchToolsByFilter"
  />
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import FillingTable from '@/modules/editor-tool/components/Table.vue'
import { toolTreeApi } from '@/modules/tool/api/tree'
import { normSpaces } from '@/modules/tool/components/normSpaces'
import CatalogBreadcrumbs from '@/modules/tool/components/CatalogBreadcrumbs.vue'

export default {
  name: 'CatalogTab',
  components: { FillingTable, CatalogBreadcrumbs },

  data() {
    return {
      tree: [],
      currentItem: null,
      selectedItem: null,
      isEditing: false,
      editableLabel: '',
    }
  },

  props: {
    type: String,
    item: Object,
    parentId: {
      type: Object,
      default: () => ({ id: null, label: null }),
    },
  },
  watch: {
    type(newValue) {
      console.log('Тип вкладки изменен:', newValue)
    },
    currentItem: {
      handler(currentItem) {
        this.updateIdParent({
          id: currentItem.id,
          label: currentItem.label,
        })
        this.fetchToolsByFilter()
      },
    },
  },
  computed: {
    ...mapGetters('EditorToolStore', [
      'toolsTotalCount',
      'formattedTools',
      'filters',
      'isLoading',
      'paramsList',
    ]),
  },
  methods: {
    // обновить IdParent
    ...mapMutations('EditorToolStore', [
      'updateIdParent',
      'setCurrentPage',
      'setItemsPerPage',
    ]),
    ...mapActions('EditorToolStore', ['fetchToolsByFilter']),
    async onPageChanged(page) {
      this.setCurrentPage(page)
      await this.fetchToolsByFilter()
    },
    async onUpdateItemsPerPage(itemsPerPage) {
      this.setItemsPerPage(itemsPerPage)
      await this.fetchToolsByFilter()
    },
    //переименовать текущий элемент
    async renameCurrentItem() {
      const itemId = this.currentItem.id
      const newName = this.editableLabel

      try {
        const response = await toolTreeApi.renameFolder(itemId, newName)
        if (response && response.message) {
          alert('Элемент успешно переименован.')
          this.currentItem.label = newName // Обновляем название текущего элемента без перестроения всего дерева
          const historyItem = this.tree.find((item) => item.id === itemId) // Необходимо обновить элемент в истории, если он там есть
          if (historyItem) historyItem.label = newName
        } else {
          alert('Произошла ошибка при переименовании.')
        }
      } catch (error) {
        console.error('Ошибка при переименовании:', error)
        alert('Произошла ошибка при переименовании.')
      }
    },

    async deleteItem() {
      if (!this.currentItem) return alert('Не выбран элемент для удаления.')
      const itemId = this.currentItem.id
      if (confirm(`Уверены, что хотите удалить ${this.currentItem.label}?`)) {
        try {
          await toolTreeApi.deleteFolder(itemId)
          alert('Элемент успешно удален.')

          if (this.tree.length > 1) {
            this.tree.pop()
            this.currentItem = this.tree[this.tree.length - 1]
          }

          // Вызываем refreshTree для обновления дерева и currentItem
          await this.refreshTree()
        } catch (error) {
          console.error('Ошибка при удалении:', error)
          alert('Произошла ошибка при удалении.')
        }
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
          const newBranch = await toolTreeApi.addFolder(
            branchName,
            this.currentItem.id
          )
          // Создаем объект новой папки
          const newFolder = {
            id: newBranch.newBranchId,
            label: branchName,
            elements: 0,
            nodes: [],
          }
          this.currentItem.nodes.push(newFolder) // Добавляем новую папку в список дочерних элементов текущего элемента
          this.currentItem = newFolder // Обновляем текущий элемент, чтобы отображать новую папку
          this.tree.push(newFolder) // Добавляем новую папку в историю для навигации
        } catch (error) {
          alert('Произошла ошибка при добавлении ветки.')
        }
      }
    },

    async refreshTree() {
      const updatedTree = await toolTreeApi.getTree()
      this.tree = updatedTree
      // TODO: сделать нормальный поиск во вложенных node'ах
      const updatedCurrentItem = updatedTree.find(
        (item) => item.id === this.currentItem.id // Проверяем, если текущий элемент присутствует в обновленном дереве
      )
      this.currentItem = updatedCurrentItem // Если текущий элемент не найден, обновляем его на первый элемент из дерева или на null, если дерево пустое
        ? updatedCurrentItem
        : updatedTree.length > 0
        ? updatedTree[0]
        : null
    },

    async selectItem(item) {
      console.log('Выбранная папка каталога:', item.id, item.label)
      this.currentItem = item
      if (!this.tree.includes(item)) this.tree.push(item)
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
      if (this.tree.length > 1) {
        this.tree.pop() // Удаляем последний элемент истории
        this.currentItem = this.tree[this.tree.length - 1] // Обновляем currentItem на предыдущий элемент
        console.log(
          'Кнопка возврат:',
          this.currentItem.id,
          this.currentItem.label
        )
      }
    },
    goTo(index) {
      this.currentItem = this.tree[index]
      console.log(
        'Хлебные крошки. Выбранный элемент:',
        this.currentItem.id,
        this.currentItem.label
      )

      this.tree = this.tree.slice(0, index + 1)
      this.currentItem = this.tree[index]
    },
  },
  async created() {
    const toolsTree = await toolTreeApi.getTree()
    if (toolsTree && toolsTree.length > 0) {
      this.currentItem = toolsTree[0]
      this.tree.push(this.currentItem)
    }
  },
}
</script>

<style>
/* Стили для хлебных крошек */
.breadcrumbs {
  margin-bottom: 8px;
}

.custom-container > div {
  min-height: 0 !important;
}
</style>
