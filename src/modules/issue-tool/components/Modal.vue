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
              @update:model-value="onIdSelected"
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
              v-model="toolModel.issue"
              :rules="issueRules"
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
</template>

<script>
import Modal from '@/components/shared/Modal.vue'
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
      const fioData = await issueToolApi.getDetailFio()
      this.fioOptions = this.prepareFioOptions(fioData)
    } catch (error) {
      console.error('Ошибка при загрузке данных ФИО:', error)
    }
    // Дополнительное логирование состояния после обработки
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
  },

  computed: {
    ...mapGetters('IssueToolStore', [
      'widthOptions',
      'shagOptions',
      'gabaritOptions',
      'nameOptions',
      'tool',
    ]),
    ...mapState('IssueToolStore', ['idParent']),
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
        : 'Ошибка нет ID'
    },
  },
  methods: {
    ...mapMutations('IssueToolStore', ['setTool']),
    ...mapActions('IssueToolStore', [
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

    onIdSelected(selectedValue) {
      const id = this.idMapping[selectedValue]
      if (id) {
        const filteredData = this.originalData.filter((item) => item.id === id)
        this.options.numberType = this.formatOperationOptions(filteredData)
      } else {
        console.error(
          'Не удалось найти ID для выбранного значения:',
          selectedValue
        )
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
      try {
        const result = await issueToolApi.searchById(newId)
        this.originalData = result // Сохраняем исходные данные для последующего использования
        this.options.idNameDescription = this.formatToolOptions(result)
      } catch (error) {
        console.error('Ошибка при поиске:', error)
      }
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
    onCancel() {
      this.$emit('canceled')
    },
    async onSave() {
      try {
        // Подготовка данных инструмента для истории
        const toolHistoryData = {
          specs_op_id: this.toolModel.selectedOperationId,
          id_user: this.selectedFio.value,
          id_tool: this.toolId,
          quantity: parseInt(this.toolModel.issue),
          date: new Date().toISOString(),
        }

        console.log('Отправка данных инструмента на сервер:', toolHistoryData)

        // Отправка данных истории инструмента
        const response = await issueToolApi.addHistoryTool(toolHistoryData)
        console.log('Ответ сервера:', response)

        if (response.success === 'OK') {
          console.log('Данные успешно сохранены на сервере')
          this.$emit('changes-saved')
          console.log('Событие changes-saved отправлено')
        } else {
          console.error(
            'Ошибка при сохранении данных на сервере: ',
            response.data
          )
        }
      } catch (error) {
        console.error(
          'Ошибка при отправке данных на сервер: ',
          error.response ? error.response.data : error
        )
      }
    },
  },
}
</script>
