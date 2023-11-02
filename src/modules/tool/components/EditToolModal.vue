<template>
  <Modal :title='popupTitle'>
    <template #content>
      <v-container>
        <v-row>
          <v-col>
            <v-combobox label='Название (Тип)' v-model='toolModel.type_name' :items='typeOptions' required></v-combobox>
            <v-combobox label='Группа' v-model='toolModel.group_name' :items='groupOptions' required></v-combobox>
            <v-combobox label='Применяемость материала' v-model='toolModel.mat_name' :items='materialOptions' required></v-combobox>

            <v-text-field label='Маркировка' v-model='toolModel.name' required />
            <v-text-field label='Количесво на складе' v-model='toolModel.kolvo_sklad' required />
            <v-text-field label='Нормальный запас на неделю' v-model='toolModel.norma' required />
            <v-text-field label='Заказ' v-model='toolModel.zakaz' required />

            <v-select label='Радиус' v-model='toolModel.rad' :items='radiusOptions' required />
          </v-col>
        </v-row>
      </v-container>
    </template>
    <template #action>
      <v-btn color='red darken-1' variant='text' @click='onCancel' class='text-none text-subtitle-1 ml-3'>
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
import { fetchTools } from '@/api/api'  // Убедитесь, что импортировали функцию fetchTools

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
    radiusOptions: {
      type: Array,
    },
  },
  components: {
    Modal,
  },
  data: () => ({
    toolModel: null,
    typeOptions: [],
    groupOptions: [],
    materialOptions: [],
  }),
  watch: {
    tool: {
      immediate: true,
      handler(tool) {
        this.toolModel = JSON.parse(JSON.stringify(tool))
      },
    },
  },
  async created() {
    const rawData = await fetchTools();

    this.typeOptions = rawData.types.map(type => type.type_name);
    this.groupOptions = rawData.groups.map(group => group.group_name);
    this.materialOptions = rawData.materials.map(material => material.mat_name);
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

