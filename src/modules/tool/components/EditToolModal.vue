<template>
  <!-- Определение шаблона компонента -->
  <Modal :title='popupTitle'>  <!-- Привязка заголовка модального окна к переменной popupTitle -->
    <template #content>  <!-- Слот для содержимого модального окна -->
      <v-container>  <!-- Контейнер для разметки содержимого -->
        <v-row>  <!-- Ряд для группировки элементов -->
          <v-col>  <!-- Колонка для размещения элементов -->
            <!-- Комбобоксы и текстовые поля для ввода данных -->
            <!-- Каждый элемент привязан к соответствующему свойству объекта toolModel и имеет свой лейбл -->
            <v-combobox label='Название (Тип)' v-model='toolModel.type_name' :items='typeOptions' required />
            <v-combobox label='Группа' v-model='toolModel.group_name' :items='groupOptions' required />
            <v-combobox label='Применяемость материала' v-model='toolModel.mat_name' :items='materialOptions'
                        required></v-combobox>

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
import { fetchTools } from '@/api/api'

// Экспорт компонента
export default {
  name: 'EditToolModal',  // Имя компонента
  props: {  // Входные свойства компонента
    tool: {
      type: Object,  // Тип свойства
      default: () => ({  // Значение по умолчанию
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
      type: Array,  // Тип свойства
    },
  },
  components: { Modal }, // Список компонентов, используемых в данном компоненте
  data: () => ({  // Локальное состояние компонента
    toolModel: null,  // Модель данных инструмента
    typeOptions: [],  // Опции для выбора типа
    groupOptions: [],  // Опции для выбора группы
    materialOptions: [],  // Опции для выбора материала
  }),
  watch: {  // Слежка за изменением свойств и данных
    tool: {
      immediate: true,  // Немедленное выполнение при инициализации
      handler(tool) {  // Обработчик изменения свойства
        this.toolModel = JSON.parse(JSON.stringify(tool))  // Клонирование объекта инструмента
      },
    },
  },
  async created() {  // Хук жизненного цикла, вызывается при создании компонента
    const rawData = await fetchTools()  // Получение данных с сервера
    console.log(rawData)
    // Обновление опций для выбора на основе полученных данных
    this.typeOptions = rawData.types.map(type => type.type_name)
    this.groupOptions = rawData.groups.map(group => group.group_name)
    this.materialOptions = rawData.materials.map(material => material.mat_name)
  },
  computed: {  // Вычисляемые свойства
    popupTitle() {  // Заголовок модального окна
      // В зависимости от наличия id у инструмента выбирается текст заголовка
      return this.tool?.id != null
        ? `Редактировать инструмент ID: ${this.tool.id}`
        : 'Добавить инструмент'
    },
  },
  methods: {  // Методы компонента
    onCancel() {  // Обработчик клика по кнопке "Закрыть"
      this.$emit('canceled')  // Генерация пользовательского события "canceled"
    },
    onSave() {  // Обработчик клика по кнопке "Сохранить"
      this.$emit('changes-saved', this.toolModel)  // Генерация пользовательского события "changes-saved" с передачей данных инструмента
    },
  },
}
</script>
