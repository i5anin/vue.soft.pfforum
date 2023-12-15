<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="flex">
          <h2 class="text-h5">Параметры Инструмента</h2>
          <v-spacer />
          <v-btn color="primary" class="mb-2" @click="startAdding">
            Добавить параметр
          </v-btn>
        </div>
        <v-dialog v-model="showDialog" persistent max-width="600px">
          <v-card>
            <v-card-title>{{ dialogTitle }}</v-card-title>
            <v-card-text>
              <v-text-field
                label="Информация"
                v-model="paramInfo"
                required
              ></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="showDialog = false"
                >Отмена</v-btn
              >
              <v-btn color="blue darken-1" text @click="saveParam"
                >Сохранить</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-table>
          <thead>
            <tr>
              <th class="text-left">№</th>
              <th class="text-left">Информация</th>
              <!--<th class="text-left">ID</th>-->
              <th class="text-left">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(param, index) in toolParams" :key="param.id">
              <td>{{ index + 1 }}</td>
              <td>{{ param.info }}</td>
              <!--<td>{{ param.id }}</td>-->
              <td>
                <v-btn icon @click="startEditing(param)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon @click="deleteParam(param)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {
  getToolParams,
  updateToolParam,
  addToolParam,
  deleteToolParam,
} from '@/api'
import { normSpaces } from '@/modules/tool/components/normSpaces'

export default {
  data() {
    return {
      toolParams: [],
      showDialog: false,
      dialogTitle: '',
      paramInfo: '',
      editingParam: null,
    }
  },
  methods: {
    async getData() {
      try {
        this.toolParams = await getToolParams()
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    },
    startAdding() {
      this.dialogTitle = 'Новый Инструмент'
      this.paramInfo = ''
      this.editingParam = null
      this.showDialog = true
    },
    startEditing(param) {
      this.dialogTitle = 'Редактировать Инструмент'
      this.paramInfo = param.info
      this.editingParam = param
      this.showDialog = true
    },
    async saveParam() {
      if (this.paramInfo) {
        // Обработка ввода и нормализация данных
        const normalizedParamInfo = normSpaces(this.paramInfo)

        // Проверка на дублирование параметров
        if (
          this.toolParams.some(
            (param) =>
              param.info.toLowerCase() === normalizedParamInfo.toLowerCase() &&
              param.id !== this.editingParam?.id
          )
        ) {
          alert('Такой параметр уже существует')
          return
        }

        try {
          if (this.editingParam) {
            // Обновление существующего параметра
            const updatedParam = { info: normalizedParamInfo }
            const result = await updateToolParam(
              this.editingParam.id,
              updatedParam
            )

            if (result) {
              // Обновление данных в массиве toolParams
              this.toolParams = this.toolParams.map((param) =>
                param.id === this.editingParam.id
                  ? { ...param, info: normalizedParamInfo }
                  : param
              )
            }
          } else {
            // Добавление нового параметра
            const newParam = await addToolParam({ info: normalizedParamInfo })
            if (newParam && newParam.id) {
              this.toolParams.push(newParam)
            } else {
              throw new Error('Failed to retrieve new param data')
            }
          }
        } catch (error) {
          console.error('Error saving tool parameter:', error)
        }

        // Сброс данных формы
        this.paramInfo = ''
        this.showDialog = false
        this.editingParam = null
      } else {
        alert('Пожалуйста, введите информацию для инструмента')
      }
    },
    async deleteParam(param) {
      const confirmDelete = confirm(
        `Вы уверены, что хотите удалить параметр: ${param.info}?`
      )
      if (confirmDelete) {
        try {
          await deleteToolParam(param.id)
          const index = this.toolParams.indexOf(param)
          if (index > -1) {
            this.toolParams.splice(index, 1)
          }
        } catch (error) {
          console.error('Error deleting tool parameter:', error)
        }
      }
    },
  },
  mounted() {
    this.getData()
  },
}
</script>
