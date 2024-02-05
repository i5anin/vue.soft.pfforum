<template>
  <div>
    <v-container>
      <v-img class="mx-auto my-6" max-width="100" src="@/assets/logo_min.png" />
      <h1 class="text-h4 text-center pb-6">Авторизация</h1>
      <v-card
        v-if="!isAuthorized"
        class="mx-auto pa-12 pb-8"
        elevation="8"
        max-width="448"
        rounded="lg"
      >
        <v-form ref="form" v-model="formValid">
          <div class="text-subtitle-1 text-medium-emphasis">Логин</div>
          <v-text-field
            v-model="login"
            density="compact"
            placeholder="Login"
            prepend-inner-icon="mdi-key"
            variant="outlined"
            :rules="loginRules"
          />
          <div
            class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between"
          >
            Пароль
          </div>
          <v-text-field
            v-model="password"
            :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
            :type="visible ? 'text' : 'password'"
            density="compact"
            placeholder="Password"
            prepend-inner-icon="mdi-lock-outline"
            variant="outlined"
            @click:append-inner="toggleVisibility"
            :rules="passwordRules"
          />
          <v-btn
            :disabled="!formValid"
            @click="submit"
            block
            class="mb-8"
            color="blue"
            size="large"
            variant="tonal"
          >
            Войти
          </v-btn>
          <v-alert
            v-if="showError"
            type="error"
            dismissible
            @click="showError = false"
          >
            {{ errorMessage }}
          </v-alert>
        </v-form>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'

export default {
  data: () => ({
    login: '',
    password: '',
    visible: false,
    showError: false,
    errorMessage: '',
    formValid: false,
    loginRules: [(v) => !!v || 'Логин обязателен'],
    passwordRules: [(v) => !!v || 'Пароль обязателен'],
  }),
  computed: {
    ...mapState('authStore', ['isAuthorized']),
  },
  methods: {
    ...mapMutations('authStore', ['SET_AUTHORIZED', 'SET_USER_ROLE']),
    ...mapActions('authStore', ['login', 'logout']),
    toggleVisibility() {
      this.visible = !this.visible
    },
    async submit() {
      if (!this.formValid) return
      try {
        const success = await this.login({
          login: this.login,
          password: this.password,
        })
        if (success) {
          this.$router.push('/')
        } else {
          this.showError = true
          this.errorMessage = 'Неправильный логин или пароль'
        }
      } catch (error) {
        this.showError = true
        this.errorMessage = error.message
      }
    },
  },
}
</script>
