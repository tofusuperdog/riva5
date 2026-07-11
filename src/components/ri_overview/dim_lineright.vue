<template>
  <div class="column">
    <div
      class="bgBlue q-pl-sm"
      :style="{ width: topValue * ampChart + 'px' }"
      align="left"
      v-if="topValue > 0.15"
    >
      {{ topValue }}
    </div>
    <div v-else class="row justify-start">
      <div
        class="bgBlue q-pl-sm"
        :style="{ width: topValue * ampChart + 'px' }"
        align="left"
      ></div>
      <div class="q-pl-sm labelOut">
        {{ topValue === null ? " No data available" : topValue }}
      </div>
    </div>

    <div class="q-pt-xs"></div>
    <div
      class="bgDarkBlue q-pl-sm"
      :style="{ width: LowerValue * ampChart + 'px' }"
      align="left"
      v-if="LowerValue > 0.15"
    >
      {{ LowerValue }}
    </div>
    <div v-else class="row justify-start">
      <div
        class="bgDarkBlue q-pl-sm"
        :style="{ width: LowerValue * ampChart + 'px' }"
        align="left"
      ></div>
      <div class="q-pl-sm labelOut">
        {{ LowerValue === null ? "No data available" : LowerValue }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
const props = defineProps({
  topValue: {
    type: [Number, null],
    required: false,
    default: null,
  },
  LowerValue: {
    type: [Number, null],
    required: false,
    default: null,
  },
});
const ampChart = ref(200);
</script>

<style lang="scss" scoped>
.labelOut {
  padding-top: 5px;
}
.bgBlue {
  background-color: #f5b283;
  height: 30px;
  color: white;
  line-height: 30px;
}
.bgDarkBlue {
  background-color: #c55a0f;
  height: 30px;
  color: white;
  line-height: 30px;
}
</style>
