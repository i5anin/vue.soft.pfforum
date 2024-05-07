<template>
  <div>
    <div v-for="(group, index) in toolGroups" :key="index" class="tool-group">
      <v-chip variant="text" size="large" @click="toggleVisibility(index)">
        <template v-slot:prepend>
          <v-icon icon="mdi-folder" start />
        </template>
        {{ group.path }}
      </v-chip>
      <v-chip color="while">{{ group.tools.length }}</v-chip>
      <v-icon
        v-if="checkTools(group)"
        color="red"
        icon=" mdi-alert"
        title="Есть позиции мение 20%"
      />
      <div v-if="visibleGroups.includes(index)">
        <v-table dense>
          <thead>
            <tr>
              <th class="text-left">#</th>
              <th class="text-left">Название</th>
              <th class="text-left">Заказ</th>
              <th class="text-left">Склад</th>
              <th class="text-left">Норма</th>
              <th class="text-left">Процент не хватает</th>
              <!-- <th class="text-left">Повреждено за 7 дней</th>-->
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tool, toolIndex) in group.tools" :key="toolIndex">
              <td class="grey">{{ toolIndex + 1 }}</td>
              <td
                :style="{
                  'text-decoration':
                    ((1 - tool.sklad / tool.norma) * 100).toFixed(2) < 20
                      ? 'underline'
                      : 'none',
                  'text-decoration-color':
                    ((1 - tool.sklad / tool.norma) * 100).toFixed(2) < 20
                      ? 'red'
                      : '',
                }"
              >
                {{ tool.name }}
              </td>
              <td>{{ tool.zakaz }}</td>
              <td class="grey">{{ tool.sklad }}</td>
              <td class="grey">{{ tool.norma }}</td>
              <td class="grey">
                {{ ((1 - tool.sklad / tool.norma) * 100).toFixed(2) }} %
              </td>
              <!--              <td class="grey">{{ tool.damaged_last_7_days }}</td>-->
            </tr>
          </tbody>
        </v-table>
      </div>
    </div>
  </div>
</template>

<script>
import { reportApi } from '../api/report' // Импортируем API

export default {
  data() {
    return {
      toolGroups: [],
      visibleGroups: [],
    }
  },
  mounted() {
    this.fetchZakazData()
  },
  methods: {
    checkTools(group) {
      let totalSklad = 0
      let totalNorma = 0

      group.tools.forEach((tool) => {
        totalSklad += tool.sklad
        totalNorma += tool.norma
      })
      console.log(((1 - totalSklad / totalNorma) * 100).toFixed(2))
      return ((1 - totalSklad / totalNorma) * 100).toFixed(2) <= 20
    },
    async fetchZakazData() {
      try {
        this.toolGroups = await reportApi.getZakaz() // Убедитесь, что это правильный путь к данным в вашем API
      } catch (error) {
        console.error('Ошибка при получении данных: ', error)
        // Здесь можно добавить обработку ошибок, например, отображение сообщения пользователю
      }
    },
    toggleVisibility(index) {
      const visibleIndex = this.visibleGroups.indexOf(index)
      if (visibleIndex === -1) {
        this.visibleGroups.push(index)
      } else {
        this.visibleGroups.splice(visibleIndex, 1)
      }
    },
  },
}
</script>

<style>
.grey {
  color: grey;
}

.tool-group + .tool-group {
  margin-top: 10px;
}

.red-text {
  color: red;
}
</style>
