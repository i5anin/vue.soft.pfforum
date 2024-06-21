<template>
  <zakaz-tool-modal
    v-if="openDialog"
    :persistent="true"
    :tool-id="editingToolId"
    @canceled="onClosePopup"
  />
  <div>
    <div class="d-flex justify-end">
      <v-btn variant="text" @click="toggleAllVisibility">
        {{ isAllVisible ? 'Свернуть все' : 'Развернуть все' }}
        ({{ totalToolCount }})
      </v-btn>
    </div>
    <div v-for="(group, index) in toolGroups" :key="index" class="tool-group">
      <v-chip variant="text" size="large" @click="toggleVisibility(index)">
        <template #prepend>
          <v-icon v-if="!checkTools(group)" icon="mdi-folder" start />
          <v-icon
            v-if="checkTools(group)"
            icon="mdi-folder-alert"
            start
            color="orange"
            title="Есть позиции менее 50%"
          />
        </template>
        {{ group.path }}
      </v-chip>
      <v-chip color="while">{{ group.tools.length }}</v-chip>
      <div v-if="visibleGroups.includes(index)">
        <v-table hover dense>
          <thead>
            <tr>
              <th class="text-left mw50">#</th>
              <th class="text-left mw300">Название</th>
              <th class="text-left mw50">Заказ</th>
              <th class="text-left mw50">Склад</th>
              <!-- <th class="text-left mw50">Склад группы</th>-->
              <th class="text-left mw50">Норма</th>
              <th class="text-left mw50">Не хватает</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(tool, toolIndex) in group.tools"
              :key="toolIndex"
              @click="openToolModal(tool.id_tool)"
            >
              <td class="grey">{{ toolIndex + 1 }}</td>
              <td
                :style="{
                  color:
                    (1 - tool.sklad / tool.norma) * 100 >= 50 ? 'orange' : '',
                }"
              >
                {{ tool.name }}
                <v-chip
                  v-if="tool.group_id"
                  size="x-small"
                  :color="getColorForGroup(tool.group_id)"
                  :title="'Группа ' + tool.group_id"
                >
                  <span v-if="tool.group_standard" style="color: yellow"
                    >★</span
                  >
                  G{{ tool.group_id }}
                </v-chip>
              </td>
              <td>
                {{
                  group.path.includes('Пластины') && tool.zakaz !== 0
                    ? getRoundedCount(tool.zakaz)
                    : tool.zakaz
                }}
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
              <!--              <td class="grey">{{ tool.group_sum }}</td>-->
              <td class="grey">{{ tool.norma }}</td>
              <td
                class="grey"
                :style="{
                  color:
                    ((1 - tool.sklad / tool.norma) * 100).toFixed(0) >= 50
                      ? 'orange'
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
import ZakazToolModal from '@/modules/view/components/Modal.vue'

export default {
  components: { ZakazToolModal },
  data() {
    return {
      toolGroups: [],
      visibleGroups: [],
      colors: ['red', 'green', 'blue', 'orange', 'purple', 'cyan'],
      editingToolId: null,
      openDialog: false,
      isAllVisible: false, // Состояние - все списки развернуты или нет
      totalToolCount: 0, // Общее количество инструментов
    }
  },
  mounted() {
    this.fetchZakazData()
  },
  computed: {
    totalToolCount() {
      let count = 0
      this.toolGroups.forEach((group) => {
        count += group.tools.length
      })
      return count
    },
  },
  methods: {
    onClosePopup() {
      this.openDialog = false
    },
    openToolModal(toolId) {
      this.editingToolId = toolId
      this.openDialog = true
    },
    getColorForGroup(index) {
      const hue = index * 137.508 // используем золотое сечение
      return `hsl(${hue % 360}, 50%, 50%)`
    },
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
    toggleAllVisibility() {
      this.isAllVisible = !this.isAllVisible
      if (this.isAllVisible) {
        this.visibleGroups = [...Array(this.toolGroups.length).keys()]
      } else {
        this.visibleGroups = []
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

.mw50 {
  min-width: 50px;
}

.mw300 {
  min-width: 300px;
}

.red {
  color: #f44336;
}
</style>
