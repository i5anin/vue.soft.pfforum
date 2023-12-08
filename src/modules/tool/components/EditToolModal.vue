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
            <h2 class="text-h6">Размеры:</h2>
            <div v-if="toolParams" v-for="(param, id) in toolParams" :key="id">
              <v-combobox
                density="compact"
                :label="param.info"
                v-model="toolModel[param.params]"
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
import DeleteConfirmationDialog from '@/modules/tool/components/DeleteConfirmationDialog.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'EditToolModal',
  emits: ['canceled', 'changes-saved'], // объявления пользовательских событий
  //props контракт общение что использовать и что передавать от родительского компонента к дочернему
  props: {
    persistent: { type: Boolean, default: false },
    tool: {
      type: Object,
      //устанавливает начальные значения для tool
      default: () => ({
        id: null,
        group_name: '',
        type_name: '',
        mat_name: '',
        typeOptions: ['Radius', 'Diam', 'Step', 'Dimensions', 'Projection'],
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
    toolModel: {
      type: '',
      group: '',
      mat: '',
      name: '',
    },
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
        const { mat, group, type } = tool
        this.toolModel = {
          ...tool,
          mat: mat?.name === null ? null : mat?.name,
          group: group?.name === null ? null : group?.name,
          type: type?.name === null ? null : type?.name,
        }
      },
    },
  },
  //data - используется для определения реактивных данных компонента, которые непосредственно управляют состоянием и поведением этого компонента.
  //watch - используется для отслеживания изменений в этих данных (или в других реактивных источниках) и выполнения дополнительных действий или логики в ответ на эти изменения.
  async mounted() {
    this.loadLastSavedData()
    const rawData = await getLibraries()
    this.typeOptions = rawData.types.map((type) => type.name)
    this.groupOptions = rawData.groups.map((group) => group.name)
    this.materialOptions = rawData.materials.map((material) => material.name)

    this.toolParams = await getToolParams()
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
      this.prependOptionIfNeeded(data.type, this.typeOptions, 'type')
      this.prependOptionIfNeeded(data.group, this.groupOptions, 'group')
      this.prependOptionIfNeeded(data.mat, this.materialOptions, 'mat')
      this.prependOptionIfNeeded(data.name, this.nameOptions, 'name')
    },

    prependOptionIfNeeded(value, optionsList, propName) {
      if (value && !optionsList.some((option) => option.value === value)) {
        optionsList.unshift(value)
      }
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
