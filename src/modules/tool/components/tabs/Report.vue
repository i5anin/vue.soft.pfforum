<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-table>
          <thead>
            <tr>
              <th class="text-left">Название</th>
              <th class="text-left">Информация</th>
              <th class="text-left">Сформировать</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(report, index) in reports" :key="index">
              <td>{{ report.name }}</td>
              <td>{{ report.info }}</td>
              <td>
                <v-btn color="primary" @click="report.action(report)">
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
    return {
      reports: [
        {
          name: 'Отчет в бухгалтерию исключен сломанный',
          info: 'раз в неделю каждый ЧТ в 12:00 (за неделю)',
          action: this.generateBuchIscSlom,
        },
        {
          name: 'Отчет в бухгалтерию',
          info: 'по завершению операции',
          action: this.generateBuchOtchet,
        },
        {
          name: 'Отчет в бухгалтерию журнал испорченного',
          info: 'раз в месяц каждый ЧТ в 12:00 (за месяц)',
          action: this.generateBuchJurnIsp,
        },
        {
          name: 'Отчет заявка на инструмент',
          info: 'раз в неделю каждый ПТ в 12:00 (за неделю)',
          action: this.generateZayavInstr,
        },
      ],
    }
  },

  methods: {
    async generateBuchIscSlom(report) {
      console.log('Генерация отчета:', report.name)
      await reportApi.report()
    },
    async generateBuchOtchet(report) {
      console.log('Генерация отчета:', report.name)
      // Логика для отчета "Отчет в бухгалтерию"
    },
    async generateBuchJurnIsp(report) {
      console.log('Генерация отчета:', report.name)
      // Логика для отчета "Отчет в бухгалтерию журнал испорченного"
    },
    async generateZayavInstr(report) {
      console.log('Генерация отчета:', report.name)
      // Логика для отчета "Отчет заявка на инструмент"
    },
  },
}
</script>
