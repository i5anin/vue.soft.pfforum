<template>
  <div>
    <div v-for="(group, index) in toolGroups" :key="index" class="tool-group">
      <v-chip color="green">
        <button class="grey" @click="toggleVisibility(index)">
          {{ group.path }}
        </button>
      </v-chip>
      <div v-if="visibleGroups.includes(index)" class="tools-list">
        <ul>
          <li v-for="(tool, toolIndex) in group.tools" :key="toolIndex">
            <span>
              {{ tool.name }} - Склад: {{ tool.sklad }}, Норма:
              {{ tool.norma }}, Заказ: {{ tool.zakaz }}, Повреждено за последние
              {{ tool.norma }}, Заказ: {{ tool.zakaz }}, Повреждено за последние
              7 дней: {{ tool.damaged_last_7_days }}
            </span>
          </li>
        </ul>
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
    async fetchZakazData() {
      try {
        this.toolGroups = await reportApi.getZakaz()
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
.path-button {
  background-color: #f0f0f0;
  border: none;
  padding: 10px;
  width: 100%;
  text-align: left;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
}

.tools-list {
  background-color: #fafafa;
  padding: 10px;
}

.tool-group + .tool-group {
  margin-top: 10px;
}
</style>
