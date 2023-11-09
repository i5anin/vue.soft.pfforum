<template>
  <v-footer class='container'>
    Все права защищены 2023
    <v-spacer />
    <span :class="{'text-red': databaseInfo && databaseInfo.databaseType === 'build'}" v-if='databaseInfo'>Версия
      {{ databaseInfo.databaseType }}
    </span>
  </v-footer>
</template>

<script>
import { getDatabaseInfo } from '@/api/api' // Убедитесь, что путь к api.js правильный

export default {
  name: 'Footer',
  data() {
    return {
      databaseInfo: null,
    }
  },
  async created() {
    try {
      this.databaseInfo = await getDatabaseInfo()
    } catch (error) {
      // Обработка ошибок, возможно показать сообщение пользователю
      console.error('Failed to load database info:', error)
    }
  },
}
</script>

<style scoped lang='css'>
.text-red {
  color: red;
}
</style>
