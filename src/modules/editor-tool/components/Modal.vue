<template>
  <!--  <form @submit.prevent='onSubmit'>-->
  <Modal :title="popupTitle">
    <template #content>
      <v-container>
        <v-row>
          <v-col>
            <div class="flex">
              <v-text-field
                label="ID папки"
                required
                type="Number"
                v-model="localParentId"
                :rules="parentIdRules"
              />
              <v-text-field
                label="Папка"
                required
                :value="currentFolderName"
                :disabled="true"
              />
            </div>
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
              />
            </div>
            <!-- правый столбец -->
            <v-combobox
              :chips="true"
              multiple
              v-model="selectedParams"
              :items="toolParamOptions"
              label="Параметры"
              return-object
            />
            <h2 class="text-h6">Характеристики:</h2>
            <!-- динамические параметры -->
            <div v-for="param in selectedParamsInfo" :key="param.id">
              <v-combobox
                density="compact"
                :label="param.info"
                v-model="toolModel.property[param.id]"
                @input="logModelValue(param.id)"
                required
              />
            </div>
            <h2 class="text-h6">Склад:</h2>
            <v-text-field
              density="compact"
              label="Норма"
              required
              v-model="toolModel.norma"
            />
            <v-text-field
              density="compact"
              label="Склад"
              required
              v-model="toolModel.sklad"
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
import { getToolParams } from '@/api'
import { toolEditorApi } from '../api/editor'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  name: 'FillingModal',
  emits: ['canceled', 'changes-saved'],
  props: {
    persistent: { type: Boolean, default: false },
    toolId: { type: Number, default: null },
  },
  components: { Modal },
  data: () => ({
    localParentId: null,
    toolModel: { name: null, property: {} },
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
  }),
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
    ...mapGetters('EditorToolStore', [
      'widthOptions',
      'shagOptions',
      'gabaritOptions',
      'nameOptions',
      'tool',
    ]),
    ...mapState('EditorToolStore', ['idParent']),
    currentFolderName() {
      // return this.toolId === null ? this.idParent.label : this.tool.folder_name
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
    ...mapMutations('EditorToolStore', ['setTool']),
    ...mapActions('EditorToolStore', [
      'fetchUniqueToolSpecs',
      'fetchToolsByFilter',
      'onSaveToolModel',
      'fetchToolById',
    ]),
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
      if (window.confirm('Вы уверены, что хотите удалить этот инструмент?'))
        this.onDelete()
    },
    async onDelete() {
      const { id } = this.toolModel
      if (id != null) {
        try {
          const response = await toolEditorApi.deleteTool(id)
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
        parent_id: this.localParentId,
      }

      try {
        let response
        if (this.toolId) {
          response = await toolEditorApi.updateTool(this.toolId, toolDataToSend)
        } else {
          response = await toolEditorApi.addTool(toolDataToSend)
        }
        console.log(response, response.status)
        if (response.success === 'OK') this.$emit('changes-saved')
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
