<template>
  <!--  <form @submit.prevent='onSubmit'>-->
  <Modal :title="popupTitle" widthDefault="650px">
    <template #content>
      <v-container>
        <!--        <v-col cols="12" md="4">-->
        <!--        <h2>Корзина</h2>-->
        <v-table hover>
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
        <!--        </v-col>-->
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
        @click="onSave, sendIssueDataToApi"
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
import index, { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  name: 'Cart-Modal',
  emits: ['canceled', 'changes-saved'],
  props: {
    persistent: { type: Boolean, default: false },
    toolId: { type: Number, default: null },
    radiusOptions: { type: Array },
  },
  components: { Modal },
  data: () => ({
    damagedQuantity: 1,
    comment: null,
    selectedCnc: null,
    cncList: [],
    originalData: [],
    idMapping: {},
    isModalOpen: true,
    selectedFio: null,
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
    // 'tool.sklad': function (newVal) {
    //   console.log('tool.sklad changed from ', newVal)
    // },
    // selectedFio(newValue) {
    //   console.log('Выбранное значение fio_id:', newValue)
    // },
    tool: {
      deep: true,
      immediate: true,
      async handler(editingToolId) {
        if (editingToolId == null) {
          this.resetToolModel()
        } else {
          await this.fetchToolById(editingToolId)
          this.updateToolModel()
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
      'selectedFio',
      'selectedOperationId',
      'cartItems',
    ]),
    // ...mapGetters('IssueToolStore', ['nameOptions', 'tool']),
    ...mapState('IssueToolStore', ['parentCatalog']),

    async sendIssueDataToApi() {
      const issueData = {
        operation_id: this.selectedOperationId,
        user_id: this.$store.state.IssueToolStore.selectedFio,
        tools: this.cartItems.map((item) => ({
          tool_id: item.toolId,
          quantity: item.quantity,
        })),
      }

      // Вывод данных в консоль перед отправкой
      console.log('Отправляемые данные:', issueData)

      try {
        // TODO Предполагается, что issueToolApi.sendIssueData - это ваш API метод для отправки данных
        // const response = await issueToolApi.sendIssueData(issueData)
        // console.log('Ответ сервера:', response)
      } catch (error) {
        console.error('Ошибка при отправке данных:', error)
        // Обработка возможной ошибки, например, показ уведомления об ошибке
      }
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
    // async onSave() {
    //   try {
    //     const damagedToolData = {
    //       id_tool: this.toolId,
    //       id_user: this.selectedFio.value,
    //       // Убедитесь, что selectedCnc является строкой, представляющей cnc_code
    //       cnc_code: this.selectedCnc.cnc_code,
    //       comment: this.comment,
    //       quantity: this.damagedQuantity,
    //     }
    //
    //     // Отправка данных о поврежденном инструменте
    //     const response =
    //       await issueToolApi.addToolHistoryDamaged(damagedToolData)
    //     console.log('Ответ сервера:', response)
    //
    //     if (response.success === 'OK') {
    //       console.log('Данные о поврежденном инструменте успешно сохранены')
    //       this.$emit('changes-saved')
    //     } else {
    //       console.error(
    //         'Ошибка при сохранении данных о поврежденном инструменте: ',
    //         response
    //       )
    //     }
    //   } catch (error) {
    //     console.error(
    //       'Ошибка при отправке данных о поврежденном инструменте: ',
    //       error
    //     )
    //   }
    // },
  },
}
</script>
