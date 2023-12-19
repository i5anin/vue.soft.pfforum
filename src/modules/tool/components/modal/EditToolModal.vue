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
            <h2 class="text-h6">Размеры:</h2>
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
            <v-expansion-panels>
              <v-expansion-panel>
                <v-expansion-panel-title>Склад:</v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-text-field density="compact" label="Норма" required />
                  <v-text-field density="compact" label="Склад" required />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

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
import { deleteTool, getToolParams } from '@/api'
import DeleteConfirmationDialog from '@/modules/tool/components/modal/DeleteConfirmationDialog.vue'
import { mapActions, mapGetters, mapMutations } from 'vuex'

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
    toolParamOptions: [],
    selectedParams: [],
    geometryOptions: [],
    toolParams: [],
    toolModel: { name: null, property: {} },
    typeOptions: [],
    groupOptions: [],
    materialOptions: [],
    confirmDeleteDialog: false,
    typeSelected: false,
    selectedType: '',
    typeRules: [
      (v) => !!v || 'Поле обязательно для заполнения',
      (v) => (v && v.length >= 3) || 'Минимальная длина: 3 символа',
    ],
  }),
  // data - используется для определения реактивных данных компонента, которые непосредственно управляют состоянием и поведением этого компонента.
  // watch - используется для отслеживания изменений в этих данных (или в других реактивных источниках) и выполнения дополнительных действий или логики в ответ на эти изменения.
  async created() {
    this.loadLastSavedData()

    if (this.toolId == null) {
      this.setTool({
        id: null,
        name: null,
        property: {},
      })
      // TODO: this.selectedParams = [1, 2, 3]
    } else {
      await this.fetchToolById(this.toolId)
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
    selectedParamsInfo() {
      return this.selectedParams
        .map((paramName) =>
          this.toolParams.find(({ info }) => info === paramName)
        )
        .filter((selectedParam) => selectedParam != null)
    },
    ...mapGetters('tool', [
      'widthOptions',
      'shagOptions',
      'gabaritOptions',
      'nameOptions',
      'tool',
    ]),
    popupTitle() {
      return this.tool?.id != null
        ? `Редактировать инструмент ID: ${this.tool.id}`
        : 'Добавить инструмент'
    },
  },
  methods: {
    ...mapActions('tool', [
      'fetchUniqueToolSpecs',
      'fetchToolsByFilter',
      'onSaveToolModel',
      'fetchToolById',
    ]),
    ...mapMutations('tool', ['setTool']),
    logModelValue(paramId) {
      console.log(this.toolModel)

      if (this.toolModel.property[paramId] !== undefined) {
        console.log(
          `Значение для paramId ${paramId}:`,
          this.toolModel.property[paramId]
        )
      } else {
        console.log(`Значение для paramId ${paramId} не определено`)
      }
    },

    loadLastSavedData() {
      const lastSavedData = localStorage.getItem('lastSavedToolModel')
      if (lastSavedData) {
        const lastSavedToolModel = JSON.parse(lastSavedData)
        this.prependLastSavedData(lastSavedToolModel)
      }
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
            this.fetchToolsByFilter()
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
      this.onSaveToolModel(this.toolModel)
      this.$emit('changes-saved')
    },
  },
}
</script>
