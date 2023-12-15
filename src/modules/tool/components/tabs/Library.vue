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
              <th class="text-left">ID</th>
              <th class="text-left">Информация</th>
              <th class="text-left">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="param in toolParams" :key="param.id">
              <td>{{ param.id }}</td>
              <td>{{ param.info }}</td>
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
import { getToolParams } from '@/api'

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
    saveParam() {
      if (this.paramInfo) {
        if (this.editingParam) {
          // Редактирование существующего параметра
          this.editingParam.info = this.paramInfo
        } else {
          // Добавление нового параметра
          const newParam = {
            id: this.toolParams.length + 1, // или любой другой уникальный ID
            info: this.paramInfo,
          }
          this.toolParams.push(newParam)
        }
        // Сброс формы после сохранения
        this.paramInfo = ''
        this.showDialog = false
      } else {
        alert('Пожалуйста, введите информацию для инструмента')
      }
    },
    deleteParam(param) {
      if (confirm(`Вы уверены, что хотите удалить параметр: ${param.info}?`)) {
        const index = this.toolParams.indexOf(param)
        if (index > -1) {
          this.toolParams.splice(index, 1)
        }
      }
    },
  },
  mounted() {
    this.getData()
  },
}
</script>
