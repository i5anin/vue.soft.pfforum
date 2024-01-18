<template>
  <v-app class="custom-container">
    <v-app-bar app dark>
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
  <TabMainTable
    v-bind="{
      toolsTotalCount,
      formattedTools,
      filters,
      isLoading,
      paramsList,
      namespace: 'IssueToolStore',
    }"
    @page-changed="onPageChanged"
    @page-limit-changed="onUpdateItemsPerPage"
    @changes-saved="fetchToolsByFilter"
  />
</template>

<script>
import { toolTreeApi } from '@/modules/tool/api/tree'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import TabMainTable from '@/modules/issue-tool/components/Table.vue'
import CatalogBreadcrumbs from '@/modules/tool/components/CatalogBreadcrumbs.vue'

export default {
  name: 'IssueCatalog',
  components: { TabMainTable, CatalogBreadcrumbs },

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
    ...mapGetters('IssueToolStore', [
      'toolsTotalCount',
      'formattedTools',
      'filters',
      'isLoading',
      'paramsList',
    ]),
  },
  methods: {
    // обновить IdParent
    ...mapMutations('IssueToolStore', [
      'updateIdParent',
      'setCurrentPage',
      'setItemsPerPage',
    ]),
    ...mapActions('IssueToolStore', ['fetchToolsByFilter']),
    async onPageChanged(page) {
      this.setCurrentPage(page)
      await this.fetchToolsByFilter()
    },
    async onUpdateItemsPerPage(itemsPerPage) {
      this.setItemsPerPage(itemsPerPage)
      await this.fetchToolsByFilter()
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
