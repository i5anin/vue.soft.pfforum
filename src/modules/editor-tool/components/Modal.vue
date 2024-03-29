<template>
  <Modal :title="popupTitle" widthDefault="650px">
    <template #content>
      <v-container>
        <v-row>
          <v-col>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  label="Папка"
                  required
                  type="Text"
                  v-model="parentCatalog.label"
                  :disabled="true"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  label="ID папки"
                  required
                  type="Number"
                  v-model="parentCatalog.id"
                  :rules="parentIdRules"
                />
              </v-col>
            </v-row>
            <!--левый столбец -->
            <div>
              <v-combobox
                variant="outlined"
                label="Маркировка"
                :items="toolNameOptions"
                v-model="toolModel.name"
                item-text="text"
                item-value="value"
                required
                :rules="typeRules"
              />
            </div>
            <h2 class="text-h6">Характеристики:</h2>
            <div v-for="(param, index) in selectedParamsInfo" :key="param.id">
              <v-container>
                <v-row>
                  <v-col cols="6" class="pa-1">
                    <v-select
                      variant="solo-filled"
                      density="compact"
                      v-model="param.info"
                      :items="availableToolParamOptions"
                      label="Параметр"
                      single-line="true"
                      solo
                      @update:model-value="(value) => selectParam(value, index)"
                    />
                  </v-col>
                  <v-col cols="5" class="pa-1">
                    <v-combobox
                      density="compact"
                      v-model="toolModel.property[param.id]"
                      :items="toolParamsOptions[param.id]"
                      label="Значение"
                      clearable="true"
                      single-line="true"
                      solo
                    />
                  </v-col>
                  <v-col cols="1" class="d-flex justify-end">
                    <v-btn size="small" icon @click="removeParameter(param.id)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </div>
            <v-row justify="center">
              <v-col cols="12" class="text-center mb-4">
                <v-btn
                  color="primary"
                  @click="addParameterValuePair"
                  v-show="isAddButtonVisible"
                >
                  Добавить
                </v-btn>
              </v-col>
            </v-row>

            <v-divider class="my-1" />
            <v-row>
              <v-col cols="6">
                <v-text-field
                  type="number"
                  density="compact"
                  label="Нормативный запас"
                  required
                  v-model="toolModel.norma"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  type="number"
                  density="compact"
                  label="Склад"
                  required
                  v-model="toolModel.sklad"
                />
              </v-col>
            </v-row>
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
  <!-- v-snackbar для отображения сообщений об ошибке -->
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" bottom right>
    {{ snackbar.text }}
    <v-btn color="white" text @click="snackbar.show = false">Закрыть</v-btn>
  </v-snackbar>
</template>

