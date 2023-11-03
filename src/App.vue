<template>
  <v-app>
    <Header />
    <v-main class="d-flex flex-column">
      <Content class="flex-1-1" />
      <Footer class="flex-0-0" />
    </v-main>
  </v-app>
</template>

<script>
import { Header, Content, Footer } from '@/components'
import Modal from '@/components/shared/Modal.vue'

export default {
  components: { Header, Content, Footer, Modal },
}
</script>

<style>
body {
  font-family: 'Nunito', sans-serif;
}
</style>
