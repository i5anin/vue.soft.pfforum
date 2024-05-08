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
        icon="mdi-alert-circle-outline"
        title="Есть позиции мение 50%"
      />
      <div v-if="visibleGroups.includes(index)">
        <v-table dense>
          <thead>
            <tr>
              <th class="text-left" style="min-width: 50px">#</th>
              <th class="text-left" style="min-width: 300px">Название</th>
              <th class="text-left" style="min-width: 50px">Заказ</th>
              <th class="text-left" style="min-width: 50px">Склад</th>
              <th class="text-left" style="min-width: 50px">Норма</th>
              <th class="text-left" style="min-width: 50px">Не хватает</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tool, toolIndex) in group.tools" :key="toolIndex">
              <td class="grey">{{ toolIndex + 1 }}</td>
              <td
                :style="{
                  'text-decoration':
                    ((1 - tool.sklad / tool.norma) * 100).toFixed(2) >= 50
                      ? 'underline'
                      : 'none',
                  'text-decoration-color':
                    ((1 - tool.sklad / tool.norma) * 100).toFixed(2) >= 50
                      ? 'red'
                      : '',
                }"
              >
                {{ tool.name }}
              </td>
              <td>
                {{
                  group.path.includes('Пластины') && tool.zakaz !== 0
                    ? getRoundedCount(tool.zakaz)
                    : tool.zakaz
                }}
                <!-- Only display this when 'tool.zakaz' is not zero, and there is a difference between the rounded and original values -->
                <template
                  v-if="
                    group.path.includes('Пластины') &&
                    tool.zakaz !== 0 &&
                    tool.zakaz !== getRoundedCount(tool.zakaz)
                  "
                >
                  ({{ getRoundedCount(tool.norma) - tool.sklad }})
                </template>
              </td>
              <td class="grey">{{ tool.sklad }}</td>
              <td class="grey">{{ tool.norma }}</td>
              <td
                class="grey"
                :style="{
                  color:
                    ((1 - tool.sklad / tool.norma) * 100).toFixed(0) >= 50
                      ? 'red'
                      : 'grey',
                }"
              >
                {{ ((1 - tool.sklad / tool.norma) * 100).toFixed(0) }} %
              </td>
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
    getRoundedCount(count) {
      if (count < 10) return 10
      return count % 10 < 5
        ? Math.floor(count / 10) * 10
        : Math.ceil(count / 10) * 10
    },
    checkTools(group) {
      let check = false

      group.tools.forEach((tool) => {
        let percentage = (1 - tool.sklad / tool.norma) * 100
        if (percentage >= 50) check = true
      })

      return check
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
