<template>
  <v-footer v-if="databaseInfo" class="container">
    Все права защищены © 2024
    <v-spacer />
    <!-- Если название базы данных равно "BusinessForum", показываем только версию -->
    <span
      v-if="databaseInfo.dbName === 'BusinessForum'"
      :class="{ 'text-red': isBuildDatabase }"
    >
      Версия: {{ databaseInfo.databaseType }}
    </span>
    <!-- Если название базы данных не равно "BusinessForum", показываем только название базы данных -->
    <div v-else>
      <span> База: {{ databaseInfo.dbName }} </span>
    </div>
  </v-footer>
</template>

<script>
import { getDatabaseInfo } from '@/api/getDatabaseInfo'

export default {
  name: 'AppFooter',
  data() {
    return {
      databaseInfo: null,
    }
  },
  computed: {
    isBuildDatabase() {
      return this.databaseInfo && this.databaseInfo.databaseType === 'build'
    },
  },
  async mounted() {
    try {
      this.databaseInfo = await getDatabaseInfo()
    } catch (error) {
      console.error('Failed to load database info:', error)
    }
  },
}
</script>

<style scoped lang="css">
.text-red {
  color: red;
}
</style>
