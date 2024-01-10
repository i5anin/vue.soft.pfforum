<template>
  <!--  <form @submit.prevent='onSubmit'>-->
  <Modal :title="popupTitle">
    <template #content>
      <v-container>
        <v-row>
          <v-col>
            <!--левый столбец -->
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
            <h2 class="text-h6">Деталь:</h2>
            <v-text-field
              density="compact"
              label="ID"
              required
              @update:model-value="onIdChanged"
            />
            <v-select
              density="compact"
              label="Название Обозначение"
              required
              v-model="toolModel.detailDescription"
              :disabled="!options.idNameDescription.length"
              :items="options.idNameDescription"
            />
            <v-select
              density="compact"
              label="Номер Тип"
              required
              v-model="toolModel.operationType"
              :disabled="!options.numberType.length"
              :items="options.numberType"
              @update:model-value="onOperationSelected"
            />

            <!--            :disabled="!toolModel.detailName"-->
            <!--            <h2 class="text-h6">Операция:</h2>-->
            <!--            <v-select-->
            <!--              density="compact"-->
            <!--              label="Выберите деталь"-->
            <!--              required-->
            <!--              v-model="toolModel.operationType"-->
            <!--              :disabled="!toolModel.no"-->
            <!--              :items="options.operation"-->
            <!--              @update:model-value="onToolOperationId"-->
            <!--            />-->
            <h2 class="text-h6">Кому выдать:</h2>
            <v-select
              v-model="selectedFio"
              :items="fioOptions"
              item-title="text"
              item-value="value"
              label="ФИО"
              return-object
              single-line
              @update:modelValue="handleSelectionChange"
            />
            <h2 class="text-h6">Сколько выдать:</h2>
            <v-text-field
              density="compact"
              label="Количество"
              required
              v-model="toolModel.norma"
            />
            <h2 class="text-h6"></h2>
            <div></div>
          </v-col>
        </v-row>
      </v-container>
    </template>
    <template #action>
      <v-btn
        color="red darken-1"
        variant="text"
        @click="confirmDelete"
        class="text-none text-subtitle-1 ml-3"
      >
        Удалить
      </v-btn>
      <v-spacer />
      <v-btn
        color="red darken-1"
        variant="text"
        @click="onCancel"
        class="text-none text-subtitle-1 ml-3"
      >
        Закрыть
      </v-btn>
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
  <!--  </form> -->
  <DeleteConfirmationDialog
    :confirmDeleteDialog="confirmDeleteDialog"
    :onDelete="onDelete"
  />
</template>

<script>
import Modal from '@/components/shared/Modal.vue'
import DeleteConfirmationDialog from '@/modules/tool/components/modal/DeleteConfirmationDialog.vue'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { detailApi } from '@/modules/issue-tool/api/detail'

