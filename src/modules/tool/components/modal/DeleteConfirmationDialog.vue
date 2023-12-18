<template>
  <v-dialog
    :modelValue="confirmDeleteDialog"
    @update:modelValue="updateModelValue"
    persistent
    max-width="290"
    class="v-dialog-delete"
  >
    <v-card>
      <v-card-title class="headline">Удалить инструмент?</v-card-title>
      <v-card-actions>
        <v-spacer />
        <v-btn color="blue darken-1" text @click="updateModelValue(false)"
          >Отмена</v-btn
        >
        <v-btn color="blue darken-1" text @click="onDelete">Удалить</v-btn>
        <v-spacer />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    confirmDeleteDialog: Boolean,
    onDelete: Function,
  },
  methods: {
    updateModelValue(newValue) {
      this.$emit('update:confirmDeleteDialog', newValue)
    },
  },
}
</script>

<style scoped lang="css">
.v-dialog-delete .v-card-title {
  font-size: 20px;
  color: red;
}

.v-dialog-delete .v-btn {
  color: red;
}

.v-dialog-delete .v-btn:hover {
  background-color: rgba(255, 0, 0, 0.1);
}
</style>
