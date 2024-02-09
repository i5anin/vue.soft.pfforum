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
            {{ currentItem ? currentItem.label : 'Редактор' }}
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
  <editor-table
    v-if="currentItem && currentItem.id"
    :parentId="currentItem.id"
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
    @params-filter-changed="onParamsFilterChanged"
    @changes-saved="fetchToolsByFilter"
    @changes-saved-post="fetchToolsByFilter"
    @update:formattedTools="formattedTools = $event"
    @update:toolsTotalCount="toolsTotalCount = $event"
  />
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import EditorTable from '@/modules/editor-tool/components/Table.vue'
import { toolTreeApi } from '@/modules/tool/api/tree'
import { normSpaces } from '@/modules/tool/components/normSpaces'
import CatalogBreadcrumbs from '@/modules/tool/components/CatalogBreadcrumbs.vue'
import { toolEditorApi } from '@/modules/editor-tool/api/editor'

export default {
  name: 'CatalogEditor',
  components: { EditorTable, CatalogBreadcrumbs },

  data() {
    return {
      tree: [],
      currentItem: { id: null },
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
    currentItem: {
      handler(currentItem) {
        this.updateIdParent({
          id: currentItem.id,
          label: currentItem.label,
        })
        this.fetchAdditionalFilters()
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
      'filterParamsList',
    ]),
    parentId() {
      return this.currentItem ? this.currentItem.id : null
    },
  },
  methods: {
    ...mapMutations('EditorToolStore', [
      'updateIdParent',
      'setCurrentPage',
      'setItemsPerPage',
    ]),
    ...mapActions('EditorToolStore', [
      'fetchToolsByFilter',
      'fetchAdditionalFilters',
    ]),
    async onPageChanged(page) {
      this.setCurrentPage(page)
      await this.fetchToolsByFilter()
    },
    onParamsFilterChanged(paramsFilters) {
      this.fetchToolsByFilter(paramsFilters)
    },
    async onUpdateItemsPerPage(itemsPerPage) {
      this.setItemsPerPage(itemsPerPage)
      await this.fetchToolsByFilter()
    },
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
      console.log(this.currentItem)
      if (!this.currentItem || !this.currentItem.nodes)
        return alert('Выберите категорию для добавления нового элемента.')

      let branchName = prompt('Введите название новой ветки:')
      if (branchName) {
        branchName = normSpaces(branchName)
        try {
          const newBranch = await toolTreeApi.addFolder(
            branchName,
            this.currentItem.id
          )
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
      const updatedCurrentItem = updatedTree.find(
        // Проверяем, если текущий элемент присутствует в обновленном дереве
        (item) => item.id === this.currentItem.id
      )
      // Если текущий элемент не найден, обновляем его на первый элемент из дерева или на null, если дерево пустое
      this.currentItem = updatedCurrentItem
        ? updatedCurrentItem
        : updatedTree.length > 0
        ? updatedTree[0]
        : null
    },

    async selectItem(item) {
      this.currentItem = item
      await toolEditorApi.filterParamsByParentId(item.id)
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
      }
    },
    goTo(index) {
      this.currentItem = this.tree[index]
      this.tree = this.tree.slice(0, index + 1)
      this.currentItem = this.tree[index]
    },
  },
  async created() {
    const toolsTree = await toolTreeApi.getTree()
    if (toolsTree && toolsTree.length) {
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
