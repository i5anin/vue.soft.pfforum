<template>
  <v-container>
    <tool-filter
      :filter-params-list="filterParamsList"
      :filters="filters"
      @filter-update="onParamsFilterUpdate"
    />
    <ModalDamaged
      v-if="openDialog && currentModal === 'damaged'"
      :key="'modal-damaged'"
      :persistent="true"
      :tool-id="editingToolId"
      @canceled="onClosePopup"
      @changes-saved="onSaveChanges"
      @close="openDialog = false"
    />
    <ModalIssue
      v-if="openDialog && currentModal === 'issue'"
      :key="'modal-issue'"
      :persistent="true"
      :tool-id="editingToolId"
      @canceled="onClosePopup"
      @changes-saved="onSaveChanges"
      @close="openDialog = false"
    />
    <v-data-table-server
      v-if="isDataLoaded"
      noDataText="Нет данных"
      itemsPerPageText="Пункты на странице:"
      loadingText="Загрузка данных"
      :headers="toolTableHeaders"
      :items="formattedTools"
      :itemsLength="toolsTotalCount"
      :items-per-page="filters.itemsPerPage"
      :page="filters.currentPage"
      :loading="isLoading"
      :items-per-page-options="[15, 50, 100, 300]"
      density="compact"
      @update:page="onChangePage"
      @update:items-per-page="onUpdateItemsPerPage"
      class="elevation-1"
      hover
      fixed-header
      width
    >
      <template v-slot:item.index="{ index }">
        <td class="index">{{ index + 1 }}</td>
      </template>
      <!--name-->
      <template v-slot:item.name="{ item }">
        <td :class="colorClassGrey(item)" style="white-space: nowrap">
          {{ item.name }}
        </td>
      </template>
      <template v-slot:item.sklad="{ item }">
        <td :class="colorClassRed(item)" style="white-space: nowrap">
          {{ item.sklad }}
        </td>
      </template>
      <template v-slot:item.norma="{ item }">
        <td style="white-space: nowrap">{{ item.norma }}</td>
      </template>
      <template v-slot:item.zakaz="{ item }">
        <td style="white-space: nowrap">{{ calculateOrder(item) }}</td>
      </template>
      <template v-slot:item.issue="{ item }">
        <v-btn color="primary" @click="(event) => onIssueTool(event, item)">
          <v-icon icon="mdi-hand-extended" />
        </v-btn>
      </template>
      <template v-slot:item.damaged="{ item }">
        <v-btn color="red" @click="(event) => onDamagedTool(event, item)">
          <v-icon icon="mdi-image-broken-variant" />
        </v-btn>
      </template>
      <template v-slot:item.cart="{ item }">
        <v-btn color="yellow" @click="addToolToCart(item.id, 1)">
          <template v-slot:prepend>
            <v-icon start icon="mdi-cart-arrow-down" />
          </template>
          В корзину
        </v-btn>
      </template>
    </v-data-table-server>
  </v-container>
</template>

<script>
import ModalIssue from './ModalIssue.vue'
import ModalDamaged from './ModalDamaged.vue'
import ToolFilter from './ToolFilter.vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import { mapActions, mapMutations, mapGetters } from 'vuex'

