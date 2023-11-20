<template>
  <Modal :title='popupTitle'>
    <template #content>
      <v-container>
        <v-row>
          <v-col cols='12' lg='6'>
            <!-- левый столбец -->
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

              <v-text-field label='Маркировка'
                            v-model='toolModel.name'
                            required
                            :rules=' [
                          v=> !!v || "Поле обязательно для заполнения",
              v => v && v.length >= 3 || "Минимальная длина: 3 символа",
              ]'
              />
            </div>
          </v-col>
          <!-- правый столбец -->
          <v-col cols='12' lg='6'>
            <div>
              <v-select label='Радиус'
                        v-model='toolModel.radius'
                        :items='radiusOptions'
                        required
                        :rules='[v => /^\d+$/.test(v) || "Введите корректное количество (только цифры)"]'
              />
              <v-text-field label='Диаметр'
                            v-model='toolModel.diam'
                            :items='radiusOptions'
                            required
                            :rules='[v => /^\d+$/.test(v) || "Введите корректное количество (только цифры)"]'
              />
              <v-text-field label='Шаг'
                            v-model='toolModel.shag'
                            :items='radiusOptions'
                            required
                            :rules='[v => /^\d+$/.test(v) || "Введите корректное количество (только цифры)"]'
              />
              <v-text-field label='Габариты'
                            v-model='toolModel.gabarit'
                            :items='radiusOptions'
                            required
                            :rules='[v => /^\d+$/.test(v) || "Введите корректное количество (только цифры)"]'
              />
              <v-text-field label='Вылет'
                            v-model='toolModel.width'
                            :items='radiusOptions'
                            required
                            :rules='[v => /^\d+$/.test(v) || "Введите корректное количество (только цифры)"]'
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
  <DeleteConfirmationDialog
    :confirmDeleteDialog='confirmDeleteDialog'
    :onDelete='onDelete'
    @update:confirmDeleteDialog='updateConfirmDeleteDialog'
  />
</template>

<script>
import Modal from '@/components/shared/Modal.vue'
import { addTool, deleteTool, updateTool, getLibraries, addMaterial, addType, addGroup } from '@/api'
import DeleteConfirmationDialog from '@/modules/tool/components/DeleteConfirmationDialog.vue'

export default {
  name: 'EditToolModal',
  props: {
    tool: {
      type: Object,
      default: () => ({
        id: null, group_name: '', type_name: '', mat_name: '', name: '', diam: '', shag: '',
        fields: [],
        typeOptions: ['Radius', 'Diameter', 'Step', 'Dimensions', 'Projection'],
      }),
    },
    radiusOptions: { type: Array },
  },
  components: { DeleteConfirmationDialog, Modal },
  data: () => ({
    toolModel: {}, typeOptions: [], groupOptions: [], materialOptions: [], confirmDeleteDialog: false,
  }),
  watch: {
    tool: {
      immediate: true,
      handler(tool) {
        const { mat, group, type } = tool
        this.toolModel = {
          ...tool,

          mat: mat?.name,
          group: group?.name,
          type: type?.name,

          radius: tool.spec?.radius,
          shag: tool.spec?.shag,
          gabarit: tool.spec?.gabarit,
          width: tool.spec?.width,
          diam: tool.spec?.diam,
        }
      },
    },
  },
  async created() {
    try {
      const rawData = await getLibraries()
      this.typeOptions = rawData.types.map(type => type.name)
      this.groupOptions = rawData.groups.map(group => group.name)
      this.materialOptions = rawData.materials.map(material => material.name)
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
    addField() {
      this.fields.push({ type: '', value: '' })
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

      if (this.toolModel.name.length < 3 || this.toolModel.group.length < 3 || this.toolModel.mat.length < 3) {
        console.error('Ошибка валидации: Минимальная длина для полей - 3 символа.')
        return
      }

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
        name,
        group_id: groupId,
        mat_id: matId,
        type_id: typeId,

        rad: Number(rad),
      }

      try {
        let result
        if (id == null) {
          result = await addTool(toolData)
          if (result) this.$emit('changes-saved')
        } else {
          result = await updateTool(id, toolData)
          if (result) this.$emit('changes-saved')
        }
      } catch (error) {
        console.error('Ошибка:', error.message)
      }
    },
  },
}
</script>


