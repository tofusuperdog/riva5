<template>
  <div class="flex flex-col min-h-screen">
    <main class="flex-1">
      <HeaderMain class="!z-[1000]" />
      <VATitle
        :menu="pageName"
        :isShare="isShareOpen"
        :ShareText="inputDataFinal"
      />
      <VAContentMain
        class="mt-15"
        @updateInputData="InputData"
        @isPass="checkPass"
        @isShowGraph="checkShowGraph"
      />
      <VAKeyWithoutData v-if="!isShowGraph" class="" />
      <div v-if="isShowGraph" :key="locale" class="">
        <VAKey
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
        />
        <VARegionYearR
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
        />
        <VARegionPeriodsR
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
        />
        <VATopYearR
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
        />
        <VATopPeriodsR
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
        />
        <VAInputSingleYear
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
          @updateInputSingleYear="InputSingleYear"
        />
        <VASourceS
          v-if="isShowGraph && inputDataSingleYear"
          :inputData="inputDataSingleYear"
        />
        <VARegionS
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
import VAContentMain from "../components/VABackwardSector/VAContentMain.vue";

import VAKeyWithoutData from "../components/VABackwardSector/VAKeyWithoutData.vue";
import VAKey from "../components/VABackwardSector/VAKey.vue";

import VARegionYearR from "../components/VABackwardSector/VARegionYearR.vue";
import VARegionPeriodsR from "../components/VABackwardSector/VARegionPeriodsR.vue";
import VATopYearR from "../components/VABackwardSector/VATopYearR.vue";
import VATopPeriodsR from "../components/VABackwardSector/VATopPeriodsR.vue";

import VAInputSingleYear from "../components/VABackwardSector/VAInputSingleYear.vue";

import VASourceS from "../components/VABackwardSector/VASourceS.vue";
import VARegionS from "../components/VABackwardSector/VARegionS.vue";

import FooterMain from "../components/Footer.vue";

import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n({ useScope: "global" });

const pageName = ref("BackwardLinkages");
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

watch(locale, () => {
  isShowGraph.value = false;
  isShareOpen.value = false;
});

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
