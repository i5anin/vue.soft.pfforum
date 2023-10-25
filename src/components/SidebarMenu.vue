<template>
  <v-navigation-drawer v-model="drawer" app>
    <v-list-item-group>
      <v-list-item title="Главная">
        <v-list-item-icon>
          <v-icon>mdi-home</v-icon>
        </v-list-item-icon>
        <v-list-item-content>Главная</v-list-item-content>
      </v-list-item>

      <v-list-item title="Станки">
        <v-list-item-icon>
          <v-icon>mdi-cogs</v-icon>
        </v-list-item-icon>
        <v-list-item-content>Станки</v-list-item-content>
      </v-list-item>

      <v-list-item title="План">
        <v-list-item-icon>
          <v-icon>mdi-calendar</v-icon>
        </v-list-item-icon>
        <v-list-item-content>План</v-list-item-content>
      </v-list-item>

      <!-- ... и так далее для каждого пункта меню ... -->

      <v-list-item-group title="Участки">
        <v-list-item title="Отдел ТО и ПП">
          <v-list-item-icon>
            <v-icon>mdi-hammer-screwdriver</v-icon>
          </v-list-item-icon>
          <v-list-item-content>Отдел ТО и ПП</v-list-item-content>
        </v-list-item>

        <!-- ... и так далее для каждого подпункта меню в группе "Участки" ... -->

      </v-list-item-group>
    </v-list-item-group>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from 'vue';

const drawer = ref(false);

function toggleDrawer() {
  drawer.value = !drawer.value;
}
</script>
