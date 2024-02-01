<template>
  <v-card>
    <v-tabs v-model="tab">
      <v-tab v-for="item in tabs" :key="item.name" :value="item.name">
        {{ item.name }}
      </v-tab>
    </v-tabs>

    <v-card-text>
      <v-window v-model="tab">
        <v-window-item
          v-for="item in tabs"
          :key="`window-item-${item.name}`"
          :value="item.name"
        >
          <component
            :is="item.component"
            :key="`component-${item.name}-${tab}`"
            :type="item.type"
          />
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script>
import tabs from './tabsConfig'

export default {
  data() {
    return {
      tab: 'Редактор',
      tabs,
    }
  },
  watch: {
    tab() {
      let current_tab = this.tabs.find((el) => el.name === this.tab)
      window.location.hash = current_tab.url
    },
  },
  mounted() {
    let current_tab = this.tabs.find((el) => el.url === window.location.hash)
    if (current_tab !== undefined) this.tab = current_tab.name
  },
}
</script>
