<template>
  <!--  <form @submit.prevent='onSubmit'>-->
  <Modal :title="popupTitle">
    <template #content>
      <v-container>
        <v-row>
          <v-col class="flex">
            <!-- левый столбец -->
            <div>
              <p class="my-2">Название: {{ toolModel.type }}</p>
              <p class="my-2">Группа: {{ toolModel.group }}</p>
              <p class="my-2">Применяемость материала: {{ toolModel.mat }}</p>
              <p class="my-2">Маркировка: {{ toolModel.name }}</p>
            </div>

            <h2 class="my-3">Склад:</h2>

            <div>
              <v-text-field
                label="Склад"
                v-model="toolModel.kolvo_sklad"
                required
              />
              <v-text-field label="Норма" v-model="toolModel.norma" required />
              <p class="my-2">Заказ: {{ calculatedZakaz }}</p>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </template>
    <template #action>
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
        @click="onAddToWarehouse"
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
    @update:confirmDeleteDialog="updateConfirmDeleteDialog"
  />
</template>

<script>
import Modal from '@/components/shared/Modal.vue'
import {
  addTool,
  deleteTool,
  updateTool,
  getLibraries,
  addMaterial,
  addType,
  addGroup,
  getUniqueToolSpecs,
  addToWarehouse,
} from '@/api'
import DeleteConfirmationDialog from '@/modules/tool/components/modal/DeleteConfirmationDialog.vue'

export default {
  name: 'EditToolSkladModal',
  emits: ['canceled', 'changes-saved'],
  props: {
    tool: {
      type: Object,
      default: () => ({
        id: null,
        group_name: '',
        type_name: '',
        mat_name: '',
        name: '',
        diam: '', // Переименовано из diam
        shag: '',
        typeOptions: ['Radius', 'Diam', 'Step', 'Dimensions', 'Projection'],
      }),
    },
    radiusOptions: { type: Array },
  },
  components: { DeleteConfirmationDialog, Modal },
  data: () => ({
    shagOptions: [],
    gabaritOptions: [],
    widthOptions: [],
    toolModel: {
      shag: '',
      gabarit: '',
      width: '',
      group: '',
      type: '',
      mat: '',
      name: '',
    },
    typeOptions: [],
    groupOptions: [],
    materialOptions: [],
    nameOptions: [],
    confirmDeleteDialog: false,
    typeSelected: false,
  }),

  watch: {
    tool: {
      immediate: true,

      handler(tool) {
        const { mat, group, type } = tool
        this.toolModel = {
          ...this.toolModel,
          id: tool.id,
          mat: mat?.name,
          group: group?.name,
          type: type?.name,
          name: tool.name,
          kolvo_sklad: tool.kolvo_sklad || '',
          norma: tool.norma || '',
          zakaz: tool.zakaz || '',
        }
        // console.log('Загрузка модели Tool Model:', this.toolModel) // Добавленный console.log
      },
    },
  },
  async mounted() {
    try {
      const uniqueSpecs = await getUniqueToolSpecs()
      this.shagOptions = uniqueSpecs.shags
      this.gabaritOptions = uniqueSpecs.gabarits
      this.widthOptions = uniqueSpecs.widths
      this.nameOptions = uniqueSpecs.names // Заполняем опции маркировки
    } catch (error) {
      console.error('Ошибка при получении уникальных спецификаций:', error)
    }

    try {
      const rawData = await getLibraries()
      this.typeOptions = rawData.types.map((type) => type.name)
      this.groupOptions = rawData.groups.map((group) => group.name)
      this.materialOptions = rawData.materials.map((material) => material.name)
    } catch (error) {
      console.error('Ошибка при получении данных:', error)
    }
  },
  computed: {
    calculatedZakaz() {
      // Убедитесь, что значения kolvo_sklad и norma являются числами
      const kolvoSklad = parseFloat(this.toolModel.kolvo_sklad) || 0
      const norma = parseFloat(this.toolModel.norma) || 0

      // Рассчитайте значение заказа
      return norma - kolvoSklad
    },
    popupTitle() {
      return this.tool?.id != null
        ? `Редактировать склад инструмента ID: ${this.tool.id}`
        : 'Добавить инструмент'
    },
  },

  methods: {
    async onAddToWarehouse() {
      const { id, norma, kolvo_sklad } = this.toolModel
      try {
        let zakaz = norma - kolvo_sklad
        const result = await addToWarehouse(id, kolvo_sklad, norma, zakaz)
        // console.log('Результат:', result)
        if (result) this.$emit('changes-saved')
      } catch (error) {
        console.error('Ошибка при добавлении на склад:', error.message)
      }
    },

    updateConfirmDeleteDialog() {},
    parseToFloat(value) {
      if (value === null) {
        return 0 // Или другое значение по умолчанию
      }
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
      const { id, group, type, mat, name } = this.toolModel

      const rawData = await getLibraries()
      const groups = rawData.groups
      const materials = rawData.materials
      const types = rawData.types

      let groupId = groups.find((g) => g.name === group)?.id
      let matId = materials.find((m) => m.name === mat)?.id
      let typeId = types.find((t) => t.name === type)?.id

      if (!groupId) {
        const newGroup = await addGroup(group)
        groupId = newGroup.id
      }
      if (!matId) {
        const newMaterial = await addMaterial(mat)
        matId = newMaterial.id
      }
      if (!typeId) {
        const newType = await addType(type)
        typeId = newType.id
      }

      const toolData = {
        id,
        name: this.toolModel.name,
        group_id: parseInt(groupId),
        mat_id: parseInt(matId),
        type_id: parseInt(typeId),

        norma: this.toolModel.norma,
        zakaz: this.toolModel.zakaz,
        kolvo_sklad: this.toolModel.kolvo_sklad,
      }
      // console.log(toolData)

      try {
        let result
        if (id == null) {
          result = await addTool(toolData)
          // console.log('Tool added. ID:', result.toolId)
          if (result) this.$emit('changes-saved')
        } else {
          result = await updateTool(id, toolData)
          if (result) this.$emit('changes-saved')
        }
      } catch (error) {
        console.error('Ошибка при добавлении инструмента:', error.message)
      }
    },
  },
}
</script>
