<template>
  <div class="flex flex-col min-h-screen bg-[#f7f7f7]">
    <main class="flex-1 lg:mb-[200px]">
      <HeaderMain class="forward-top-menu" />
      <VATitle
        :menu="pageName"
        class="mt-15"
        :isShare="isShareOpen"
        :ShareText="inputDataFinal"
      />
      <VAContentMainF
        class="mt-15"
        @updateInputData="InputData"
        @isPass="checkPass"
        @isShowGraph="checkShowGraph"
      />
      <VAKeyWithoutDataF v-if="!isShowGraph" class="" />
      <div v-if="isShowGraph" class="">
        <VAKeyF
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
        />
        <VARegionYearFSR
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
        />
        <VARegionPeriodsFSR
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
        />
        <VATopYearFSR
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
        />
        <VATopPeriodsFSR
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
        />
        <VAInputSingleYearF
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
          @updateInputSingleYear="InputSingleYear"
        />
        <VAimportFS
          v-if="isShowGraph && inputDataSingleYear"
          :inputData="inputDataSingleYear"
        />
        <VARegionFS
          v-if="isShowGraph && inputDataSingleYear"
          :inputData="inputDataSingleYear"
        />
      </div>
      <FooterMain class="mt-5 lg:mb-[-300px]" v-show="isShowGraph" />
    </main>
    <FooterMain class="mt-5" v-show="!isShowGraph" />
  </div>
</template>

<script setup>
import HeaderMain from "../components/Header.vue";
import VATitle from "../components/VATitle.vue";
import VAContentMainF from "../components/VAForwardSector/VAContentMainF.vue";
import VAKeyWithoutDataF from "../components/VAForwardSector/VAKeyWithoutDataF.vue";
import VAKeyF from "../components/VAForwardSector/VAKeyF.vue";
import VARegionYearFSR from "../components/VAForwardSector/VARegionYearFSR.vue";
import VARegionPeriodsFSR from "../components/VAForwardSector/VARegionPeriodsFSR.vue";
import VATopYearFSR from "../components/VAForwardSector/VATopYearFSR.vue";
import VATopPeriodsFSR from "../components/VAForwardSector/VATopPeriodsFSR.vue";

import VAInputSingleYearF from "../components/VAForwardSector/VAInputSingleYearF.vue";

import VAimportFS from "../components/VAForwardSector/VAimportFS.vue";
import VARegionFS from "../components/VAForwardSector/VARegionFS.vue";

import FooterMain from "../components/Footer.vue";

import { ref, computed } from "vue";

const pageName = ref("ForwardLinkages");
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
    sector: inputDataFinal.value.sector,
    year: selectedYear.value,
  };
});

const InputSingleYear = (yearInput) => {
  selectedYear.value = yearInput; // เปลี่ยนปีแล้ว computed จะคำนวณ inputDataSingleYear ให้ทันที
};
</script>

<style lang="scss" scoped>
.forward-top-menu { position: fixed !important; top: 0; left: 0; width: 100%; z-index: 2147483647 !important; }
</style>
