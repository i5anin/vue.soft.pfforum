<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-table>
          <thead>
            <tr>
              <th class="text-left">Название</th>
              <th class="text-left">Информация</th>
              <th class="text-left">Ближайшая дата</th>
              <th class="text-left">На почту</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(report, index) in reports" :key="index">
              <td>{{ report.name }}</td>
              <td>{{ report.info }}</td>
              <td></td>
              <td>
                <v-btn color="primary" @click="report.action(report)">
                  Email
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
  </v-container>
  <ReportZakaz />
</template>
<script>
import { reportApi } from '../api/report'
import ReportZakaz from './ReportZakazTable.vue'

export default {
  components: { ReportZakaz },
  data() {
    return {
      reports: [
        {
          name: 'Отчет заявка на инструмент',
          info: 'раз в неделю каждый ЧТ в 12:00 (за неделю)',
          action: this.genZayavInstrWeek,
        },
      ],
    }
  },

  methods: {
    async genZayavInstrWeek() {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No token found in local storage.')
        return
      }
      try {
        await reportApi.genZayavInstr(token)
      } catch (error) {
        console.error('Error while generating report:', error)
      }
    },
  },
}
</script>
