<template>
  <Modal :title="popupTitle">
    <template #content>
      <v-container>
        <v-row>
          <v-col>
            <v-text-field
              label="Название"
              v-model="toolHistoryModel.name"
              required
            />
            <v-text-field
              label="Обозначение"
              v-model="toolHistoryModel.description"
              required
            />
            <v-text-field
              label="Номер операции"
              v-model="toolHistoryModel.no_oper"
              required
            />
            <v-text-field
              label="Тип операции"
              v-model="toolHistoryModel.type_oper"
              required
            />
            <v-text-field
              label="Кол-во"
              v-model="toolHistoryModel.quantity"
              type="number"
              required
            />
            <v-text-field
              label="ФИО"
              v-model="toolHistoryModel.user_fio"
              required
            />
            <v-text-field
              label="Дата"
              v-model="toolHistoryModel.date"
              type="date"
              required
            />
            <v-text-field
              label="Инструмент"
              v-model="toolHistoryModel.name_tool"
              required
            />
            <v-text-field
              label="Характеристики"
              v-model="toolHistoryModel.property"
              required
            />
          </v-col>
        </v-row>
      </v-container>
    </template>
    <template #action>
      <v-btn color="red darken-1" @click="onCancel">Закрыть</v-btn>
      <v-btn color="blue darken-1" @click="onSave">Сохранить</v-btn>
    </template>
  </Modal>
</template>

<script>
import Modal from '@/components/shared/Modal.vue'

export default {
  components: { Modal },
  data() {
    return {
      popupTitle: 'Редактирование истории инструмента',
      toolHistoryModel: {
        name: '',
        description: '',
        no_oper: '',
        type_oper: '',
        quantity: 0,
        user_fio: '',
        date: '',
        name_tool: '',
        property: '',
      },
    }
  },
  methods: {
    onCancel() {
      this.$emit('close')
    },
    onSave() {
      // Здесь код для сохранения данных
      console.log(
        'Сохраняем данные истории инструмента:',
        this.toolHistoryModel
      )
      this.$emit('save', this.toolHistoryModel)
    },
  },
}
</script>
