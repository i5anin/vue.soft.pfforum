<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-table>
          <thead>
            <tr>
              <th class="text-left">Название</th>
              <th class="text-left">Информация</th>
              <th class="text-left" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="(report, index) in reports" :key="index">
              <td>{{ report.name }}</td>
              <td>{{ report.info }}</td>
              <td>
                <v-btn color="primary" @click="report.action(report)">
                  Сформировать
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
    return {
      reports: [
        {
          name: 'Отчет в бухгалтерию исключен сломанный',
          info: 'раз в неделю каждый ПТ в 12:00 (за неделю)',
          action: this.genBuchIssuedWeek,
        },
        {
          name: 'Отчет в бухгалтерию',
          info: 'по завершению операции',
          action: this.genBuchEndOp,
        },
        {
          name: 'Отчет в бухгалтерию журнал поврежденного',
          info: 'раз в месяц каждый ПТ в 12:00 (за месяц)',
          action: this.genBuchMonth,
        },
        {
          name: 'Отчет заявка на инструмент',
          info: 'раз в неделю каждый ЧТ в 12:00 (за неделю)',
          action: this.genZayavInstrWeek,
        },
      ],
    }
  },

  methods: {
    async genBuchIssuedWeek() {
      await reportApi.genBuchWeek()
    },
    async genBuchEndOp() {
      await reportApi.genBuchEndOp()
    },
    async genBuchMonth() {
      await reportApi.genBuchMonth()
    },
    async genZayavInstrWeek() {
      await reportApi.genZayavInstr()
    },
  },
}
</script>
