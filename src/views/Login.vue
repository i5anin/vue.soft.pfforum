<template>
  <v-sheet width="300" class="mx-auto">
    <v-form ref="form" @submit.prevent="submitForm">
      <v-text-field
        v-model="firstName"
        label="First name"
        :rules="firstNameRules"
      ></v-text-field>

      <v-text-field
        v-model="lastName"
        label="Last name"
        :rules="lastNameRules"
      ></v-text-field>

      <v-btn type="submit" block class="mt-2">Submit</v-btn>

      <!-- Сообщение об успешной отправке -->
      <v-alert v-if="formStatus === 'success'" type="success" class="mt-4">
        Form submitted successfully!
      </v-alert>

      <!-- Сообщение об ошибке отправки -->
      <v-alert v-if="formStatus === 'error'" type="error" class="mt-4">
        Please correct the errors before submitting again.
      </v-alert>
    </v-form>
  </v-sheet>
</template>
<script>
export default {
  data: () => ({
    firstName: '',
    lastName: '',
    firstNameRules: [
      (v) => !!v || 'First name is required',
      (v) => v.length >= 3 || 'First name must be at least 3 characters.',
    ],
    lastNameRules: [
      (v) => !!v || 'Last name is required',
      (v) => !/\d/.test(v) || 'Last name cannot contain digits.',
    ],
    formStatus: '',
  }),
  methods: {
    submitForm() {
      this.$refs.form.validate().then((success) => {
        if (success) {
          // Обновление статуса формы на 'success'
          this.formStatus = 'success'
          // Здесь код для отправки данных формы
        } else {
          // Обновление статуса формы на 'error'
          this.formStatus = 'error'
        }
      })
    },
  },
}
</script>
