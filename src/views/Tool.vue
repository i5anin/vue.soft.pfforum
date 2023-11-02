<template>
  <v-container>
    <v-col class='pa-3 text-right'>
      <v-btn color='blue' @click='onAddTool'>Новый инструмент</v-btn>
    </v-col>
    <edit-tool-modal
      v-if='openDialog'
      v-bind='{ tool: editingTool, persistent: true, radiusOptions: radiusOptions }'
      @canceled='onClosePopup'
      @changes-saved='onSaveChanges'
    />
    <!--  вынести в компонент??  -->
    <v-table hover>
      <thead>
      <tr>
        <!-- <th class="text-left">id</th>-->
        <th class='text-left'>Название(Тип)</th>
        <th class='text-left'>Группа</th>
        <th class='text-left'>Применяемость материала</th>
        <th class='text-left'>Радиус</th>
        <th class='text-left'>Маркировка</th>
        <th class='text-left'>Количесво на складе</th>
        <th class='text-left'>Нормальный запас на неделю</th>
        <th class='text-left'>Заказ</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for='tool in tools' :key='tool.id' @click='onEditRow(tool)'>
        <!-- td :style="{ color: 'grey' }">{{ tool.id }}</td>-->
        <td>{{ tool.type_name }}</td>  <!-- Название(Тип) -->
        <td>{{ tool.group_name }}</td> <!-- Группа -->
        <td>{{ tool.mat_name }}</td>   <!-- Применяемость материала -->
        <td>{{ tool.rad }}</td>        <!-- Радиус -->
        <td>{{ tool.name }}</td>       <!-- Маркировка -->
        <td>{{ tool.kolvo_sklad }}</td><!-- Количесво на складе -->
        <td>{{ tool.norma }}</td>      <!-- Нормальный запас на неделю -->
        <td>{{ tool.zakaz }}</td>      <!-- Заказ -->
      </tr>
      </tbody>
    </v-table>
  </v-container>
</template>

<script>
import EditToolModal from '@/modules/tool/components/EditToolModal.vue'
import { fetchTools, updateTool } from '@/api/api'

export default {
  components: { EditToolModal },
  data() {
    return {
      openDialog: false,
      tools: [],
      editingTool: null,
      radiusOptions: [0.2, 0.4, 0.6, 0.8, 1.0, 1.2],
    }
  },
  async created() {
    const rawData = await fetchTools()
    this.tools = this.processToolsData(rawData)
  },
  methods: {
    processToolsData(rawData) {
      return rawData.tools.map(tool => {
        const group = rawData.groups.find(group => group.id === tool.group_id)
        const material = rawData.materials.find(material => material.id === tool.mat_id)
        const type = rawData.types.find(type => type.id === tool.type_id)
        return {
          ...tool,
          group_name: group ? group.group_name : '',
          mat_name: material ? material.mat_name : '',
          type_name: type ? type.type_name : '',
        }
      })
    },
  },
  onClosePopup() {
    this.openDialog = false
  },
  async onSaveChanges(editedTool) {
    this.openDialog = false
    const updatedTool = await updateTool(editedTool.id, editedTool)
    if (updatedTool) {
      const index = this.tools.findIndex(tool => tool.id === updatedTool.id)
      if (index !== -1) {
        this.$set(this.tools, index, updatedTool)
      }
    }
  },
  onAddTool() {
    this.editingTool = {
      id: null,
      group_name: '',
      type_name: '',
      mat_name: '',
      name: '',
      kolvo_sklad: 0,
      norma: 0,
      zakaz: 0,
      rad: 0,
    }
    this.openDialog = true
  },
  onEditRow(tool) {
    this.editingTool = tool
    this.openDialog = true
  },
}
,
}
</script>
