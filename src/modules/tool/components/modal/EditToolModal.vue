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
              :items="toolParams"
              label="Параметры"
              return-object
            />
            <h2 class="text-h6">Размеры:</h2>
            <!-- динамические параметры -->
            <div v-for="param in selectedParamsInfo" :key="param.id">
              <v-combobox
                density="compact"
                :label="param.info"
                v-model="param.id"
                @input="logModelValue(param.id)"
                required
              />
            </div>
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
import { deleteTool, getLibraries, getToolParams } from '@/api'
import DeleteConfirmationDialog from '@/modules/tool/components/modal/DeleteConfirmationDialog.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'EditToolModal',
  emits: ['canceled', 'changes-saved'], // объявления пользовательских событий
  //props контракт общение что использовать и что передавать от родительского компонента к дочернему
  props: {
    persistent: { type: Boolean, default: false },
    tool: {
      type: Object,
      default: () => ({
        id: null,
        typeOptions: ['Step', 'Dimensions', 'Projection'],
      }),
    },
    radiusOptions: { type: Array },
  },
  components: { DeleteConfirmationDialog, Modal },
  //реактивные данные
  data: () => ({
    selectedParams: [],
    geometryOptions: [],
    toolParams: [],
    toolModel: { name: '', properties: {} },
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
  //Наблюдатель вызывает определенную функцию при изменении
  watch: {
    tool: {
      immediate: true,
      handler(tool) {
        this.toolModel = { name: '', properties: {} }
      },
    },
  },
  // data - используется для определения реактивных данных компонента, которые непосредственно управляют состоянием и поведением этого компонента.
  // watch - используется для отслеживания изменений в этих данных (или в других реактивных источниках) и выполнения дополнительных действий или логики в ответ на эти изменения.
  async mounted() {
    this.loadLastSavedData()
    const rawToolParams = await getToolParams()
    console.log('Начальные toolParams:', rawToolParams)
    this.toolParams = rawToolParams
  },
  computed: {
    selectedParamsInfo() {
      return this.selectedParams
        .map((info) => {
          const param = this.toolParams.find((p) => p.info === info)
          if (!param) {
            console.error(`Ошибка: параметр ${info} не найден`)
            return null
          }
          console.log(
            'Processed param:',
            param,
            'Type of info:',
            typeof param.info
          )
          return { id: param.id, info: param.info }
        })
        .filter((item) => item !== null)
    },

    ...mapGetters('tool', [
      'widthOptions',
      'shagOptions',
      'gabaritOptions',
      'nameOptions',
    ]),
    popupTitle() {
      return this.tool?.id != null
        ? `Редактировать инструмент ID: ${this.tool.id}`
        : 'Добавить инструмент'
    },
  },
  methods: {
    logModelValue(paramId) {
      console.log(
        `Текущее значение для paramId ${paramId}:`,
        this.toolModel.properties[paramId]
      )

      if (this.toolModel.properties[paramId] !== undefined) {
        console.log(
          `Значение для paramId ${paramId}:`,
          this.toolModel.properties[paramId]
        )
      } else {
        console.log(`Значение для paramId ${paramId} не определено`)
      }
    },
    ...mapActions('tool', ['fetchUniqueToolSpecs']),
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

    prependOptionIfNeeded(value, optionsList, propName) {
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
          if (result) this.$emit('changes-saved')
        } catch (error) {
          console.error('Ошибка при удалении инструмента:', error)
        }
      }
    },
    onCancel() {
      this.$emit('canceled')
    },
    async onSave() {
      this.$store.dispatch('tool/onSaveToolModel', this.toolModel)
      this.$emit('changes-saved')
    },
  },
}
</script>
