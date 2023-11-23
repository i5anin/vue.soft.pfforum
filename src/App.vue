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
import { Routes } from '@/router'


export default {
  components: { Header, Content, Footer, Modal },
  created() {
    this.checkAuth()
  },
  methods: {
    checkAuth() {
      const authUser = localStorage.getItem('user')
      if (authUser == null) {
        this.$router.push(Routes.LOGIN)
      }
    }
  }
}
</script>

<style>
body {
  font-family: 'Nunito', sans-serif;
}
</style>
