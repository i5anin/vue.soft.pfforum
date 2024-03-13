<template>
  <Modal :title="popupTitle">
    <template #content>
      <v-container>
        <v-row>
          <v-col>
            <h2 class="text-h6">Характеристики новые:</h2>
            <div v-for="(param, index) in selectedParamsInfo" :key="param.id">
              <v-container>
                <v-row>
                  <v-select
                    v-model="param.info"
                    :items="availableToolParamOptions"
                    label="Параметр"
                    single-line="true"
                    solo
                    @change="selectParam(param.info, index)"
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
      toolModel: {
        name: null,
        property: {},
        limit: null,
        sklad: null,
        norma: null,
      },
      /*
      "id": 489,
      "parent_id": 2,
      "name": "S32-SVUBR16",
      "folder_name": "Токарный",
      "property": {
        "1": "Резец",
        "2": "расточной",
        "3": "универсальная",
        "11": "32",
        "13": "35 градусов большая рыбка",
        "-1": "123"
      },
      "sklad": 9,
      "limit": 0,
      "norma": null
      */
      toolParamOptions: [], //"Тип", "Группа", "Материал", "Ширина", "Габарит", "Шаг", "Длинна общая", "Длинна рабочей части", "Порядковый номер", "Диаметр хвостовика", "Диаметр", "Радиус", "Геометрия"
      selectedParams: [], // уже выбранные параметры [ "Тип", "Группа", "Материал", "Диаметр", "Геометрия" ]
      toolParams: [], //глобальные параметры [ { "id": 1, "info": "Тип" }, { "id": 2, "info": "Группа" }, { "id": 3, "info": "Материал" }, { "id": 4, "info": "Ширина" }, { "id": 5, "info": "Габарит" }, { "id": 6, "info": "Шаг" }, { "id": 7, "info": "Длинна общая" }, { "id": 8, "info": "Длинна рабочей части" }, { "id": 9, "info": "Порядковый номер" }, { "id": 10, "info": "Диаметр хвостовика" }, { "id": 11, "info": "Диаметр" }, { "id": 12, "info": "Радиус" }, { "id": 13, "info": "Геометрия" } ]
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
    ...mapGetters('EditorToolStore', ['tool', 'parentCatalog']),
    availableToolParamOptions() {
      // Фильтрация toolParamOptions, чтобы показывать только те, которые еще не выбраны
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
    selectParam(paramInfo, paramIndex) {
      const selectedParam = this.toolParams.find((p) => p.info === paramInfo)
      if (selectedParam) {
        // Обновляем информацию о параметре в selectedParams
        this.selectedParams[paramIndex] = selectedParam.info
        // Обновляем ID и информацию в toolModel.property
        Vue.set(
          this.toolModel.property,
          selectedParam.id,
          this.toolModel.property[-1]
        )
        delete this.toolModel.property[-1] // Удаляем временный ключ -1, если нужно
      }
    },
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
    addParameterValuePair() {
      const exists = this.toolParams.some((param) => param.id === -1)
      if (exists) return
      const newToolParam = { id: -1, info: null }
      this.toolParams.push(newToolParam)

      console.log('newToolParam.info=', newToolParam.info)
      console.log('newToolParam=', newToolParam)

      this.selectedParams.push(newToolParam.info) // Здесь возможна ошибка, так как info: null
      this.toolModel.property[newToolParam.id] = null
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
