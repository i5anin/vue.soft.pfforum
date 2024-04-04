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
    ]),

    async sendIssueDataToApi() {
      if (
        !this.selectedOperationId ||
        !this.selectedFio ||
        !this.cartItems.length
      ) {
        this.snackbarText = 'Отсутствуют необходимые параметры для запроса'
        this.snackbar = true
        return false
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
        // Проверяем, был ли запрос успешным.
        console.log(response)
        if (response && response.success === 'OK') {
          console.log('Данные успешно отправлены и обработаны', response)
          return true
        } else {
          throw new Error('Ответ сервера не соответствует ожидаемому')
        }
      } catch (error) {
        // Обработка ошибки
        this.submitButtonDisabled = true // Деактивировать кнопку при ошибке

        setTimeout(() => {
          this.submitButtonDisabled = false // Активировать кнопку обратно через 15 секунд
        }, 5000) // 5000 миллисекунд = 5 секунд

        // Здесь ловим ошибку и извлекаем сообщение об ошибке от API, если оно есть.
        let errorMessage = 'Произошла ошибка при отправке данных'
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          errorMessage = error.response.data.error // Используем сообщение об ошибке от API
        } else if (error.message) {
          errorMessage = error.message
        }
        console.error('Ошибка при отправке данных:', errorMessage)
        this.snackbarText = errorMessage
        this.snackbar = true
        return false
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
}
</script>
