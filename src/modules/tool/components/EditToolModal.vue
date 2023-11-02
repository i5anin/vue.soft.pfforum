<template>
  <Modal :title="popupTitle">
    <template #content>
      <v-container>
        <v-row>
          <v-col>
            <v-combobox label='Название (Тип)' v-model='toolModel.type_name' :items='typeOptions' required />
            <v-combobox label='Группа' v-model='toolModel.group_name' :items='groupOptions' required />
            <v-combobox label='Применяемость материала' v-model='toolModel.mat_name' :items='materialOptions' required />
            <v-text-field label='Маркировка' v-model='toolModel.name' required />
            <v-text-field label='Количество на складе' v-model='toolModel.kolvo_sklad' required />
            <v-text-field label='Нормальный запас на неделю' v-model='toolModel.norma' required />
            <v-text-field label='Заказ' v-model='toolModel.zakaz' required />
            <v-select label='Радиус' v-model='toolModel.rad' :items='radiusOptions' required />
          </v-col>
        </v-row>
      </v-container>
    </template>
    <template #action>
      <v-btn color='red darken-1' variant='text' @click='onCancel'>Закрыть</v-btn>
      <v-btn prepend-icon='mdi-check-circle' @click='onSave' color='blue darken-1' size='large' variant='flat'>Сохранить</v-btn>
    </template>
  </Modal>
</template>

<script>
import { addMaterial, addType, addGroup, addTool, updateTool } from '@/api/api';

export default {
  props: {
    toolModel: {
      type: Object,
      required: true,
    },
    popupTitle: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      typeOptions: [],
      groupOptions: [],
      materialOptions: [],
      radiusOptions: [0.2, 0.4, 0.6, 0.8, 1.0, 1.2],
    };
  },
  methods: {
    async onSave() {
      try {
        let group_id = this.toolModel.group_id;
        let mat_id = this.toolModel.mat_id;
        let type_id = this.toolModel.type_id;

        const newGroup = await addGroup(this.toolModel.group_name);
        if (newGroup) {
          group_id = newGroup.id;
        }

        const newMaterial = await addMaterial(this.toolModel.mat_name);
        if (newMaterial) {
          mat_id = newMaterial.id;
        }

        const newType = await addType(this.toolModel.type_name);
        if (newType) {
          type_id = newType.id;
        }

        const toolData = {
          ...this.toolModel,
          group_id,
          mat_id,
          type_id,
        };

        if (this.toolModel.id) {
          const updatedTool = await updateTool(this.toolModel.id, toolData);
          this.$emit('update-tool', updatedTool);
        } else {
          const newTool = await addTool(toolData);
          this.$emit('add-tool', newTool);
        }
        this.$emit('close-modal');
      } catch (error) {
        console.error('There has been a problem with your operation:', error);
      }
    },
    onCancel() {
      this.$emit('close-modal');
    },
  },
};
</script>

<style scoped>
/* Ваши стили */
</style>
