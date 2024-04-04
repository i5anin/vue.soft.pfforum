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

export default {
  name: 'ModalCart',
  emits: ['canceled', 'changes-saved', 'updatePage'],
  props: {
    persistent: { type: Boolean, default: false },
    toolId: { type: Number, default: null },
    radiusOptions: { type: Array },
  },
  components: { Modal },
  data: () => ({
    lastSendTime: null,
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
    toolModel: { name: null, property: {}, selectedOperationId: null },
    selectedParams: [],
    toolParams: [],
    confirmDeleteDialog: false,
    typeSelected: false,
    selectedType: '',
    operationMapping: {},
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
      'cartItems',
      'selectedFio',
      'selectedOperationId',
    ]),
    ...mapState('IssueToolStore', ['isModalOpen', 'parentCatalog']),

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
      'clearCart',
    ]),
    clearCartAction() {
      this.clearCart() // Это вызовет действие, которое в свою очередь вызовет мутацию CLEAR_CART
    },

    async sendIssueDataToApi() {
      if (
        !this.selectedOperationId ||
        !this.selectedFio ||
        !this.cartItems.length
      ) {
        this.snackbarText = 'Отсутствуют необходимые параметры для запроса'
        this.snackbar = true
        return
      }

      const issueData = {
        operationId: this.selectedOperationId,
        userId: this.selectedFio,
        tools: this.cartItems.map((item) => ({
          toolId: item.toolId,
          quantity: item.quantity,
        })),
      }

      try {
        const response = await issueToolApi.addHistoryTools(issueData)
        if (response.data.success === 'OK') {
          // Установка текста снекбара и его активация
          this.snackbarText =
            response.data.message || 'Инструменты успешно выданы'
          this.snackbar = true
          return response.data // Возвращаем данные для дальнейшей обработки
        } else {
          throw new Error(response.data.message || 'Неизвестная ошибка сервера')
        }
      } catch (error) {
        this.snackbarText =
          error.message || 'Произошла ошибка при отправке данных'
        this.snackbar = true
        return null // Возвращаем null или выбрасываем ошибку, чтобы обработать в onSave
      }
    },

    async onSave() {
      const now = Date.now() // Получаем текущее время
      if (this.lastSendTime && now - this.lastSendTime < 15000) {
        // 15 секунд = 15000 мс
        this.snackbarText = 'Подождите 15 секунд перед следующей отправкой'
        this.snackbar = true
        return
      }
      try {
        const response = await this.sendIssueDataToApi()
        console.log('Данные успешно отправлены и обработаны', response)
        // Вызываем очистку корзины только после успешного ответа от сервера
        this.clearCartAction()
        // Возможно, вы также захотите закрыть модальное окно или уведомить пользователя об успехе
        this.snackbarText = 'Инструменты успешно выданы'
        this.snackbar = true
        this.onCancel() // Если требуется закрыть модальное окно
      } catch (error) {
        console.error('Произошла ошибка при отправке данных:', error)
        // Обработка ошибки, корзина при этом не очищается
        let errorMessage = 'Произошла ошибка при отправке данных'
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          errorMessage = error.response.data.error
        } else if (error.message) {
          errorMessage = error.message
        }
        this.snackbarText = errorMessage
        this.snackbar = true
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
}
</script>