<script>
import Modal from '@/modules/shared/components/Modal.vue'
import { getToolParams } from '@/api'
import { editorToolApi } from '../api/editor'
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
      snackbar: {
        show: false,
        color: 'error',
        text: '',
      },
      toolModel: {
        name: null,
        property: {},
        limit: null,
        sklad: null,
        norma: null,
      },
      toolNameOptions: [],
      parameterValuePairs: [{ parameter: null, value: null }],
      toolParamOptions: [],
      toolParamsOptions: {},
      selectedParams: [],
      toolParams: [],
      confirmDeleteDialog: false,
      typeSelected: false,
      selectedType: '',
      parentIdRules: [
        (v) => !!v || 'ID папки обязательно',
        (v) => v > 1 || 'ID папки должен быть больше 1',
        (v) => v !== '' || 'ID папки не должен быть пустым',
      ],
      typeRules: [
        (v) => !!v || 'Поле обязательно для заполнения',
        (v) => (v && v.length >= 3) || 'Минимальная длина: 3 символа',
      ],
    }
  },
  computed: {
    ...mapGetters('EditorToolStore', ['nameOptions', 'tool', 'parentCatalog']),
    availableToolParamOptions() {
      // Фильтрация toolParamOptions, чтобы показывать только те, которые еще не выбраны
      return this.toolParamOptions.filter(
        (option) => !this.selectedParams.includes(option)
      )
    },
    isAddButtonVisible() {
      const uniqueSelectedParamsCount = new Set(
        Object.keys(this.toolModel.property)
      ).size
      const totalAvailableParams = this.toolParams.length
      return uniqueSelectedParamsCount < totalAvailableParams
    },
    selectedParamsInfo() {
      // Возвращаем информацию о выбранных параметрах на основе текущего состояния toolModel.property
      return Object.entries(this.toolModel.property)
        .map(([key, value]) => {
          const param = this.toolParams.find(
            (param) => param.id.toString() === key
          )
          return param ? { ...param, value } : null
        })
        .filter((param) => param !== null)
    },
    popupTitle() {
      return this.tool?.id != null
        ? `Редактировать инструмент ID: ${this.tool.id}`
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
    ...mapActions('EditorToolStore', ['fetchToolsByFilter', 'fetchToolById']),
    ...mapMutations('EditorToolStore', ['setTool']),

    showErrorSnackbar(message) {
      this.snackbar.text = message
      this.snackbar.color = 'error'
      this.snackbar.show = true
    },
    async fetchToolNamesByParentId(parentId) {
      try {
        this.toolNameOptions =
          await editorToolApi.getToolNamesByParentId(parentId)
      } catch (error) {
        console.error('Ошибка при получении названий инструментов:', error)
      }
    },

    async fetchToolParamsByParentId(parentId) {
      try {
        const paramsData = await editorToolApi.getToolParamsByParentId(parentId)
        // Создаем новый объект для обновления, чтобы обеспечить реактивность
        let newToolParamsOptions = {}
        paramsData.forEach((item) => {
          newToolParamsOptions[item.id] = item.values
        })
        // Прямое обновление toolParamsOptions
        this.toolParamsOptions = newToolParamsOptions
      } catch (error) {
        console.error('Ошибка при получении данных о параметрах:', error)
      }
    },
    removeParameter(id) {
      // Запрашиваем подтверждение у пользователя
      if (window.confirm('Вы уверены, что хотите удалить этот параметр?')) {
        // Удаляем параметр из toolModel.property, если пользователь подтвердил удаление
        delete this.toolModel.property[id]

        // Обновляем состояние, чтобы Vue мог отреагировать на изменения
        this.toolModel.property = { ...this.toolModel.property }

        // Обновляем selectedParams и selectedParamsInfo
        this.updateSelectedParams()
      }
    },

    selectParam(paramInfo) {
      const selectedParam = this.toolParams.find((p) => p.info === paramInfo)
      if (selectedParam) {
        // Удаляем временный ключ, если он был использован
        const newProperty = { ...this.toolModel.property }
        delete newProperty[-1]

        // Обновляем значение выбранного параметра
        newProperty[selectedParam.id] = this.toolModel.property[-1] || ''

        this.toolModel.property = newProperty

        // Важно! Обновляем список selectedParams после выбора параметра
        this.updateSelectedParams()
      }
    },
    updateSelectedParams() {
      this.selectedParams = Object.keys(this.toolModel.property)
        .map((id) => {
          const param = this.toolParams.find((param) => String(param.id) === id)
          return param ? param.info : null
        })
        .filter((info) => info !== null)
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
    addParameterValuePair() {
      // Проверяем, существует ли уже параметр с временным ID 0 в selectedParams
      if (!this.selectedParams.includes('-1')) {
        const newToolParam = { id: -1, info: null }
        this.toolParams.push(newToolParam)

        // Обновляем toolModel.property для добавления нового параметра с временным значением
        this.toolModel.property[newToolParam.id] = null

        // Обновляем selectedParams, чтобы включить новый временный параметр
        this.updateSelectedParams()
      }
    },
    updateToolModel() {
      if (this.tool) {
        this.toolModel = JSON.parse(JSON.stringify(this.tool))
      }
    },
    logModelValue(paramId) {
      console.log('Value changed for param ID:', paramId)
    },
    prependOptionIfNeeded(value, optionsList) {
      if (value && !optionsList.some((option) => option.value === value))
        optionsList.unshift(value)
    },
    prepareFioOptions(fioData) {
      return fioData.map((item) => ({
        text: item.fio,
        value: item.id,
      }))
    },
    confirmDelete() {
      if (window.confirm('Вы уверены, что хотите удалить этот инструмент?'))
        this.onDelete()
    },
    async onDelete() {
      // Предполагается, что метод onDelete вызывается, когда пользователь подтверждает удаление
      const { id } = this.toolModel
      if (id != null) {
        try {
          const response = await editorToolApi.deleteTool(id)
          if (response.success === 'OK') {
            this.$emit('changes-saved')
          }
        } catch (error) {
          console.error('Ошибка при удалении инструмента:', error)
          this.showErrorSnackbar('Инструмент используется в истории.')
        }
      }
    },
    onCancel() {
      this.$emit('canceled')
    },
    async onSave() {
      const toolDataToSend = {
        ...this.toolModel,
        parent_id: this.parentCatalog.id,
      }
      try {
        let response
        if (this.toolId) {
          response = await editorToolApi.updateTool(this.toolId, toolDataToSend)
        } else {
          response = await editorToolApi.addTool(toolDataToSend)
        }
        console.log(response, response.status)
        if (response.success === 'OK') this.$emit('changes-saved')
      } catch (error) {
        console.error(
          'Ошибка при сохранении:',
          error.response ? error.response.data : error
        )
      }
    },
  },
  async created() {
    await this.fetchToolParamsByParentId(this.parentCatalog.id)
    await this.fetchToolNamesByParentId(this.parentCatalog.id)
    try {
      // Получение списка параметров инструмента
      const rawToolParams = await getToolParams()
      this.toolParams = [...rawToolParams]
      this.toolParamOptions = rawToolParams.map((param) => param.info) // Предполагается, что каждый параметр содержит поле info

      // Если модель инструмента уже содержит выбранные параметры, обновите selectedParams
      if (
        this.toolModel.property &&
        Object.keys(this.toolModel.property).length > 0
      ) {
        const propertyIds = Object.keys(this.toolModel.property)
        this.selectedParams = this.toolParams
          .filter((param) => propertyIds.includes(String(param.id)))
          .map((param) => param.info)
      }
    } catch (error) {
      console.error('Ошибка при загрузке параметров инструмента:', error)
    }

    // this.initializeLocalState()
    if (this.toolId == null) {
      this.setTool({
        id: null,
        name: null,
        property: {},
      })
    } else {
      await this.fetchToolById(this.toolId)
      if (this.tool && this.tool.property === null) {
        this.tool.property = {}
      }
    }
  },
}
</script>
