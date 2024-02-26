<template>
  <v-app class="custom-container">
    <v-app-bar app dark>
      <div class="text-h6 pl-5">
        {{ currentItem ? currentItem.label : 'Выдача' }}
      </div>
      <v-spacer />
      <v-btn icon @click="goBack">
        <v-icon icon="mdi-arrow-left" />
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
    v-if="isTableShown"
    v-bind="{
      namespace: 'IssueToolStore',
    }"
  />
</template>

<script>
import { toolTreeApi } from '@/modules/tool/api/tree'
import { mapActions, mapMutations, mapGetters } from 'vuex'
import TabMainTable from './Table.vue'
import CatalogBreadcrumbs from '@/modules/tool/components/CatalogBreadcrumbs.vue'
import { normSpaces } from '@/modules/tool/components/normSpaces'

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
  watch: {
    currentItem: {
      handler(currentItem) {
        this.setParentCatalog({
          id: currentItem.id,
          label: currentItem.label,
        })
        this.fetchToolsByFilter()
      },
    },
  },
  computed: {
    ...mapGetters('IssueToolStore', ['parentCatalog']),
    isTableShown() {
      return this.parentCatalog.id !== 1
    },
  },
  methods: {
    ...mapMutations('IssueToolStore', ['setParentCatalog']),
    ...mapActions('IssueToolStore', ['fetchToolsByFilter']),
    async selectItem(item) {
      this.setParentCatalog({ id: item.id, label: item.label })
      this.currentItem = item
      if (!this.tree.includes(item)) this.tree.push(item)
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
        this.setParentCatalog({
          id: this.currentItem.id,
          label: this.currentItem.label,
        })
      }
    },
    goTo(index) {
      this.currentItem = this.tree[index]
      console.log(
        'Хлебные крошки. Выбрана папка:',
        this.currentItem.id,
        this.currentItem.label
      )
      this.setParentCatalog({
        id: this.currentItem.id,
        label: this.currentItem.label,
      })
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
