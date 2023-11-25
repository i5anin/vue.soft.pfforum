<template>
  <!--  <form @submit.prevent='onSubmit'>-->
  <Modal :title="popupTitle">
    <template #content>
      <v-container>
        <v-row>
          <v-col class="flex">
            <!--            левый столбец -->
            <div>
              <v-combobox
                label="Название (Тип)"
                v-model="toolModel.type"
                :items="typeOptions"
                item-text="text"
                item-value="value"
                required
                :counter="3"
                :rules="typeRules"
              />
              <v-combobox
                label="Группа"
                v-model="toolModel.group"
                :items="groupOptions"
                item-text="text"
                item-value="value"
                required
                :rules="typeRules"
              />
              <v-combobox
                label="Применяемость материала"
                v-model="toolModel.mat"
                :items="materialOptions"
                item-text="text"
                item-value="value"
                required
                :rules="typeRules"
              />

              <v-combobox
                label="Маркировка"
                v-model="toolModel.name"
                :items="nameOptions"
                required
                :rules="typeRules"
              />
            </div>
            <h2 class="text-h6">Размеры:</h2>
            <!-- правый столбец -->
            <div>
              <v-row>
                <v-col cols="4" />
                <v-col cols="8">
                  <v-text-field
                    label="Радиус (Пластины)"
                    v-model="toolModel.radius"
                    required
                  />
                  <v-text-field
                    label="Диаметр (Сверла)"
                    v-model="toolModel.diam"
                    required
                  />
                </v-col>
              </v-row>

              <v-combobox
                label="Шаг"
                v-model="toolModel.shag"
                :items="shagOptions"
                required
              />
              <v-combobox
                label="Габариты"
                v-model="toolModel.gabarit"
                :items="gabaritOptions"
                required
              />
              <v-combobox
                label="Вылет (Резцы)"
                v-model="toolModel.width"
                :items="widthOptions"
                required
              />
            </div>
          </v-col>
        </v-row>
      </v-container>
    </template>
    <template #action>
      <v-btn
        color="red darken-1"
        variant="text"
        @click="confirmDelete"
        class="text-none text-subtitle-1 ml-3"
      >
        Удалить
      </v-btn>
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
        @click="onSave"
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
  />
</template>

<script>
import Modal from '@/components/shared/Modal.vue'
import DeleteConfirmationDialog from '@/modules/tool/components/DeleteConfirmationDialog.vue'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'EditToolModal',
  components: { DeleteConfirmationDialog, Modal },
  props: {
    persistent: {
      type: Boolean,
      default: false,
    },
    tool: {
      type: Object,
      default: () => ({
        id: null,
        group_name: '',
        type_name: '',
        mat_name: '',
        name: '',
        diam: '',
        shag: '',
        typeOptions: ['Radius', 'Diam', 'Step', 'Dimensions', 'Projection'],
      }),
    },
    radiusOptions: { type: Array },
  },
  data: () => ({
    toolModel: {
      type: '',
      group: '',
      mat: '',
      name: '',
      radius: '',
      diam: '',
      shag: '',
      gabarit: '',
      width: '',
    },
    typeOptions: [],
    groupOptions: [],
    materialOptions: [],
    nameOptions: [],
    confirmDeleteDialog: false,
    typeSelected: false,
    selectedType: '',
    typeRules: [
      (v) => !!v || 'Поле обязательно для заполнения',
      (v) => (v && v.length >= 3) || 'Минимальная длина: 3 символа',
    ],
  }),
  computed: {
    ...mapState({
      shagOptions: (state) => state.tool.shagOptions,
      gabaritOptions: (state) => state.tool.gabaritOptions,
      widthOptions: (state) => state.tool.widthOptions,
    }),
    popupTitle() {
      return this.tool?.id != null
        ? `Редактировать инструмент ID: ${this.tool.id}`
        : 'Добавить инструмент'
    },
  },
  methods: {
    ...mapActions('tool', [
      'fetchShagOptions',
      'fetchGabaritOptions',
      'fetchWidthOptions',
    ]),
    loadLastSavedData() {
      const lastSavedData = localStorage.getItem('lastSavedToolModel')
      if (lastSavedData) {
        const lastSavedToolModel = JSON.parse(lastSavedData)
        this.prependLastSavedData(lastSavedToolModel)
      }
    },
    prependLastSavedData(data) {
      this.prependOptionIfNeeded(data.type, this.typeOptions, 'type')
      this.prependOptionIfNeeded(data.group, this.groupOptions, 'group')
      this.prependOptionIfNeeded(data.mat, this.materialOptions, 'mat')
      this.prependOptionIfNeeded(data.name, this.nameOptions, 'name')
    },
    prependOptionIfNeeded(value, optionsList, propName) {
      if (value && !optionsList.some((option) => option.value === value)) {
        const newOption = { text: `🔴 ${value}`, value: value }
        optionsList.unshift(newOption)
      }
    },
    parseToFloat(value) {
      if (value === null) {
        return 0
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
      const { groups, materials, types } = await getLibraries()
      let groupId = groups.find((g) => g.name === group)?.id
      let matId = materials.find((m) => m.name === mat)?.id
      let typeId = types.find((t) => t.name === type)?.id

      if (!groupId) groupId = (await addGroup(group)).id
      if (!matId) matId = (await addMaterial(mat)).id
      if (!typeId) typeId = (await addType(type)).id

      const toolData = {
        id,
        name,
        group_id: parseInt(groupId),
        mat_id: parseInt(matId),
        type_id: parseInt(typeId),
        radius: this.toolModel.radius,
        shag: this.toolModel.shag,
        gabarit: this.toolModel.gabarit,
        width: this.toolModel.width,
        diam: this.toolModel.diam,
      }

      try {
        let result
        if (id == null) {
          result = await addTool(toolData)
        } else {
          result = await updateTool(id, toolData)
        }

        if (result) {
          this.$emit('changes-saved')
          localStorage.setItem(
            'lastSavedToolModel',
            JSON.stringify(this.toolModel)
          )
        }
      } catch (error) {
        console.error(
          'Ошибка при добавлении/обновлении инструмента:',
          error.message
        )
      }
    },
  },
  async mounted() {
    await this.fetchShagOptions()
    await this.fetchGabaritOptions()
    await this.fetchWidthOptions()
    // Другие действия при монтировании
  },
}
</script>
