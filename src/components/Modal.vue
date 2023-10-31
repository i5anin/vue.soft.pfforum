<template>
  <v-dialog :value="value" @input="$emit('input', $event)" width="1024">
    <v-card>
      <v-card-title>
        Simple Dialog
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
