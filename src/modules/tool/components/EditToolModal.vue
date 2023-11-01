<template>
  <Modal :title='popupTitle'>
    <template #content>
      <v-container>
        <v-row>
          <v-col>
            <v-text-field
              label='Название (Тип)'
              v-model='toolModel.type_name'
              required
            />
            <v-text-field
              label='Группа'
              v-model='toolModel.group_name'
              required
            ></v-text-field>
            <v-text-field
              label='Применяемость материала'
              v-model='toolModel.mat_name'
              required
            ></v-text-field>
            <v-text-field
              label='Маркировка'
              v-model='toolModel.name'
              required
            ></v-text-field>
            <v-text-field
              label='Количесво на складе'
              v-model='toolModel.kolvo_sklad'
              required
            ></v-text-field>
            <v-text-field label='Нормальный запас на неделю' v-model='toolModel.norma' required />
            <v-text-field label='Заказ' v-model='toolModel.zakaz' required />
            <v-select :items='radiusOptions' label='Радиус' v-model='toolModel.rad' required />
          </v-col>
        </v-row>
      </v-container>
    </template>
    <template #action>
      <v-btn
        color='red darken-1'
        variant='text'
        @click='onCancel'
        class='text-none text-subtitle-1 ml-3'
      >
        Закрыть
      </v-btn>
      <v-btn
        prepend-icon='mdi-check-circle'
        @click='onSave'
        class='text-none text-subtitle-1 pl-3'
        color='blue darken-1'
        size='large'
        variant='flat'
      >
        Сохранить
      </v-btn>
    </template>
  </Modal>
</template>

<script>
import Modal from '@/components/shared/Modal.vue'

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
        kolvo_sklad: 0,
        norma: 0,
        zakaz: 0,
        rad: 0,
      }),
    },
    radiusOptions: {  // добавьте это
      type: Array,
    },
  },
  components: {
    Modal,
  },
  data: () => ({
    toolModel: null,
  }),
  watch: {
    tool: {
      immediate: true,
      handler(tool) {
        this.toolModel = JSON.parse(JSON.stringify(tool))
      },
    },
  },
  computed: {
    popupTitle() {
      return this.tool?.id != null
        ? `Редактировать инструмент ID: ${this.tool.id}`
        : 'Добавить инструмент'
    },
  },
  methods: {
    onCancel() {
      this.$emit('canceled')
    },
    onSave() {
      this.$emit('changes-saved', this.toolModel)
    },
  },
}
</script>

<style scoped></style>
