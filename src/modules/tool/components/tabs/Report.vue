<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-table>
          <thead>
            <tr>
              <th class="text-left">Название</th>
              <th class="text-left">Сформировать</th>
              <th class="text-left">Просмотр</th>
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
              <td>
                <v-btn color="primary" @click="viewReport(report)">
                  Просмотреть
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

export default {
  data() {
    const dateNow = new Date()
    const dateNextWeek = {
      start: format(startOfWeek(dateNow), 'yyyy-MM-dd'),
      end: format(endOfWeek(dateNow), 'yyyy-MM-dd'),
    }
    const dateAll = {
      start: '2020-01-01', // replace with your start date
      end: format(dateNow, 'yyyy-MM-dd'),
    }

    return {
      reports: [
        { name: 'Отчет за неделю', date: dateNow },
        { name: 'Отчет за месяц', date: dateNextWeek },
        { name: 'Отчет за всё время', date: dateAll },
      ],
    }
  },
  methods: {
    generateReport(report) {
      console.log(`Generating report: ${report.name}`)
    },
    viewReport(report) {
      console.log(`View report: ${report.name}`)
    },
  },
}
</script>
