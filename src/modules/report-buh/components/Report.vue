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
              <th class="text-left">Расчетный период</th>
              <th class="text-left">На почту</th>
              <!-- <th class="text-left">Загрузить</th>-->
            </tr>
          </thead>
          <tbody>
            <tr v-for="(report, index) in reports" :key="index">
              <td>{{ report.name }}</td>
              <td>{{ report.period }}</td>
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
import ReportZakaz from './ReportBuh.vue'

export default {
  components: { ReportZakaz },
  data() {
    return {
      reports: [
        {
          name: 'Исключен сломанный',
          info: 'раз в неделю каждый ПТ в 12:00 (за неделю)',
          action: this.genBuchIssuedWeek,
          period: '',
        },
        {
          name: 'По завершению операции',
          info: '-',
          action: this.genBuchEndOp,
          period: '',
        },
        {
          name: 'Журнал поврежденного',
          info: 'раз в месяц каждый ПТ в 12:00 (за месяц)',
          action: this.genBuchMonth,
          period: '',
        },
        // {
        //   name: 'Отчет заявка на инструмент',
        //   info: 'раз в неделю каждый ЧТ в 12:00 (за неделю)',
        //   action: this.genZayavInstrWeek,
        // },
      ],
    }
  },

  methods: {

    genBuchIssuedWeek() {
      const now = new Date()
      const lastThursday = new Date()
      lastThursday.setDate(now.getDate() - ((now.getDay() + 3) % 7))
      const nextThursday = new Date(lastThursday)
      nextThursday.setDate(nextThursday.getDate() + 7)

      this.reports.find(report => report.action === this.genBuchIssuedWeek).period = `${lastThursday.toISOString().split('T')[0]} - ${nextThursday.toISOString().split('T')[0}`


    },
    genBuchMonth() {
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

      this.reports.find(report => report.action === this.genBuchMonth).period = `${firstDayOfMonth.toISOString().split('T')[0]} - ${firstDayOfNextMonth.toISOString().split('T')[0}`


    },
  },
}
</script>
