<template>
  <v-dialog :value='value' @input="$emit('input', $event)" width='600'>
    <v-card>
      <v-card-title>
        Добавить инструмент
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col>
              <v-text-field label='Название (Тип)' v-model='typeName' required />
              <v-text-field label='Группа' v-model='groupName' required />
              <v-text-field label='Применяемость материала' v-model='materialUsage' required />
              <v-text-field label='Маркировка' v-model='marking' required />
              <v-text-field label='Количесво на складе' v-model='stockQuantity' required />
              <v-text-field label='Нормальный запас на неделю' v-model='weeklySupply' required />
              <v-text-field label='Заказ' v-model='order' required />
              <v-select :items='radiusOptions' label='Радиус' v-model='radius' required />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color='red darken-1'
          variant='text'
          @click='closeDialog'
          class='text-none text-subtitle-1 ml-3'>
          Закрыть
        </v-btn>
        <v-btn
          prepend-icon='mdi-check-circle'
          @click='save'
          class='text-none text-subtitle-1 pl-3'
          color='blue darken-1'
          size='large'
          variant='flat'>
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    tool: {
      type: Object,
      default: () => ({}),
    },
    groupOptions: {
      type: Array,
      default: () => ([]), // [{id, name}]
    },
    value: {
      type: Boolean,
      default: false,
    },
    radiusOptions: { // добавьте это
      type: Array,
      default: () => [0.2, 0.4, 0.6, 0.8, 1.0, 1.2],
    },
  },
  data() {
    return {
      typeName: '',
      groupName: '',
      materialUsage: '',
      marking: '',
      stockQuantity: '',
      weeklySupply: '',
      order: '',
      radius: 0.2,  // значение по умолчанию
    }
  },
  watch: {
    tool: {
      handler() {
        const { group_name, type_name, mat_name, name, kolvo_sklad, norma, zakaz, rad } = this.tool
        this.typeName = type_name
        this.groupName = group_name
        this.materialUsage = mat_name
        this.marking = name
        this.stockQuantity = kolvo_sklad
        this.weeklySupply = norma
        this.order = zakaz
        this.radius = rad
      },
    },
  },
  methods: {
    closeDialog() {
      this.$emit('update:value', false)
    },
    save() {
      console.log('save method called in Modal component')
      this.$emit('save', {
        typeName: this.typeName,
        groupName: this.groupName,
        materialUsage: this.materialUsage,
        marking: this.marking,
        stockQuantity: this.stockQuantity,
        weeklySupply: this.weeklySupply,
        order: this.order,
        radius: this.radius,
      })
    },
  },
}
</script>

<style scoped></style>

