<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-table>
          <thead>
            <tr>
              <th class="text-left">Название</th>
              <th class="text-left">Сформировать</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(report, index) in reports" :key="index">
              <td>{{ report.name }}</td>
              <td>
                <v-btn color="primary" @click="generateReport(report)">
                  Сформировать отчет
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
import { startOfWeek, endOfWeek, format } from 'date-fns'
import { reportApi } from '../../api/report'

export default {
  data() {
    const dateNow = new Date()
    const dateNextWeek = {
      start: format(startOfWeek(dateNow), 'yyyy-MM-dd'),
      end: format(endOfWeek(dateNow), 'yyyy-MM-dd'),
    }
    const dateAll = {
      start: '2020-01-01',
      end: format(dateNow, 'yyyy-MM-dd'),
    }

    return {
      reports: [
        { name: 'Отчет заявка на инструмент', date: dateNow },
        { name: 'Отчет в бухгалтерию', date: dateNextWeek },
      ],
    }
  },

  methods: {
    async generateReport() {
      await reportApi.report()
    },
  },
}
</script>
