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
      <VAContentMainFI
        class="mt-15"
        @updateInputData="InputData"
        @isPass="checkPass"
        @isShowGraph="checkShowGraph"
      />
      <VAKeyWithoutDataFI v-if="!isShowGraph" class="" />
      <div v-if="isShowGraph" :key="locale" class="">
        <VAKeyFI
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
        />
        <VATopYearFIR
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
        />
        <VATopPeriodsFIR
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
        />
        <VAInputSingleYearFI
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
          @updateInputSingleYear="InputSingleYear"
        />
        <VASectorFIS
          v-if="isShowGraph && inputDataSingleYear"
          :inputData="inputDataSingleYear"
        />
        <VARegionFIS
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

import VAContentMainFI from "../components/VAForwardImport/VAContentMainFI.vue";
import VAKeyWithoutDataFI from "../components/VAForwardImport/VAKeyWithoutDataFI.vue";
import VAKeyFI from "../components/VAForwardImport/VAKeyFI.vue";

import VATopYearFIR from "../components/VAForwardImport/VATopYearFIR.vue";
import VATopPeriodsFIR from "../components/VAForwardImport/VATopPeriodsFIR.vue";

import VAInputSingleYearFI from "../components/VAForwardImport/VAInputSingleYearFI.vue";

import VASectorFIS from "../components/VAForwardImport/VASectorFIS.vue";
import VARegionFIS from "../components/VAForwardImport/VARegionFIS.vue";

import FooterMain from "../components/Footer.vue";

import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();

const pageName = ref("ForwardLinkages");
const inputDataFinal = ref(null);
const selectedYear = ref(null); // ปีเดี่ยวที่ได้มาจาก GVCInputSingleYear
const isShareOpen = ref(false);
const isShowGraph = ref(false);

watch(locale, () => {
  isShowGraph.value = false;
  isShareOpen.value = false;
});

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