export default {
  name: 'EditToolModal',
  emits: ['canceled', 'changes-saved'], // объявления пользовательских событий
  //props контракт общение что использовать и что передавать от родительского компонента к дочернему
  props: {
    persistent: { type: Boolean, default: false },
    toolId: { type: Number, default: null },
    radiusOptions: { type: Array },
  },
  components: { DeleteConfirmationDialog, Modal },
  //реактивные данные
  data: () => ({
    selectedFio: null,
    fioOptions: [],
    selectedData: {
      name: null,
      description: null,
      no: null,
      type: null,
    },
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
  // [data] - используется для определения реактивных данных компонента, которые непосредственно управляют состоянием и поведением этого компонента.
  // [watch] - используется для отслеживания изменений в этих данных (или в других реактивных источниках) и выполнения дополнительных действий или логики в ответ на эти изменения.

  watch: {
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
    console.log('Вызов getDetailFio')
    try {
      const fioData = await detailApi.getDetailFio()
      this.fioOptions = this.prepareFioOptions(fioData)
    } catch (error) {
      console.error('Ошибка при загрузке данных ФИО:', error)
    }
    // Дополнительное логирование состояния после обработки
    // console.log('fioOptions после обработки:', this.fioOptions)
    this.initializeLocalState()
    if (this.toolId == null) {
      this.setTool({
        id: null,
        name: null,
        property: {},
      })
    } else {
      await this.fetchToolById(this.toolId)
      if (this.tool.property === null) this.tool.property = {}
    }
    const rawToolParams = await getToolParams()
    this.toolParams = [...rawToolParams]
    this.toolModel = JSON.parse(JSON.stringify(this.tool))
    const propertyIds = Object.keys(this.toolModel.property).map((key) => key)
    this.selectedParams = this.toolParams
      .filter(({ id }) => propertyIds.includes(String(id)))
      .map(({ info }) => info)
    this.toolParamOptions = rawToolParams.map((param) => param.info)
  },

  computed: {
    ...mapGetters('tool', [
      'widthOptions',
      'shagOptions',
      'gabaritOptions',
      'nameOptions',
      'tool',
    ]),
    ...mapState('tool', ['idParent']),
    currentFolderName() {
      return this.toolId === null ? this.idParent.label : this.tool.folder_name
    },
    selectedParamsInfo() {
      return this.selectedParams
        .map((paramName) =>
          this.toolParams.find(({ info }) => info === paramName)
        )
        .filter((selectedParam) => selectedParam != null)
    },

    popupTitle() {
      return this.tool?.id != null
        ? `Редактировать инструмент ID: ${this.tool.id}`
        : 'Добавить инструмент'
    },
  },
  methods: {
    ...mapMutations('tool', ['setTool']),
    ...mapActions('tool', [
      'fetchUniqueToolSpecs',
      'fetchToolsByFilter',
      'onSaveToolModel',
      'fetchToolById',
    ]),

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

    onOperationSelected(value) {
      const id = this.operationMapping[value]
      this.toolModel.selectedOperationId = id
      console.log('Выбран specs_op_id:', id)
    },

    formatToolOptions(data) {
      const uniqueSet = new Set()
      return data.reduce((acc, item) => {
        const formattedItem = item.description
          ? `${item.id} - ${item.name} - ${item.description}`
          : `${item.id} - ${item.name}`

        if (!uniqueSet.has(formattedItem)) {
          uniqueSet.add(formattedItem)
          acc.push(formattedItem)
        }

        return acc
      }, [])
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

    async onIdChanged(newId) {
      // console.log('onIdChanged. ID изменено:', newId)
      clearTimeout(this.debounceTimeout)
      this.debounceTimeout = setTimeout(async () => {
        try {
          console.log('Выполнение поиска для ID:', newId)
          const result = await detailApi.searchById(newId)
          //TODO: console.log('Результат поиска:', result)
          this.options.idNameDescription = this.formatToolOptions(result)
          this.options.numberType = this.formatOperationOptions(result)
        } catch (error) {
          console.error('Ошибка при поиске:', error)
        }
      }, 500)
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

    logModelValue(paramId) {
      console.log('Value changed for param ID:', paramId)
    },

    prependLastSavedData(data) {
      if (!data) return
      this.prependOptionIfNeeded(data.name, this.nameOptions, 'name')
    },

    prependOptionIfNeeded(value, optionsList) {
      if (value && !optionsList.some((option) => option.value === value))
        optionsList.unshift(value)
    },

    parseToFloat(value) {
      if (value === null) return 0
      return parseFloat(value.toString().replace(',', '.'))
    },

    confirmDelete() {
      this.confirmDeleteDialog = true
    },
    async onDelete() {
      const { id } = this.toolModel
      if (id != null) {
        try {
          const { result } = await deleteTool(id)
          if (result) {
            this.$emit('changes-saved')
            await this.fetchToolsByFilter()
          }
        } catch (error) {
          console.error('Ошибка при удалении инструмента:', error)
        }
      }
    },
    onCancel() {
      this.$emit('canceled')
    },
    async onSave() {
      try {
        // Подготовка данных инструмента для истории
        const toolHistoryData = {
          id_oper: this.toolModel.selectedOperationId,
          id_user: this.selectedFio.value,
          id_tool: this.toolId,
          quantity: parseInt(this.toolModel.norma),
          date: new Date().toISOString(),
        }

        console.log('Отправка данных инструмента:', toolHistoryData)

        // Отправка данных истории инструмента
        const response = await detailApi.addHistoryTool(toolHistoryData)

        if (response.success === 'OK') {
          this.$emit('changes-saved')
          this.fetchToolsByFilter()
        } else {
          console.error('Ошибка при сохранении: ', response.data)
        }
      } catch (error) {
        console.error(
          'Ошибка при сохранении: ',
          error.response ? error.response.data : error
        )
      }
    },
  },
}
</script>
