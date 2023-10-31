<template>
  <v-dialog :value="value" @input="$emit('input', $event)" persistent width="1024">
    <v-card>
      <v-card-title>
        <span class="text-h5">Добавить инструмент</span>
      </v-card-title>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
