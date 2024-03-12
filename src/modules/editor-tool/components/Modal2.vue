<template>
  <Modal :title="popupTitle">
    <template #content>
      <v-container>
        <v-row>
          <v-col>
            <h2 class="text-h6">Характеристики новые:</h2>
            <!--{{ selectedParamsInfo }}-->
            <div v-for="param in selectedParamsInfo" :key="param.id">
              <v-container>
                <v-row>
                  <v-select
                    :value="param.info"
                    @input="updateInfo(index, $event)"
                    :items="availableToolParamOptions"
                    label="Параметр"
                    single-line="true"
                    solo
                  />
                  <v-combobox
                    v-model="toolModel.property[param.id]"
                    label="Значение"
                    clearable="true"
                    single-line="true"
                    solo
                  />
                </v-row>
              </v-container>
            </div>
            <v-btn color="primary" @click="addParameterValuePair">
              Добавить
            </v-btn>
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
import Modal from '@/modules/shared/components/Modal.vue'
import { getToolParams } from '@/api'
import { editorToolApi } from '../api/editor'
import index, { mapActions, mapGetters, mapMutations } from 'vuex'
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
      toolModel: {
        name: null,
        property: {},
        limit: null,
        sklad: null,
        norma: null,
      },
      parameterValuePairs: [{ parameter: null, value: null }],
      toolParamOptions: [],
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
    index() {
      return index
    },
    ...mapGetters('EditorToolStore', ['nameOptions', 'tool', 'parentCatalog']),
    availableToolParamOptions() {
      // Фильтрация toolParamOptions, чтобы убрать уже выбранные параметры
      return this.toolParamOptions.filter(
        (option) => !this.selectedParams.includes(option)
      )
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
        : 'Добавить новый инструмент'
    },
  },
  watch: {
    toolId: {
      immediate: true,
      async handler(editingToolId) {
        console.log('editingToolId=', editingToolId)
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
    resetToolModel() {
      console.log('Новый инструмент resetToolModel')
      this.toolModel = {
        name: null,
        limit: null,
        sklad: null,
        norma: null,
        property: {},
      }
      console.log(this.toolModel)
    },
    updateInfo(paramIndex, newInfo) {
      const selectedParam = this.selectedParamsInfo[paramIndex]
      if (selectedParam) {
        this.$set(this.selectedParamsInfo, paramIndex, {
          ...selectedParam,
          info: newInfo,
        })
        // Также обновляем selectedParams, если нужно
        // Например, если selectedParams хранит только значения info
        this.$set(this.selectedParams, paramIndex, newInfo)
      }
    },
    addParameterValuePair() {
      // Проверяем, существует ли уже параметр с id: -1
      const exists = this.toolParams.some((param) => param.id === -1)

      // Если параметр с id: -1 уже существует, выходим из функции, не добавляя новый
      if (exists) return

      // Создаем новый параметр с id: -1
      const newToolParam = { id: -1, info: null } // Замените 'Некоторое значение' на желаемое значение

      // Добавляем новый параметр в массив параметров инструмента
      this.toolParams.push(newToolParam)

      // Добавляем значение info нового параметра в selectedParams, чтобы он отобразился
      this.selectedParams.push(newToolParam.info)

      // Обновляем toolModel.property для сохранения значения нового параметра
      this.toolModel.property[newToolParam.id] = null // Или другое начальное значение
    },
    updateToolModel() {
      if (this.tool) this.toolModel = JSON.parse(JSON.stringify(this.tool))
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
      const { id } = this.toolModel
      if (id != null) {
        try {
          const response = await editorToolApi.deleteTool(id)
          if (response.success === 'OK') this.$emit('changes-saved')
        } catch (error) {
          console.error('Ошибка при удалении инструмента:', error)
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
    // console.log('Вызов getDetailFio')
    try {
      const fioData = await issueToolApi.getDetailFio()
      this.fioOptions = this.prepareFioOptions(fioData)
    } catch (error) {
      console.error('Ошибка при загрузке данных ФИО:', error)
    }

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
