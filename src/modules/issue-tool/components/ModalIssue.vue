<template>
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
              label="поиск по ID"
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
            <v-combobox
              v-model="selectedFio"
              :items="fioOptions"
              item-title="text"
              item-value="value"
              label="ФИО"
              return-object="false"
              single-line="false"
              @update:modelValue="handleSelectionChange"
            />
            <v-combobox
              v-model="toolModel.typeIssue"
              :items="typeIssueOptions"
              item-text="title"
              item-value="id"
              label="Тип выдачи"
              return-object="false"
              single-line="false"
              :rules="issueTypeRules"
              required
            />
            <h2 class="text-h6">Сколько выдать:</h2>
            <v-text-field
              density="compact"
              label="Количество"
              required
              v-model="toolModel.issue"
              :rules="issueRules"
            />
            <v-textarea
              v-if="overNorm"
              class="comment-field"
              label="Комментарий"
              v-model="comment"
              rows="3"
              required
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
        Выдать
      </v-btn>
    </template>
  </Modal>
</template>

<script>
import Modal from '@/modules/shared/components/Modal.vue'
import { getToolParams } from '@/api'

import { mapActions, mapGetters, mapMutations } from 'vuex'
import { issueToolApi } from '@/modules/issue-tool/api/issue'

export default {
  name: 'FillingModal',
  emits: ['canceled', 'changes-saved'],
  props: {
    persistent: { type: Boolean, default: false },
    toolId: { type: Number, default: null },
  },
  components: { Modal },
  data() {
    return {
      typeIssueOptions: [
        { title: 'Себе', id: 0 },
        { title: 'На ночь', id: 1 },
        { title: 'Наладка', id: 2 },
      ],
      overNorm: false,
      originalData: [],
      idMapping: {},
      isModalOpen: true,
      selectedFio: null,
      fioOptions: [],
      selectedData: { name: null, description: null, no: null, type: null },
      localParentId: null,
      toolModel: {
        name: null,
        property: {},
        selectedOperationId: null,
        typeIssue: null,
      },
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
    }
  },
  computed: {
    ...mapGetters('IssueToolStore', ['nameOptions', 'tool', 'parentCatalog']),
    popupTitle() {
      return this.tool?.id != null
        ? `Выдать инструмент ID: ${this.tool.id}`
        : 'Добавить новый инструмент'
    },
  },
  watch: {
    toolId: {
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
  methods: {
    ...mapActions('IssueToolStore', ['fetchToolsByFilter', 'fetchToolById']),
    ...mapMutations('IssueToolStore', ['setTool']),

    handleSelectionChange(selectedItem) {
      console.log(
        `Выбрана фамилия: ${selectedItem.text} с ID:`,
        selectedItem.value
      )
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

    onOperationSelected(value) {
      const id = this.operationMapping[value]
      this.toolModel.selectedOperationId = id
      // console.log('Выбран specs_op_id:', id)
    },
    resetToolModel() {
      this.toolModel = {
        name: null,
        limit: null,
        sklad: null,
        norma: null,
        property: {},
      }
      console.log(this.toolModel)
    },
    updateToolModel() {
      if (this.tool) {
        this.toolModel = JSON.parse(JSON.stringify(this.tool))
      }
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
    initializeLocalState() {
      if (this.toolId) {
        console.log('this.toolId=', this.toolId)
        this.fetchToolById(this.toolId).then(() => {
          this.toolModel.sklad = this.tool.sklad
          this.toolModel.norma = this.tool.norma
        })
      } else {
        console.log('localParentId=', this.localParentId)
        // this.localParentId = this.idParent.id
        this.currentFolderName = this.idParent.label
      }
    },
    onCancel() {
      this.$emit('canceled')
    },
    async onSave() {
      try {
        // Подготовка данных инструмента для истории
        const issueHistoryData = {
          specs_op_id: this.toolModel.selectedOperationId,
          id_user: this.selectedFio.value,
          id_tool: this.toolId,
          type_issue: this.toolModel.typeIssue.id,
          quantity: parseInt(this.toolModel.issue),
          timestamp: new Date().toISOString(),
        }

        console.log('Отправка данных инструмента на сервер:', issueHistoryData)

        // Отправка данных истории инструмента
        const response = await issueToolApi.addHistoryTool(issueHistoryData)
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
  async created() {
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
}
</script>
