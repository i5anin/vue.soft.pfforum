<template>
  <v-snackbar v-model="snackbar" :timeout="3000" color="error">
    {{ snackbarText }}
    <template #action="{ attrs }">
      <v-btn icon v-bind="attrs" @click="snackbar = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
  <Modal :title="popupTitle" widthDefault="650px">
    <template #content>
      <v-container>
        <div class="text-h6 pl-5 mb-2">Выбрать на какую деталь:</div>
        <v-row>
          <v-col>
            <v-text-field
              variant="outlined"
              label="поиск по ID"
              required
              @update:model-value="onIdChanged"
            />
            <v-select
              label="Название Обозначение"
              required
              v-model="toolModel.detailDescription"
              :disabled="!options.idNameDescription.length"
              :items="options.idNameDescription"
              @update:model-value="onIdSelected"
            />

            <v-select
              label="Номер Тип"
              required
              v-model="toolModel.operationType"
              :disabled="!options.numberType.length"
              :items="options.numberType"
              @update:model-value="setSelectedOperationId"
            />

            <v-combobox
              required
              v-model="selectedFio"
              :items="fioOptions"
              item-title="text"
              item-value="value"
              label="ФИО"
              return-object="false"
              single-line="false"
              @update:modelValue="handleSelectionChange"
            />

            <v-select
              required
              v-model="toolModel.typeIssue"
              :items="typeIssueOptions"
              item-text="title"
              item-value="id"
              label="Тип выдачи"
              return-object="false"
              single-line="false"
              :rules="issueTypeRules"
            />
          </v-col>
        </v-row>
        <v-table hover="true">
          <thead>
            <tr>
              <th>#</th>
              <th>Инструмент</th>
              <th>Кол-во</th>
              <th>Склад</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in cartItems" :key="item.id">
              <td style="color: gray">{{ index + 1 }}</td>
              <td>{{ item.name }}</td>
              <td>
                <v-btn
                  icon
                  size="x-small"
                  @click="decreaseQuantity(index)"
                  :disabled="item.quantity <= 1"
                >
                  <v-icon>mdi-minus</v-icon>
                </v-btn>
                {{ item.quantity }}
                <v-btn
                  icon
                  size="x-small"
                  @click="increaseQuantity(index)"
                  :disabled="item.quantity >= item.sklad"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </td>
              <td>{{ item.sklad }}</td>
              <td>
                <v-btn
                  icon
                  size="x-small"
                  @click="removeFromCartAction(item.toolId)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-container>
    </template>
    <template #action>
      <v-btn
        color="red darken-1"
        variant="text"
        @click="onCancel"
        class="text-none text-subtitle-1 ml-3"
      >
        Закрыть
      </v-btn>
      <v-spacer />
      <v-btn
        prepend-icon="mdi-hand-extended"
        @click="onSave"
        class="text-none text-subtitle-1 pl-3"
        color="blue darken-1"
        size="large"
        variant="flat"
        :disabled="submitButtonDisabled"
      >
        Выдать
      </v-btn>
    </template>
  </Modal>
</template>

<script>
import Modal from '@/modules/shared/components/Modal.vue'
import { issueToolApi } from '@/modules/issue-tool/api/issue'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { toolTreeApi } from '@/modules/tool/api/tree'

