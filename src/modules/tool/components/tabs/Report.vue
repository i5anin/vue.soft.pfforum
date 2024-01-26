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
          action: this.genBuchEndOperation,
        },
        {
          name: 'Отчет в бухгалтерию журнал испорченного',
          info: 'раз в месяц каждый ПТ в 12:00 (за месяц)',
          action: this.genBuchDamagedMonth,
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
    async genBuchIssuedWeek(report) {
      console.log('Генерация отчета:', report.name)
    },
    async genBuchEndOperation(report) {
      console.log('Генерация отчета:', report.name)
    },
    async genBuchDamagedMonth(report) {
      console.log('Генерация отчета:', report.name)
    },
    async genZayavInstrWeek() {
      await reportApi.genZayavInstr()
    },
  },
}
</script>
