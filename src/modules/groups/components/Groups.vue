<template>
  <!--  {{ this.toolGroups }}-->
  <zakaz-tool-modal
    v-if="openDialog"
    :persistent="true"
    :tool-id="editingToolId"
    @canceled="onClosePopup"
  />
  <div>
    <div v-for="(group, index) in toolGroups" :key="index" class="tool-group">
      <v-chip
        v-if="group[0].group_id"
        :color="getColorForGroup(group[0].group_id)"
        :title="'Группа ' + group[0].group_id"
      >
        G{{ group[0].group_id }}
      </v-chip>
      <v-chip variant="text" size="large" @click="toggleVisibility(index)">
        {{ group[0].name }}
        <span class="grey pl-4 pr-2"> Склад группы: </span>
        {{ totalForEachGroup.totalsForEachGroup[group[0].group_id] }}

        <span class="grey pl-4 pr-2">Норма:</span>
        {{ group[0].norma }}
      </v-chip>
      <div v-if="visibleGroups.includes(index)">
        <v-table hover dense>
          <thead>
            <tr>
              <th class="text-left mw50">#</th>
              <th class="text-left mw300">Инструмент</th>
              <th class="text-left mw300">Расположение</th>
              <th class="text-left mw300">Склад</th>
              <th class="text-left mw300">Норма</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tool, toolIndex) in group" :key="toolIndex">
              <td class="grey">{{ toolIndex + 1 }}</td>
              <td>
                {{ tool.name }}
                <span v-if="tool.group_standard" style="color: yellow">★</span>
              </td>
              <td>{{ tool.path }}</td>
              <td>{{ tool.sklad }}</td>
              <td>{{ tool.norma }}</td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </div>
  </div>
</template>

<script>
import { toolGroupsApi } from '../api/groups' // Импортируем API
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
    }
  },
  mounted() {
    this.fetchZakazData()
  },
  computed: {
    totalForEachGroup() {
      let totalSum = 0
      const totals = Object.keys(this.toolGroups).reduce((acc, groupId) => {
        // Используем Object.values чтобы получить массив инструментов каждой группы
        const groupTotal = this.toolGroups[groupId].reduce(
          (sum, tool) => sum + tool.sklad,
          0
        )
        // Складываем общую сумму по всем группам
        totalSum += groupTotal
        // Записываем сумму для каждой группы
        acc[groupId] = groupTotal
        return acc
      }, {})

      // Возвращаем объект с суммами по каждой группе и общей суммой
      return { totalsForEachGroup: totals, totalSum }
    },
  },
  methods: {
    onClosePopup() {
      this.openDialog = false
    },
    getColorForGroup(index) {
      const hue = index * 137.508 // используем золотое сечение
      return `hsl(${hue % 360}, 50%, 50%)`
    },
    async fetchZakazData() {
      try {
        this.toolGroups = await toolGroupsApi.getToolGroups()
      } catch (error) {
        console.error('Ошибка при получении данных: ', error)
      }
    },
    toggleVisibility(groupId) {
      const visibleIndex = this.visibleGroups.indexOf(groupId)
      if (visibleIndex === -1) {
        this.visibleGroups.push(groupId)
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

.mw50 {
  min-width: 50px;
}

.mw300 {
  min-width: 300px;
}

.red {
  color: #f44336;
}

.grey {
  color: grey;
}
</style>
