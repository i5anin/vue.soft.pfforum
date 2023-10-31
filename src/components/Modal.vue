<template>
  <v-dialog :value='value' @input="$emit('input', $event)" width='1024'>
    <v-card>
      <v-card-title>
        Добавить инструмент
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col sm='6' md='4'>
              <v-text-field label='Название (Тип)' v-model='typeName' required/>
              <v-text-field label='Группа' v-model='groupName' required></v-text-field>
              <v-text-field label='Применяемость материала' v-model='materialUsage' required></v-text-field>
              <v-text-field label='Маркировка' v-model='marking' required></v-text-field>
              <v-text-field label='Количесво на складе' v-model='stockQuantity' required></v-text-field>
              <v-text-field label='Нормальный запас на неделю' v-model='weeklySupply' required></v-text-field>
              <v-text-field label='Заказ' v-model='order' required></v-text-field>
              <v-select
                :items="radiusOptions"
                label="Радиус"
                v-model="radius"
                required
              ></v-select>
              <!-- Остальные поля -->
            </v-col>
            <!-- Добавьте дополнительные поля по аналогии -->
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn color='blue-darken-1' text @click='closeDialog'>
          Закрыть
        </v-btn>
        <v-btn prepend-icon="mdi-check-circle"
               text
               @click='save'
               class="text-none text-subtitle-1"
               color="#5865f2"
               size="small"
               variant="flat">
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false,
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
      radiusOptions: [0.2, 0.4, 0.6, 0.8, 1.0, 1.2],
      radius: 0.2,  // значение по умолчанию
    }
  },
  methods: {
    closeDialog() {
      this.$emit('update:openDialog', false);
    },
    save() {
      console.log('save method called in Modal component');
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
