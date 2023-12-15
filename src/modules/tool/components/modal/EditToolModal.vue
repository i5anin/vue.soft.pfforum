<template>
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
            <!--            <v-combobox-->
            <!--            :chips="true"-->
            <!--            multiple-->
            <!--            v-model="selectedParams"-->
            <!--            :items="toolParams"-->
            <!--            label="Параметры"-->
            <!--            return-object-->
            <!--          />-->
            <h2 class="text-h6">Размеры:</h2>
            <!-- Вывод всех комбобоксов с параметрами -->
            <div v-for="param in toolParams" :key="param.id">
              <v-combobox
                density="compact"
                :label="param.info"
                v-model="toolModel.properties[param.id]"
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
  emits: ['canceled', 'changes-saved'],
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
  data: () => ({
    selectedParams: [],
    toolParams: [],
    toolModel: { name: '', properties: {} },
    typeRules: [
      (v) => !!v || 'Поле обязательно для заполнения',
      (v) => (v && v.length >= 3) || 'Минимальная длина: 3 символа',
    ],
  }),
  watch: {
    tool: {
      immediate: true,
      handler() {
        this.toolModel = { name: '', properties: {} }
      },
    },
  },
  async mounted() {
    const rawToolParams = await getToolParams()
    this.toolParams = rawToolParams.map((param) => {
      // Убедитесь, что каждый param имеет уникальный id
      return {
        id: param.id,
        info: param.info,
      }
    })

    this.toolParams.forEach((param) => {
      this.toolModel.properties[param.id] = null
    })
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
      console.log('Отправляемые данные:', this.toolModel)
      this.$store.dispatch('tool/onSaveToolModel', this.toolModel)
      this.$emit('changes-saved')
    },
  },
}
</script>
