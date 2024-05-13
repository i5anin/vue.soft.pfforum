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
      <v-chip variant="text" size="large" @click="toggleVisibility(index)">
        <template #prepend>
          <v-icon icon="mdi-box-cutter" start />
        </template>
        {{ group[0].name }}
        <v-chip
          v-if="group[0].group_id"
          size="x-small"
          :color="getColorForGroup(group[0].group_id)"
          :title="'Группа ' + group[0].group_id"
        >
          <!--          <span v-if="group[0].group_standard" style="color: yellow">★</span>-->
          G{{ group[0].group_id }}
        </v-chip>
      </v-chip>
      <div v-if="visibleGroups.includes(index)">
        <v-table hover dense>
          <thead>
            <tr>
              <th class="text-left mw50">#</th>
              <th class="text-left mw300">Инструмент</th>
              <th class="text-left mw300">Расположение</th>
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
</style>
