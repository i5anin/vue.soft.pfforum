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
              <!--              <th class="text-left">Загрузить</th>-->
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
              <!--              <td>-->
              <!--                <v-btn color="green" @click="report.action(report)">-->
              <!--                  Excel-->
              <!--                </v-btn>-->
              <!--              </td>-->
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
  </v-container>
  <ReportZakaz></ReportZakaz>
</template>
<script>
import { reportApi } from '../api/report'
import ReportZakaz from './ReportBuh.vue'

import Modal from '@/modules/shared/components/Modal.vue'

export default {
  components: { ReportZakaz },
  data() {
    return {
      reports: [
        {
          name: 'Исключен сломанный',
          info: 'раз в неделю каждый ПТ в 12:00 (за неделю)',
          action: this.genBuchIssuedWeek,
        },
        {
          name: 'По завершению операции',
          info: '',
          action: this.genBuchEndOp,
        },
        {
          name: 'Журнал поврежденного',
          info: 'раз в месяц каждый ПТ в 12:00 (за месяц)',
          action: this.genBuchMonth,
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
