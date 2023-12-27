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

            <v-combobox
              :chips="true"
              multiple
              v-model="selectedParams"
              :items="toolParamOptions"
              label="Параметры"
              return-object
            />

            <h2 class="text-h6">Характеристики:</h2>
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
          </v-col>
        </v-row>
      </v-container>
    </template>

    <template #action>
      <v-btn color="red darken-1" variant="text" @click="confirmDelete">
        Удалить
      </v-btn>
      <v-spacer />
      <v-btn color="red darken-1" variant="text" @click="onCancel">
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

  <DeleteConfirmationDialog
    :confirmDeleteDialog="confirmDeleteDialog"
    :onDelete="onDelete"
  />
</template>

<script>
import Modal from '@/components/shared/Modal.vue'
import { addTool, deleteTool, getToolParams, updateTool } from '@/api'
import DeleteConfirmationDialog from '@/modules/tool/components/modal/DeleteConfirmationDialog.vue'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  name: 'EditToolModal',
  emits: ['canceled', 'changes-saved'],
  props: {
    persistent: { type: Boolean, default: false },
    toolId: { type: Number, default: null },
    radiusOptions: { type: Array },
  },
  components: { DeleteConfirmationDialog, Modal },
  data() {
    return {
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
    }
  },
  watch: {
    toolId(newVal) {
      if (newVal) {
        this.fetchToolById(newVal)
      } else {
        this.initializeState()
      }
    },
  },
  mounted() {
    this.initializeState()
  },
  methods: {
    ...mapMutations('tool', ['setTool']),
    ...mapActions('tool', [
      'fetchUniqueToolSpecs',
      'fetchToolsByFilter',
      'onSaveToolModel',
      'fetchToolById',
    ]),
    initializeState() {
      this.localParentId = null
      this.toolModel = { name: null, property: {} }
      this.selectedParams = []
      this.toolParamOptions = []
      // Дополнительная инициализация по необходимости
      this.fetchToolParams()
    },
    fetchToolParams() {
      // Логика получения параметров инструмента
      getToolParams().then((params) => {
        this.toolParamOptions = params.map((param) => param.info)
      })
    },
    confirmDelete() {
      this.confirmDeleteDialog = true
    },
    onCancel() {
      this.$emit('canceled')
    },
    onSave() {
      // Логика сохранения
    },
    onDelete() {
      // Логика удаления
    },
  },
  computed: {
    ...mapGetters('tool', [
      'widthOptions',
      'shagOptions',
      'gabaritOptions',
      'nameOptions',
      'tool',
    ]),
    ...mapState('tool', ['idParent']),
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
}
</script>
