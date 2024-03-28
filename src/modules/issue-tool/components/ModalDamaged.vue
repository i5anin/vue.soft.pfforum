<template>
  <!--  <form @submit.prevent='onSubmit'>-->
  <Modal :title="popupTitle">
    <template #content>
      <v-container>
        <v-row>
          <v-col>
            <div>
              <v-combobox
                density="compact"
                label="Маркировка"
                v-model="toolModel.name"
                :items="nameOptions"
                item-text="text"
                item-value="value"
                required
                :rules="typeRules"
                readonly="true"
                disabled="true"
              />
            </div>
            <v-combobox
              v-model="selectedCnc"
              :items="cncList"
              label="Выберите станок"
              item-title="cnc_name"
              item-value="cnc_code"
              required
              single-line="false"
            />
            <v-text-field
              label="Количество"
              v-model="damagedQuantity"
              type="number"
              min="1"
              required
            />
            <v-combobox
              v-model="selectedFio"
              :items="fioOptions"
              item-title="text"
              item-value="value"
              label="ФИО кто повредил"
              return-object="false"
              single-line="false"
              @update:modelValue="handleSelectionChange"
            />
            <v-textarea
              class="comment-field"
              label="Комментарий"
              v-model="comment"
              rows="3"
              required
            />
          </v-col>
        </v-row>
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
        prepend-icon="mdi-check-circle"
        @click="onSave"
        class="text-none text-subtitle-1 pl-3"
        color="blue darken-1"
        size="large"
        variant="flat"
      >
        Сохранить
      </v-btn>
    </template>
  </Modal>
</template>

<script>
import Modal from '@/modules/shared/components/Modal.vue'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { issueToolApi } from '@/modules/issue-tool/api/issue'

export default {
  name: 'Issue-Modal',
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
    'tool.sklad': function (newVal) {
      console.log('tool.sklad changed from ', newVal)
    },
    selectedFio(newValue) {
      console.log('Выбранное значение fio_id:', newValue)
    },
    tool: {
      deep: true,
      immediate: true,
      handler(newTool) {
        if (newTool) {
          this.localParentId = newTool.parent_id
          this.currentFolderName = newTool.folder_name
        } else {
          this.localParentId = this.idParent.id
          this.currentFolderName = this.idParent.label
        }
      },
    },
  },

  async created() {
    try {
      // Вызов API для получения данных о ФИО
      const fioData = await issueToolApi.getDetailFio()
      // Подготовка опций ФИО для селектора
      this.fioOptions = this.prepareFioOptions(fioData)

      // Вызов API для получения списка станков
      // Получение списка станков
      const cncData = await issueToolApi.fetchCncList()
      // Обновление cncList для обеспечения реактивности
      this.cncList = cncData ? [...cncData] : []
      // Проверка и присвоение полученных данных о станках
      if (cncData && Array.isArray(cncData)) {
        this.cncList = cncData
      } else {
        console.error('Ошибка при получении списка станков:', cncData)
      }

      // Инициализация локального состояния компонента
      this.initializeLocalState()

      // Если toolId не задан, устанавливаем начальные данные для инструмента
      if (this.toolId == null) {
        this.setTool({
          id: null,
          name: null,
          property: {},
        })
      } else {
        // Если toolId задан, запрашиваем данные об инструменте
        await this.fetchToolById(this.toolId)
        if (this.tool.property === null) this.tool.property = {}
      }
    } catch (error) {
      console.error('Ошибка в created:', error)
    }
  },

  computed: {
    ...mapGetters('IssueToolStore', ['nameOptions', 'tool']),
    ...mapState('IssueToolStore', ['parentCatalog']),
    currentFolderName() {
      return this.toolId === null ? this.idParent.label : this.tool.folder_name
    },

    popupTitle() {
      return this.tool?.id != null
        ? `Инструмент поврежден ID: ${this.tool.id}`
        : 'Ошибка нет ID'
    },
  },
  methods: {
    ...mapMutations('IssueToolStore', ['setTool']),
    ...mapActions('IssueToolStore', ['fetchToolsByFilter', 'fetchToolById']),

    handleSelectionChange(selectedItem) {
      console.log(
        `Выбрана фамилия: ${selectedItem.text} с ID:`,
        selectedItem.value
      )
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
    async onSave() {
      try {
        const damagedToolData = {
          id_tool: this.toolId,
          id_user: this.selectedFio.value,
          // Убедитесь, что selectedCnc является строкой, представляющей cnc_code
          cnc_code: this.selectedCnc.cnc_code,
          comment: this.comment,
          quantity: this.damagedQuantity,
        }

        // Отправка данных о поврежденном инструменте
        const response =
          await issueToolApi.addToolHistoryDamaged(damagedToolData)
        console.log('Ответ сервера:', response)

        if (response.success === 'OK') {
          console.log('Данные о поврежденном инструменте успешно сохранены')
          this.$emit('changes-saved')
        } else {
          console.error(
            'Ошибка при сохранении данных о поврежденном инструменте: ',
            response
          )
        }
      } catch (error) {
        console.error(
          'Ошибка при отправке данных о поврежденном инструменте: ',
          error
        )
      }
    },
  },
}
</script>
