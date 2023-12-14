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
              :items="toolParams"
              label="Параметры"
              return-object
            />
            <h2 class="text-h6">Размеры:</h2>
            <!-- динамические параметры -->
            <div v-for="param in selectedParams" :key="param.id">
              <v-combobox
                density="compact"
                :label="param.info"
                v-model="toolModel.properties[param.id]"
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
import { deleteTool, getToolParams } from '@/api'
import DeleteConfirmationDialog from '@/modules/tool/components/modal/DeleteConfirmationDialog.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'EditToolModal',
  emits: ['canceled', 'changes-saved'], // объявления пользовательских событий
  props: {
    persistent: { type: Boolean, default: false },
    tool: {
      type: Object,
      default: () => ({ id: null }),
    },
  },
  components: { DeleteConfirmationDialog, Modal },
  //реактивные данные
  data: () => ({
    selectedParams: [],
    toolParams: [],
    toolModel: { name: '', properties: {} },
    confirmDeleteDialog: false,
    typeSelected: false,
    selectedType: '',
    typeRules: [
      (v) => !!v || 'Поле обязательно для заполнения',
      (v) => (v && v.length >= 3) || 'Минимальная длина: 3 символа',
    ],
  }),

  watch: { tool: { immediate: true } },
  async mounted() {
    try {
      const rawToolParams = await getToolParams()
      this.toolParams = rawToolParams
      rawToolParams.forEach((param) => {
        this.toolModel.properties[param.id] = '' // Инициализация
      })
    } catch (error) {
      console.error('Ошибка при загрузке toolParams:', error)
    }
    this.loadLastSavedData()
    const rawToolParams = await getToolParams()
    rawToolParams.forEach((param) => {
      this.toolModel.properties[param.id] = '' // Используйте id параметра в качестве ключа
    })

    // Сохраняем идентификаторы и описания параметров
    this.toolParams = rawToolParams.map((param) => param.info)
    this.toolParamsId = rawToolParams.map((param) => param.id)
    console.log(rawToolParams)
  },
  computed: {
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
      console.log(this.toolModel)

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
