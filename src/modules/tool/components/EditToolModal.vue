<template>
  <div>
    <!-- Определение шаблона компонента -->
    <Modal :title='popupTitle'>  <!-- Привязка заголовка модального окна к переменной popupTitle -->
      <template #content>  <!-- Слот для содержимого модального окна -->
        <v-container>  <!-- Контейнер для разметки содержимого -->
          <v-row>  <!-- Ряд для группировки элементов -->
            <v-col>  <!-- Колонка для размещения элементов -->
              <!-- Комбобоксы и текстовые поля для ввода данных -->
              <!-- Каждый элемент привязан к соответствующему свойству объекта toolModel и имеет свой лейбл -->
              <v-combobox label='Название (Тип)' v-model='toolModel.type' :items='typeOptions' item-text='text'
                          item-value='value' required />
              <v-combobox label='Группа' v-model='toolModel.group' :items='groupOptions' item-text='text'
                          item-value='value' required />
              <v-combobox label='Применяемость материала' v-model='toolModel.mat' :items='materialOptions'
                          item-text='text' item-value='value' required />

              <v-text-field label='Маркировка' v-model='toolModel.name' required />
              <v-text-field label='Количество на складе' v-model='toolModel.kolvo_sklad' required />
              <v-text-field label='Нормальный запас на неделю' v-model='toolModel.norma' required />
              <v-text-field label='Заказ' v-model='toolModel.zakaz' required />

              <v-select label='Радиус' v-model='toolModel.rad' :items='radiusOptions' required />
            </v-col>
          </v-row>
        </v-container>
      </template>
      <template #action>  <!-- Слот для действий модального окна -->
        <!-- Кнопки для закрытия модального окна и сохранения данных -->
        <v-btn color='red darken-1' variant='text' @click='confirmDelete' class='text-none text-subtitle-1 ml-3'>
          Удалить
        </v-btn>
        <v-spacer />
        <v-btn color='red darken-1' variant='text' @click='onCancel' class='text-none text-subtitle-1 ml-3'>
          Закрыть
        </v-btn>
        <v-btn prepend-icon='mdi-check-circle' @click='onSave' class='text-none text-subtitle-1 pl-3'
               color='blue darken-1' size='large' variant='flat'>
          Сохранить
        </v-btn>
      </template>
    </Modal>

    <!-- Диалоговое окно для подтверждения удаления -->
    <v-dialog v-model="confirmDeleteDialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">Удалить инструмент?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="confirmDeleteDialog = false">Отмена</v-btn>
          <v-btn color="blue darken-1" text @click="onDelete">Удалить</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Modal from '@/components/shared/Modal.vue'
import { addTool, deleteTool, updateTool, getLibraries, addMaterial, addType, addGroup } from '@/api/api'

export default {
  name: 'EditToolModal',
  props: {
    tool: {
      type: Object,
      default: () => ({
        id: null, group_name: '', type_name: '', mat_name: '', name: '', kolvo_sklad: 0, norma: 0, zakaz: 0, rad: 0,
      }),
    },
    radiusOptions: { type: Array },
  },
  components: { Modal },
  data: () => ({
    toolModel: null,
    typeOptions: [],
    groupOptions: [],
    materialOptions: [],
    confirmDeleteDialog: false,
  }),
  watch: {
    tool: {
      immediate: true,
      handler(tool) {
        const { mat, group, type } = tool
        this.toolModel = JSON.parse(JSON.stringify({ ...tool, mat: mat?.name, group: group?.name, type: type?.name }))
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
    confirmDelete() {
      this.confirmDeleteDialog = true;
    },
    async onDelete() {
      this.confirmDeleteDialog = false;
      if (this.toolModel.id != null) {
        try {
          const { result } = await deleteTool(this.toolModel.id)
          if (result) {
            this.$emit('changes-saved')
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
      const { id, group, type, mat, name, kolvo_sklad, norma, zakaz, rad } = this.toolModel;

      const rawData = await getLibraries();
      const groups = rawData.groups;
      const materials = rawData.materials;
      const types = rawData.types;

      let groupId = groups.find(g => g.name === group)?.id;
      let matId = materials.find(m => m.name === mat)?.id;
      let typeId = types.find(t => t.name === type)?.id;

      if (!groupId) {
        const newGroup = await addGroup(group);
        groupId = newGroup.id;
      }
      if (!matId) {
        const newMaterial = await addMaterial(mat);
        matId = newMaterial.id;
      }
      if (!typeId) {
        const newType = await addType(type);
        typeId = newType.id;
      }

      const toolData = {
        id,
        name,
        group_id: groupId,
        mat_id: matId,
        type_id: typeId,
        kolvo_sklad: Number(kolvo_sklad),
        norma: Number(norma),
        zakaz: Number(zakaz),
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
