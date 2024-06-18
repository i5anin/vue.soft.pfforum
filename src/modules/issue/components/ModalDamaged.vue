<template>
  <!--  <form @submit.prevent='onSubmit'>-->
  <Modal :title="popupTitle">
    <template #content>
      <v-container>
        <v-row>
          <v-col>
            <div>
              <v-chip size="large" class="mb-3" color="red">
                {{ toolTitle }}
              </v-chip
              >
            </div>
            <v-combobox
              v-model="selectedCnc"
              :items="cncList"
              label="Выберите станок"
              item-title="cnc_name"
              item-value="cnc_code"
              required
              single-line="false"
            />
            <v-text-field
              v-model="damagedQuantity"
              label="Количество"
              type="number"
              min="1"
              required
            />
            <v-combobox
              v-model="selectedFio"
              :items="fioOptions"
              item-title="text"
              item-value="value"
              label="ФИО кто повредил"
              return-object="false"
              single-line="false"
            />
            <!-- @update:model-value="handleSelectionChange"-->
            <v-textarea
              v-model="comment"
              class="comment-field"
              label="Комментарий"
              rows="3"
              required
            />
          </v-col>
        </v-row>
      </v-container>
    </template>
    <template #action>
      <v-btn
        color="red darken-1"
        variant="text"
        class="text-none text-subtitle-1 ml-3"
        @click="onCancel"
      >
        Закрыть
      </v-btn>
      <v-spacer />
      <v-btn
        prepend-icon="mdi-check-circle"
        class="text-none text-subtitle-1 pl-3"
        color="blue darken-1"
        size="large"
        variant="flat"
        @click="onSave"
      >
        Сохранить
      </v-btn>
    </template>
  </Modal>
</template>

<script>
import Modal from '@/modules/shared/components/Modal.vue'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { issueToolApi } from '@/modules/issue/api/issue'

export default {
  name: 'IssueModal',
  components: { Modal },
  props: {
    toolId: { type: Number, default: null },
    toolTitle: { type: String, default: '' },
  },
  emits: ['canceled', 'changes-saved'],
  data: () => ({
    damagedQuantity: 1,
    comment: null,
    selectedCnc: null,
    cncList: [],
    originalData: [],
    idMapping: {},
    isModalOpen: true,
    selectedFio: null,
    fioOptions: [],
    selectedData: { name: null, description: null, no: null, type: null },
    localParentId: null,
    selectedParams: [],
    toolParams: [],
    confirmDeleteDialog: false,
    typeSelected: false,
    selectedType: '',
    operationMapping: {},
    parentIdRules: [
      (v) => !!v || 'ID папки обязательно',
      (v) => v > 1 || 'ID папки должен быть больше 1',
      (v) => v !== '' || 'ID папки не должен быть пустым',
    ],
    typeRules: [
      (v) => !!v || 'Поле обязательно для заполнения',
      (v) => (v && v.length >= 3) || 'Минимальная длина: 3 символа',
    ],

    options: {
      idNameDescription: [],
      numberType: [],
    },
  }),
  computed: {
    ...mapGetters('IssueToolStore', ['nameOptions']),
    ...mapState('IssueToolStore', ['parentCatalog']),
    currentFolderName() {
      return this.toolId === null ? this.idParent.label : this.tool.folder_name
    },

    popupTitle() {
      return this.toolId != null
        ? `Инструмент поврежден ID: ${this.toolId}`
        : 'Ошибка нет ID'
    },
  },
  watch: {
    tool: {
      deep: true,
      immediate: true,
      async handler(editingToolId) {
        if (editingToolId == null) {
          this.resetToolModel()
        } else {
          await this.fetchToolById(editingToolId)
          this.updateToolModel()
        }
      },
    },
  },

  async created() {
    try {
      const fioData = await issueToolApi.getDetailFio()
      this.fioOptions = this.prepareFioOptions(fioData)
    } catch (error) {
      console.error('Ошибка при загрузке данных ФИО:', error)
    }
    try {
      const cncData = await issueToolApi.fetchCncList()
      this.cncList = cncData ? [...cncData] : []
      if (cncData && Array.isArray(cncData)) {
        this.cncList = cncData
      } else {
        console.error('Ошибка при получении списка станков:', cncData)
      }
      console.log(this.toolId)
      // Если toolId не задан, устанавливаем начальные данные для инструмента
      if (this.toolId == null) {
        this.setTool({
          id: null,
          name: null,
          property: {},
        })
      } else {
        // Если toolId задан, запрашиваем данные об инструменте
        await this.fetchToolById(this.toolId)
        if (this.tool.property === null) this.tool.property = {}
      }
    } catch (error) {
      console.error('Ошибка в created:', error)
    }
  },

  methods: {
    ...mapMutations('IssueToolStore', ['setTool']),
    ...mapActions('IssueToolStore', ['fetchToolsByFilter', 'fetchToolById']),

    prepareFioOptions(fioData) {
      return fioData.map((item) => ({
        text: item.fio,
        value: item.id,
      }))
    },
    onCancel() {
      this.$emit('canceled')
    },
    async onSave() {
      try {
        const damagedToolData = {
          id_tool: this.toolId,
          id_user: this.selectedFio.value,
          cnc_code: this.selectedCnc.cnc_code,
          comment: this.comment,
          quantity: this.damagedQuantity,
        }

        // Отправка данных о поврежденном инструменте
        const response =
          await issueToolApi.addToolHistoryDamaged(damagedToolData)
        if (response.success === 'OK') {
          this.$emit('changes-saved')
        } else {
          console.error(
            'Ошибка при сохранении данных о поврежденном инструменте: ',
            response
          )
        }
      } catch (error) {
        console.error(
          'Ошибка при отправке данных о поврежденном инструменте: ',
          error
        )
      }
    },
  },
}
</script>