export default {
  name: 'Cart-Modal',
  emits: ['canceled', 'changes-saved', 'updatePage'],
  props: {
    persistent: { type: Boolean, default: false },
    toolId: { type: Number, default: null },
    radiusOptions: { type: Array },
  },
  components: { Modal },
  data: () => ({
    selectedFio: null,
    typeIssueOptions: [
      { title: 'Себе', id: 0 },
      { title: 'На ночь', id: 1 },
      { title: 'Наладка', id: 2 },
    ],
    submitButtonDisabled: false,
    isSubmitting: false, // Для блокировки кнопки во время ожидания
    submitError: false, // Для изменения стиля кнопки при ошибке
    snackbar: false,
    snackbarText: '',
    item: { cnc_type: '', fio: '' },
    damagedQuantity: 1,
    comment: null,
    selectedCnc: null,
    cncList: [],
    originalData: [],
    idMapping: {},
    fioOptions: [],
    selectedData: { name: null, description: null, no: null, type: null },
    localParentId: null,
    toolModel: { name: null, selectedOperationId: null },
    selectedParams: [],
    toolParams: [],
    confirmDeleteDialog: false,
    typeSelected: false,
    selectedType: '',
    operationMapping: {},
    issueTypeRules: [(v) => !!v || 'Тип выдачи обязателен для выбора'],
    parentIdRules: [
      (v) => !!v || 'ID папки обязательно',
      (v) => v > 1 || 'ID папки должен быть больше 1',
      (v) => v !== '' || 'ID папки не должен быть пустым',
    ],
    typeRules: [
      (v) => !!v || 'Поле обязательно для заполнения',
      (v) => (v && v.length >= 3) || 'Минимальная длина: 3 символа',
    ],

    options: {
      idNameDescription: [],
      numberType: [],
    },
  }),
  watch: {
    tool: {
      deep: true,
      immediate: true,
      async handler(editingToolId) {
        if (editingToolId == null) {
          this.resetToolModel()
        } else {
          await this.fetchToolById(editingToolId)
          // this.updateToolModel()
        }
      },
    },
  },

  computed: {
    ...mapGetters('IssueToolStore', [
      'nameOptions',
      'tool',
      'parentCatalog',
      'cartItems',
    ]),
    ...mapState('IssueToolStore', ['isModalOpen', 'parentCatalog']),
    selectedFioModel: {
      get() {
        return this.selectedFio // предполагается, что это значение из Vuex
      },
      set(value) {
        this.handleSelectionChange(value) // вызов метода для обновления Vuex хранилища
      },
    },
    currentFolderName() {
      return this.toolId === null ? this.idParent.label : this.tool.folder_name
    },

    popupTitle() {
      return 'Корзина'
    },
  },
  methods: {
    ...mapMutations('IssueToolStore', ['setTool']),
    ...mapActions('IssueToolStore', [
      'fetchToolsByFilter',
      'fetchToolById',
      'addToCartAction',
      'updateCartItemQuantityAction',
      'removeFromCartAction',
    ]),

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

    handleSelectionChange(selectedItem) {
      this.selectedFio = selectedItem // Убедитесь, что здесь правильно обновляется значение в Vuex
    },

    setSelectedOperationId(value) {
      // Здесь ваш код для обновления состояния, например:
      this.toolModel.selectedOperationId = value
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

    async onIdChanged(newId) {
      try {
        const result = await issueToolApi.searchById(newId)
        this.originalData = result // Сохраняем исходные данные для последующего использования
        this.options.idNameDescription = this.formatToolOptions(result)
      } catch (error) {
        console.error('Ошибка при поиске:', error)
      }
    },

    async sendIssueDataToApi() {
      const issueData = {
        operationId: this.toolModel.selectedOperationId, // ID операции
        userId: this.selectedFio, // ID пользователя
        typeIssue: this.toolModel.typeIssue, // Используем значение типа выдачи из v-select
        tools: this.cartItems.map((item) => ({
          toolId: item.toolId,
          quantity: item.quantity,
        })),
      }

      try {
        const response = await issueToolApi.addHistoryTools(issueData) // Отправка данных через API
        if (response && response.success === 'OK') {
          console.log('Данные успешно отправлены и обработаны', response)
          this.snackbarText = 'Успешно выдано'
          this.snackbar = true
          this.$emit('changes-saved')
        } else {
          throw new Error('Ответ сервера не соответствует ожидаемому')
        }
      } catch (error) {
        console.error('Ошибка при отправке данных:', error)
        this.snackbarText =
          error.message || 'Произошла ошибка при отправке данных'
        this.snackbar = true
        this.submitButtonDisabled = true
        setTimeout(() => {
          this.submitButtonDisabled = false // Повторно активировать кнопку через 5 секунд
        }, 5000)
      }
    },
    async onSave() {
      const isSuccess = await this.sendIssueDataToApi()
      if (isSuccess) {
        this.$emit('changes-saved')
        this.snackbarText = 'Успешно выдано'
        this.snackbar = true
      } else {
        // Обработка неудачного сохранения, если требуется.
        // Например, вы можете установить snackbarText на другое сообщение об ошибке здесь.
        // Это сообщение об ошибке может быть уже установлено в `sendIssueDataToApi`.
      }
      try {
        await this.sendIssueDataToApi() // Этот вызов повторяется, и не нужен, так как запрос к API уже выполнен выше.
        // console.log('Данные успешно отправлены и обработаны')
      } catch (error) {
        console.error('Произошла ошибка при отправке данных:', error)
      }
    },
    increaseQuantity(index) {
      const item = this.cartItems[index]
      if (item.quantity < item.sklad) {
        this.updateCartItemQuantityAction({
          toolId: item.toolId,
          quantity: item.quantity + 1,
        })
      }
    },
    resetToolModel() {
      this.toolModel = {
        name: null,
        limit: null,
        sklad: null,
        norma: null,
        property: {},
      }
      // console.log(this.toolModel)
    },
    decreaseQuantity(index) {
      const item = this.cartItems[index]
      if (item.quantity > 1) {
        this.updateCartItemQuantityAction({
          toolId: item.toolId,
          quantity: item.quantity - 1,
        })
      }
    },

    prepareFioOptions(fioData) {
      return fioData.map((item) => ({
        text: item.fio,
        value: item.id,
      }))
    },

    formatOperationOptions(data) {
      const uniqueSet = new Set()
      data.forEach((item) => {
        const label = `${item.no} - ${item.cnc_type}`
        if (!uniqueSet.has(label)) {
          uniqueSet.add(label)
          this.operationMapping[label] = item.specs_op_id
        }
      })
      return Array.from(uniqueSet)
    },

    initializeLocalState() {
      if (this.toolId) {
        this.fetchToolById(this.toolId).then(() => {
          this.toolModel.sklad = this.tool.sklad
          this.toolModel.norma = this.tool.norma
        })
      } else {
        this.localParentId = this.idParent.id
        this.currentFolderName = this.idParent.label
      }
    },

    prependOptionIfNeeded(value, optionsList) {
      if (value && !optionsList.some((option) => option.value === value))
        optionsList.unshift(value)
    },

    onCancel() {
      this.$emit('canceled')
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
