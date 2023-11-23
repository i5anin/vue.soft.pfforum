<template>
  <!--  <form @submit.prevent='onSubmit'>-->
  <Modal :title='popupTitle'>
    <template #content>
      <v-container>
        <v-row>
          <v-col class='flex'>
            <!--            левый столбец -->
            <div>
              <v-combobox label='Название (Тип)'
                          v-model='toolModel.type'
                          :items='typeOptions'
                          item-text='text'
                          item-value='value'
                          required
                          :counter='3'
                          :rules='[
                          v => !!v || "Поле обязательно для заполнения",
                          v => v && v.length >= 3 || "Минимальная длина: 3 символа",
                        ]'
              />
              <v-combobox label='Группа'
                          v-model='toolModel.group'
                          :items='groupOptions'
                          item-text='text'
                          item-value='value'
                          required
                          :rules='[
                          v => !!v || "Поле обязательно для заполнения",
                          v => v && v.length >= 3 || "Минимальная длина: 3 символа",
                        ]'
              />
              <v-combobox label='Применяемость материала'
                          v-model='toolModel.mat'
                          :items='materialOptions'
                          item-text='text'
                          item-value='value'
                          required
                          :rules='[
                          v => !!v || "Поле обязательно для заполнения",
                          v => v && v.length >= 3 || "Минимальная длина: 3 символа",
                        ]'
              />

              <v-combobox label='Маркировка'
                          v-model='toolModel.name'
                          :items='nameOptions'
                          required
                          :rules=' [
              v => !!v || "Поле обязательно для заполнения",
              v => v && v.length >= 3 || "Минимальная длина: 3 символа",
            ]'
              />
            </div>
            <h2 class='text-h6'>Размеры:</h2>
            <!--            правый столбец -->
            <div>
              <v-row>
                <v-col cols='4'>
                  <!-- Left side: Select element -->
                  <v-select
                    v-model='selectedType'
                    :items="['Радиус', 'Диаметр']"
                    label='Выберите тип'
                    @input='onTypeChange'

                  />
                  <!-- :disabled='toolModel.radius || toolModel.diameter'-->
                </v-col>

                <v-col cols='8'>
                  <v-text-field
                    v-if="selectedType === 'Радиус'"
                    label='Радиус (Пластины)'
                    v-model='toolModel.radius'
                    required
                  />
                  <v-text-field
                    v-else-if="selectedType === 'Диаметр'"
                    label='Диаметр (Сверла)'
                    v-model='toolModel.diam'
                    required

                  />
                </v-col>
              </v-row>

              <v-combobox label='Шаг'
                          v-model='toolModel.shag'
                          :items='shagOptions'
                          required
              />
              <v-combobox label='Габариты'
                          v-model='toolModel.gabarit'
                          :items='gabaritOptions'
                          required
              />
              <v-combobox label='Вылет (Резцы)'
                          v-model='toolModel.width'
                          :items='widthOptions'
                          required
              />
            </div>
          </v-col>
        </v-row>
      </v-container>
    </template>
    <template #action>
      <v-btn color='red darken-1' variant='text' @click='confirmDelete' class='text-none text-subtitle-1 ml-3'>
        Удалить
      </v-btn>
      <v-spacer />
      <v-btn
        color='red darken-1'
        variant='text'
        @click='onCancel'
        class='text-none text-subtitle-1 ml-3'>
        Закрыть
      </v-btn>
      <v-btn prepend-icon='mdi-check-circle'
             @click='onSave'
             class='text-none text-subtitle-1 pl-3'
             color='blue darken-1'
             size='large'
             variant='flat'>
        Сохранить
      </v-btn>
    </template>
  </Modal>
  <!--  </form>-->
  <DeleteConfirmationDialog
    :confirmDeleteDialog='confirmDeleteDialog'
    :onDelete='onDelete'
    @update:confirmDeleteDialog='updateConfirmDeleteDialog'
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
} from '@/api'
import DeleteConfirmationDialog from '@/modules/tool/components/DeleteConfirmationDialog.vue'

