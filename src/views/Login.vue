<template>
  <div>
    <v-container>
      <v-img class="mx-auto my-6" max-width="100" src="@/assets/logo_min.png" />

      <h1 class="text-h4 text-center pb-6">Авторизация</h1>
      <v-card
        class="mx-auto pa-12 pb-8"
        elevation="8"
        max-width="448"
        rounded="lg"
      >
        <div class="text-subtitle-1 text-medium-emphasis">Логин</div>

        <v-text-field
          density="compact"
          placeholder="Login"
          prepend-inner-icon="mdi-key"
          variant="outlined"
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
        ></v-text-field>

        <v-btn block class="mb-8" color="blue" size="large" variant="tonal">
          Войти
        </v-btn>

        <v-card-text class="text-center">
          <a
            class="text-blue text-decoration-none"
            href="#"
            rel="noopener noreferrer"
            target="_blank"
          />
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script>
export default {
  data: () => ({
    login: '',
    password: '',
    visible: false,
  }),
  methods: {
    toggleVisibility() {
      this.visible = !this.visible
    },
    submit() {
      const formData = {
        login: this.login,
        password: this.password,
      }
      console.log(formData)
    },
  },
}
</script>
