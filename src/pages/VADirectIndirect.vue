<template>
  <div class="flex flex-col bg-[#f7f7f7]">
    <main>
      <VAHeader :menu="pageName" class="fixed top-0 left-0 w-full" />
      <VATitle
        :menu="pageName"
        class="mt-15"
        :isShare="isShareOpen"
        :ShareText="inputDataFinal"
      />
      <VAContentMainDI
        class="mt-15"
        @updateInputData="InputData"
        @isPass="checkPass"
        @isShowGraph="checkShowGraph"
      />
      <VAKeyDI />
      <div v-if="isShowGraph" class="">
        <VAGraph1R
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
        />
        <VAInputSingleYearDI
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
          @updateInputSingleYear="InputSingleYear"
        />
      </div>
    </main>
    <FooterMain class="mt-12" />
  </div>
</template>

<script setup>
import VAHeader from "../components/VAHeader.vue";
import VATitle from "../components/VATitle.vue";
import VAContentMainDI from "../components/VADirectIndirect/VAContentMainDI.vue";
import VAKeyDI from "../components/VADirectIndirect/VAKeyDI.vue";
import VAGraph1R from "../components/VADirectIndirect/VAGraph1R.vue";
import VAInputSingleYearDI from "../components/VADirectIndirect/VAInputSingleYearDI.vue";

import FooterMain from "../components/Footer.vue";

import { ref, computed } from "vue";

const pageName = ref("DirectIndirect");
const inputDataFinal = ref(null);
const selectedYear = ref(null); // ปีเดี่ยวที่ได้มาจาก GVCInputSingleYear
const isShareOpen = ref(false);
const isShowGraph = ref(false);

const InputData = (data) => {
  isShowGraph.value = true;
  inputDataFinal.value = data;

  isShareOpen.value = true;
};

const checkPass = (data) => {
  isShareOpen.value = data;
};

const checkShowGraph = (value) => {
  isShowGraph.value = value;
};

// ✅ คำนวณ inputDataSingleYear ให้ผูกกับทั้งประเทศ (inputDataFinal) และปีเดี่ยว (selectedYear)
const inputDataSingleYear = computed(() => {
  if (!inputDataFinal.value || !selectedYear.value) return null;
  return {
    exporting: inputDataFinal.value.exporting, // ใช้ค่าล่าสุดเสมอ
    importing: inputDataFinal.value.importing,
    sector: inputDataFinal.value.sector,
    year: selectedYear.value,
  };
});

const InputSingleYear = (yearInput) => {
  selectedYear.value = yearInput; // เปลี่ยนปีแล้ว computed จะคำนวณ inputDataSingleYear ให้ทันที
};
</script>

<style lang="scss" scoped></style>
1