export default {
  emits: ['changes-saved', 'canceled', 'page-changed', 'page-limit-changed'],
  components: {
    VDataTableServer,
    ToolFilter,
    ModalIssue,
    ModalDamaged,
  },
  props: {
    namespace: {
      type: String,
      default: 'tool',
    },
  },
  computed: {
    ...mapGetters('IssueToolStore', [
      'toolsTotalCount',
      'formattedTools',
      'dynamicFilters',
      'filters',
      'parentCatalog',
      'isLoading',
      'cartItems', // Предполагается, что у вас есть такой геттер
    ]),
  },
  data() {
    return {
      openDialog: false,
      isDataLoaded: false,
      editingToolId: null, //редактирование идентификатора инструмента
      toolTableHeaders: [], //заголовки таблиц инструментов
      filterParamsList: [],
      currentModal: null,
    }
  },
  watch: {
    'parentCatalog.id'(newId) {
      if (newId != null) {
        this.fetchToolsDynamicFilters()
      }
    },
    dynamicFilters: {
      immediate: true,
      handler(dynamicFilters) {
        this.toolTableHeaders = [
          { title: '№', key: 'index', sortable: false },
          { title: 'Маркировка', key: 'name', sortable: false },

          ...(dynamicFilters && dynamicFilters.length > 0
            ? dynamicFilters.map(({ label: title, key }) => ({
                title,
                key,
                sortable: false,
              }))
            : []),

          // { title: 'Заказ', key: 'zakaz', sortable: false },
          // { title: 'Лимит', key: 'limit', sortable: fals
          { title: 'Выдать по 1', key: 'issue', sortable: false },
          { title: 'Поврежден', key: 'damaged', sortable: false },
          { title: 'Корзина', key: 'cart', sortable: false },
          { title: 'Норма', key: 'norma', sortable: false },
          { title: 'Склад', key: 'sklad', sortable: false },
        ]
      },
    },
  },

  async mounted() {
    await this.fetchToolsDynamicFilters()
    this.isDataLoaded = true
  },
  methods: {
    ...mapActions('IssueToolStore', [
      'fetchToolsDynamicFilters',
      'fetchToolsByFilter',
    ]),
    ...mapMutations('IssueToolStore', [
      'setCurrentPage',
      'setItemsPerPage',
      'setSelectedDynamicFilters',
    ]),
    showModal(type) {
      this.currentModalType = type
      this.isModalOpen = true
    },
    addToolToCart(toolId, quantityToAdd) {
      const tool = this.formattedTools.find((t) => t.id === toolId)
      if (!tool) {
        alert('Товар не найден.')
        return
      }

      // Найти, если товар уже есть в корзине
      const existingCartItem = this.cartItems.find(
        (item) => item.toolId === toolId
      )
      const totalQuantityInCart = existingCartItem
        ? existingCartItem.quantity + quantityToAdd
        : quantityToAdd

      if (totalQuantityInCart > tool.sklad) {
        alert(
          `Нельзя добавить указанное количество. На складе доступно: ${
            tool.sklad
          }, уже в корзине: ${
            existingCartItem ? existingCartItem.quantity : 0
          }.`
        )
      } else {
        // Если проверка прошла успешно, добавляем в корзину
        this.$store.dispatch('IssueToolStore/addToCartAction', {
          toolId: tool.id,
          quantity: quantityToAdd,
          name: tool.name,
          sklad: tool.sklad,
        })
      }
    },
    onIssueTool(event, item) {
      event.stopPropagation()
      this.editingToolId = item.id
      this.currentModal = 'issue'
      console.log('openDialog')
      this.openDialog = true
    },
    onDamagedTool(event, item) {
      event.stopPropagation()
      this.editingToolId = item.id
      this.currentModal = 'damaged'
      console.log('openDialog')
      this.openDialog = true
    },
    // Метод для обработки обновления параметров фильтра
    onParamsFilterUpdate({ key, value }) {
      this.setSelectedDynamicFilters({
        ...this.filters.selectedDynamicFilters,
        [key]: value,
      })
      this.fetchToolsByFilter()
    },
    async onChangePage(page) {
      this.setCurrentPage(page)
      await this.fetchToolsByFilter()
    },
    async onUpdateItemsPerPage(itemsPerPage) {
      this.setItemsPerPage(itemsPerPage)
      await this.fetchToolsByFilter()
    },

    colorClassGrey(item) {
      return { grey: !item.sklad || item.sklad === 0 }
    },
    colorClassRed(item) {
      return { red: !item.sklad || item.sklad === 0 }
    },
    calculateOrder(tool) {
      const order = tool.norma - tool.sklad
      return order < 0 ? '' : order
    },

    onClosePopup() {
      this.openDialog = false
    },
    onSaveChanges() {
      this.openDialog = false
      this.fetchToolsDynamicFilters()
      this.fetchToolsByFilter()
    },
    onAddTool() {
      this.editingToolId = null
      this.openDialog = true
    },
  },
}
</script>

<style scoped>
.index {
  max-width: 40px !important;
  font-size: 0.9em;
  color: grey;
}

.grey {
  color: grey;
}

.red {
  color: red;
}
</style>