export default {
  name: 'EditToolModal',
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
      type: '',
      group: '',
      mat: '',
      name: '',
      radius: '',
      diam: '',
    },
    typeOptions: [],
    groupOptions: [],
    materialOptions: [],
    nameOptions: [],
    confirmDeleteDialog: false,
    typeSelected: false,
    selectedType: '',
  }),

  watch: {
    tool: {
      immediate: true,
      handler(tool) {
        const { mat, group, type } = tool
        this.toolModel = {
          ...tool,

          mat: mat?.name === '[нет данных]' ? null : mat?.name,
          group: group?.name === '[нет данных]' ? null : group?.name,
          type: type?.name === '[нет данных]' ? null : type?.name,

          radius: tool.spec?.radius,
          shag: tool.spec?.shag,
          gabarit: tool.spec?.gabarit,
          width: tool.spec?.width,
          diam: tool.spec?.diam, // Переименовано из diam
        }
        console.log('Загрузка модели Tool Model:', this.toolModel) // Добавленный console.log
      },
    },
  },
  async mounted() {

    try {
      const uniqueSpecs = await getUniqueToolSpecs();
      this.shagOptions = uniqueSpecs.shags;
      this.gabaritOptions = uniqueSpecs.gabarits;
      this.widthOptions = uniqueSpecs.widths;
      this.nameOptions = uniqueSpecs.names; // Заполняем опции маркировки
    } catch (error) {
      console.error('Ошибка при получении уникальных спецификаций:', error);
    }

    try {
      const rawData = await getLibraries()
      this.typeOptions = rawData.types.map(type => type.name)
      this.groupOptions = rawData.groups.map(group => group.name)
      this.materialOptions = rawData.materials.map(material => material.name)


      if (this.toolModel.diam) {
        this.selectedType = 'Диаметр'
      } else if (this.toolModel.radius) {
        this.selectedType = 'Радиус'
      } else {
        this.selectedType = '' // Очищаем выбранный тип, если оба поля пусты
      }



    } catch (error) {
      console.error('Ошибка при получении данных:', error)
    }
  },
  computed: {
    popupTitle() {
      return this.tool?.id != null
        ? `Редактировать инструмент ID: ${this.tool.id}`
        : 'Добавить инструмент'
    },
  },
  methods: {
    parseToFloat(value) {
      if (value === null) {
        return 0 // Или другое значение по умолчанию
      }
      return parseFloat(value.toString().replace(',', '.'))
    },

    checkDisabledStatus() {
      console.log('Radius:', this.toolModel.radius)
      console.log('Diameter:', this.toolModel.diam)
      return this.toolModel.radius || this.toolModel.diam
    },
    onTypeChange() {
      if (this.selectedType === 'Радиус' && !this.toolModel.radius) {
        this.selectedType = '' // Очищаем выбранный тип, если радиус пуст
      } else if (this.selectedType === 'Диаметр' && !this.toolModel.diam) {
        this.toolModel.diam = this.toolModel.radius // Сохраняем значение радиуса как диаметр, если диаметр пуст
      }
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
      const {
        id, group, type, mat, name,
      } = this.toolModel

      const rawData = await getLibraries()
      const groups = rawData.groups
      const materials = rawData.materials
      const types = rawData.types

      let groupId = groups.find(g => g.name === group)?.id
      let matId = materials.find(m => m.name === mat)?.id
      let typeId = types.find(t => t.name === type)?.id

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

        radius: this.toolModel.radius,
        shag: this.toolModel.shag,
        gabarit: this.toolModel.gabarit,
        width: this.toolModel.width,
        diam: this.toolModel.diam,
      }
      console.log(toolData)

      try {
        let result
        if (id == null) {
          result = await addTool(toolData)
          console.log('Tool added. ID:', result.toolId)
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



