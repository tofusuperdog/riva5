<template>
  <div class="my-6">
    <div
      class="h-45 md:h-35 w-full bg-[linear-gradient(to_top_left,_#1B81C1,_#1A425A)] text-white flex items-center justify-center"
    >
      <div class="flex flex-col md:flex-row items-center justify-center">
        <div class="py-2">
          <div class="text-xl md:text-2xl text-semibold">
            Backward linkages by year
          </div>
          <div class="text-xs">
            Explore detailed linkages in a specific year
          </div>
        </div>
        <div class="px-6">
          <div class="w-[200px] md:w-[150px]">
            <yearSelect
              label="Year"
              @update="onUpdateYear"
              :initialValue="yearEnd"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

import yearSelect from "../VAYearSelect.vue";

// Props
const props = defineProps({
  inputData: Object,
});

// ปี
const yearEnd = ref(props.inputData.yearEnd);
// 📢 Emit
const emit = defineEmits(["updateInputSingleYear"]);

const onUpdateYear = (year) => {
  emit("updateInputSingleYear", year);
};
</script>

<style lang="scss" scoped></style>
