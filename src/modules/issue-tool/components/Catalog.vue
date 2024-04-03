<template>
  <div class="text-h6 pl-5 mb-2">Выбрать на какую деталь:</div>
  <v-row>
    <v-col cols="12" md="2">
      <v-text-field
        variant="outlined"
        density="compact"
        label="поиск по ID"
        required
        @update:model-value="onIdChanged"
      />
    </v-col>
    <v-col cols="12" md="4">
      <v-select
        density="compact"
        label="Название Обозначение"
        required
        v-model="toolModel.detailDescription"
        :disabled="!options.idNameDescription.length"
        :items="options.idNameDescription"
        @update:model-value="onIdSelected"
      />
    </v-col>
    <v-col cols="12" md="2">
      <v-select
        density="compact"
        label="Номер Тип"
        required
        v-model="toolModel.operationType"
        :disabled="!options.numberType.length"
        :items="options.numberType"
        @update:model-value="onOperationSelected"
      />
    </v-col>
    <v-col cols="12" md="2">
      <v-combobox
        density="compact"
        v-model="selectedFio"
        :items="fioOptions"
        item-title="text"
        item-value="value"
        label="ФИО"
        return-object="false"
        single-line="false"
        @update:modelValue="handleSelectionChange"
      />
    </v-col>
  </v-row>
  <v-app class="custom-container">
    <v-app-bar app dark>
      <div class="text-h6 pl-5">
        <v-icon class="mr-2">mdi-folder</v-icon>
        {{ currentItem ? currentItem.label : 'Выдать' }}
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
import CatalogBreadcrumbs from '@/modules/shared/components/CatalogBreadcrumbs.vue'
import { issueToolApi } from '@/modules/issue-tool/api/issue'

export default {
  name: 'IssueCatalog',
  components: { TabMainTable, CatalogBreadcrumbs },

  data() {
    return {
      fioOptions: [],
      selectedFio: null,
      operationMapping: {},
      options: {
        idNameDescription: [],
        numberType: [],
      },
      tree: [],
      currentItem: null,
      selectedItem: null,
      isEditing: false,
      editableLabel: '',
      toolModel: {
        name: null,
        property: {},
        selectedOperationId: null,
        typeIssue: null,
      },
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
    ...mapGetters('IssueToolStore', ['parentCatalog', 'cartItems']),
    isTableShown() {
      return this.parentCatalog.id !== 1
    },
  },
  methods: {
    ...mapMutations('IssueToolStore', [
      'setSelectedOperationId',
      'setSelectedDetail',
      'setParentCatalog',
      'setSelectedOperationId',
      'setSelectedFio',
    ]),

    ...mapActions('IssueToolStore', ['fetchToolsByFilter']),

    handleSelectionChange(selectedItem) {
      this.setSelectedFio(selectedItem.value)
    },

    onOperationSelected(value) {
      this.setSelectedOperationId(this.operationMapping[value])
    },

    prepareFioOptions(fioData) {
      return fioData.map((item) => ({
        text: item.fio,
        value: item.id,
      }))
    },

    async onIdChanged(newId) {
      try {
        const result = await issueToolApi.searchById(newId)
        this.originalData = result // Сохраняем исходные данные для последующего использования
        this.options.idNameDescription = this.formatToolOptions(result)
      } catch (error) {
        console.error('Ошибка при поиске:', error)
      }
    },
    formatToolOptions(data) {
      const uniqueSet = new Set()
      this.idMapping = {} // очистка предыдущего сопоставления

      data.forEach((item) => {
        const formattedItem = item.description
          ? `${item.id} - ${item.name} - ${item.description}`
          : `${item.id} - ${item.name}`

        if (!uniqueSet.has(formattedItem)) {
          uniqueSet.add(formattedItem)
          this.idMapping[formattedItem] = item.id // создание сопоставления
        }
      })

      return Array.from(uniqueSet)
    },
    onIdSelected(selectedValue) {
      const id = this.idMapping[selectedValue]
      if (id) {
        const filteredData = this.originalData.filter((item) => item.id === id)
        this.options.numberType = this.formatOperationOptions(filteredData)
        // Сбросить выбранное значение для "Номер Тип" каждый раз, когда выбирается новое "Название Обозначение"
        this.toolModel.operationType = null // Это предполагает, что operationType - это свойство в toolModel, где хранится выбранный "Номер Тип"
      } else {
        console.error(
          'Не удалось найти ID для выбранного значения:',
          selectedValue
        )
        // Возможно также стоит сбросить options.numberType и toolModel.operationType здесь, если selectedValue не допустимо
        this.options.numberType = []
        this.toolModel.operationType = null
      }
    },

    formatOperationOptions(data) {
      this.operationMapping = {} // Очистка или инициализация перед использованием
      const uniqueSet = new Set()
      data.forEach((item) => {
        const label = `${item.no} - ${item.cnc_type}`
        if (!uniqueSet.has(label)) {
          uniqueSet.add(label)
          this.operationMapping[label] = item.specs_op_id // Теперь безопасно использовать operationMapping
        }
      })
      return Array.from(uniqueSet)
    },
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
    try {
      const fioData = await issueToolApi.getDetailFio()
      this.fioOptions = this.prepareFioOptions(fioData)
    } catch (error) {
      console.error('Ошибка при загрузке данных ФИО:', error)
    }

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
