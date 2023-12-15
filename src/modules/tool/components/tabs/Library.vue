<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="flex">
          <h2 class="text-h5">Параметры Инструмента</h2>
          <v-spacer />
          <v-btn color="primary" class="mb-2" @click="showAddDialog = true">
            Добавить параметр
          </v-btn>
        </div>
        <v-dialog v-model="showAddDialog" persistent max-width="600px">
          <v-card>
            <v-card-title>Новый Инструмент</v-card-title>
            <v-card-text>
              <v-text-field
                label="Информация"
                v-model="newParamInfo"
                required
              ></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                lable="Отмена"
                color="blue darken-1"
                @click="showAddDialog = false"
              />
              <v-btn lable="Добавить" color="blue darken-1" @click="addParam" />
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
            <tr v-for="(param, index) in toolParams" :key="param.id">
              <td>{{ param.id }}</td>
              <td>{{ param.info }}</td>
              <td>
                <v-btn icon @click="renameParam(param)">
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
      showAddDialog: false,
      newParamInfo: '',
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
    renameParam(param) {
      // Логика для переименования параметра
      console.log(`Переименовать параметр: ${param.id}`)
    },
    deleteParam(param) {
      if (confirm(`Вы уверены, что хотите удалить параметр: ${param.info}?`)) {
        // Логика для удаления параметра
        console.log(`Удалить параметр: ${param.id}`)
      }
    },
    addParam() {
      if (this.newParamInfo) {
        // Добавьте здесь логику для добавления нового инструмента
        console.log(`Добавить новый инструмент: ${this.newParamInfo}`)
        // Сброс формы после добавления
        this.newParamInfo = ''
        this.showAddDialog = false
      } else {
        alert('Пожалуйста, введите информацию для нового инструмента')
      }
    },
  },
  mounted() {
    this.getData()
  },
}
</script>
