<script setup lang="ts">
  import { useLifecycleLogger } from "@/modules/common/hooks/lifecycleLogger";

  const name = "AccessErrorPage";
  useLifecycleLogger({ name });
</script>

<template>
  <div class="page">Oops, you have no access!</div>
</template>

<style scoped></style>
