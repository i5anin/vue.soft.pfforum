<template>
  <Modal :title="popupTitle">
    <template #content>
      <v-container>
        <v-row>
          <v-col>
            <div class="flex">
              <v-text-field
                label="ID папки"
                required
                type="number"
                v-model="parentCatalog.id"
                :rules="parentIdRules"
              />
              <v-text-field
                label="Папка"
                required
                type="text"
                v-model="parentCatalog.label"
                :disabled="true"
              />
            </div>
            <v-divider class="my-4"></v-divider>
            <template
              v-for="(pair, index) in parameterValuePairs"
              :key="`pair-${index}`"
            >
              <v-row align="center">
                <v-col cols="5">
                  <v-combobox
                    :items="toolParamOptions"
                    label="Параметр"
                    v-model="pair.parameter"
                    item-text="info"
                    item-value="id"
                    return-object
                    dense
                  ></v-combobox>
                </v-col>
                <v-col cols="5">
                  <v-combobox
                    :items="valueOptions"
                    label="Значение"
                    v-model="pair.value"
                    item-text="text"
                    item-value="value"
                    return-object
                    dense
                  ></v-combobox>
                </v-col>
                <v-col cols="2">
                  <v-btn icon @click="removeParameterValuePair(index)">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </template>
            <v-btn color="primary" @click="addParameterValuePair"
              >Добавить пару</v-btn
            >
          </v-col>
        </v-row>
      </v-container>
    </template>
    <template #action>
      <v-btn color="red darken-1" variant="text" @click="confirmDelete">
        Удалить
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn color="red darken-1" variant="text" @click="onCancel">
        Закрыть
      </v-btn>
      <v-btn
        color="blue darken-1"
        @click="onSave"
        prepend-icon="mdi-check-circle"
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
      parentCatalog: { id: null, label: '' },
      parameterValuePairs: [{ parameter: null, value: null }],
      toolParamOptions: [],
      selectedParams: [],
      geometryOptions: [],
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
    initializeLocalState() {
      // Здесь ваш код для инициализации состояния
      console.log('Инициализация локального состояния компонента')
      // Пример инициализации:
      this.parentCatalog = { id: null, label: '' }
      this.parameterValuePairs = [{ parameter: null, value: null }]
      // и так далее для других необходимых начальных установок
    },
    addParameterValuePair() {
      this.parameterValuePairs.push({ parameter: null, value: null })
    },
    removeParameterValuePair(index) {
      this.parameterValuePairs.splice(index, 1)
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
    console.log('Вызов getDetailFio')
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

    this.initializeLocalState()
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
