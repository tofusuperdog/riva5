<template>
  <div class="q-pa-md">
    <!-- bar#1 -->
    <div class="q-pt-sm font-24 q-pl-md" align="center">
      {{ name }}'s <span v-if="type === 'Sustainable'">sustainable</span
      ><span v-else>conventional</span> integration score in {{ year }} was
      <span class="text-green"
        ><b>{{ data.length == 1 ? data[0].score : 0 }}</b></span
      >
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";

// Define props
const props = defineProps({
  data: Array,
  type: String,
  year: Number,
  name: String,
});
</script>

<style lang="scss" scoped></style>
