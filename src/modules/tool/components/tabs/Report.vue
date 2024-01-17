<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-table>
          <thead>
            <tr>
              <th class="text-left">Отчет</th>
              <th class="text-left">Действие</th>
              <th class="text-left">Действие</th>
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
export default {
  data() {
    return {
      reports: [
        { name: 'Отчет за неделю' },
        { name: 'Отчет за месяц' },
        { name: 'Отчет за всё время' },
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
