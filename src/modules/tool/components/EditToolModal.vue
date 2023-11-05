<template>
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
      <v-btn color='red darken-1' variant='text' @click='onDelete' class='text-none text-subtitle-1 ml-3'>
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
</template>

<script>
// Импорт других компонентов и функций
import Modal from '@/components/shared/Modal.vue'
import { addTool, deleteTool, updateTool, getLibraries } from '@/api/api'  // Изменили имя импортированной функции

// Экспорт компонента
export default {
  name: 'EditToolModal',  // Имя компонента
  props: {  // Входные свойства компонента
    tool: {
      type: Object,  // Тип свойства
      default: () => ({  // Значение по умолчанию
        id: null, group_name: '', type_name: '', mat_name: '', name: '', kolvo_sklad: 0, norma: 0, zakaz: 0, rad: 0,
      }),
    },
    radiusOptions: { type: Array },// Тип свойства
  },
  components: { Modal }, // Список компонентов, используемых в данном компоненте
  data: () => ({  // Локальное состояние компонента
    toolModel: null,  // Модель данных инструмента
    typeOptions: [],  // Опции для выбора типа [{value: id, label: 'name'}]
    groupOptions: [],  // Опции для выбора группы
    materialOptions: [],  // Опции для выбора материала
  }),
  watch: {  // Слежка за изменением свойств и данных
    tool: {
      immediate: true,  // Немедленное выполнение при инициализации
      handler(tool) {  // Обработчик изменения свойства
        const { mat, group, type } = tool
        this.toolModel = JSON.parse(JSON.stringify({ ...tool, mat: mat?.name, group: group?.name, type: type?.name }))  // Клонирование объекта инструмента
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
  computed: {  // Вычисляемые свойства
    popupTitle() {  // Заголовок модального окна
      // В зависимости от наличия id у инструмента выбирается текст заголовка
      return this.tool?.id != null
        ? `Редактировать инструмент ID: ${this.tool.id}`
        : 'Добавить инструмент'
    },
  },
  methods: {
    async onDelete() {
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
      this.$emit('canceled')  // Генерация пользовательского события "canceled"
    },
    async onSave() {
      const { id, group, type, mat, name, kolvo_sklad, norma, zakaz, rad } = this.toolModel;

      // Получаем списки
      const rawData = await getLibraries();
      const groups = rawData.groups;
      const materials = rawData.materials;
      const types = rawData.types;

      // Находим ID для каждого текстового значения
      const groupId = groups.find(g => g.name === group).id;
      const matId = materials.find(m => m.name === mat).id;
      const typeId = types.find(t => t.name === type).id;

      // Составляем объект данных инструмента
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
        // console.log(id)
        if (id == null) {

          // Если id не задан, это новый инструмент, и мы вызываем API для добавления
          result = await addTool(toolData)
          if (result) this.$emit('changes-saved')  // Генерация пользовательского события с новым инструментом

        } else {
          // Если id задан, это существующий инструмент, и мы вызываем API для обновления
          result = await updateTool(id, toolData)
          // if (result) this.$emit('changes-saved', result)  // Генерация пользовательского события с обновленным инструментом
          if (result) this.$emit('changes-saved')  // Генерация пользовательского события с новым или обновленным инструментом
        }
      } catch (error) {
        console.error('Ошибка:', error.message)  // Вывод сообщения об ошибке в консоль
      }
    },
  },

}
</script>
