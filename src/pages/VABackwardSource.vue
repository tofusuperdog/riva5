<template>
  <div class="flex flex-col min-h-screen">
    <main class="flex-1">
      <HeaderMain class="backward-source-top-menu" />
      <VATitle
        :menu="pageName"
        class="mt-15"
        :isShare="isShareOpen"
        :ShareText="inputDataFinal"
      />
      <VAContentMainS
        class="mt-15"
        @updateInputData="InputData"
        @isPass="checkPass"
        @isShowGraph="checkShowGraph"
      />
      <VAKeyWithoutDataS v-if="!isShowGraph" class="" />
      <div v-if="isShowGraph" class="">
        <VAKeyS
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
        />
        <VASectorYearSR
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
        />
        <VASectorPeriodsSR
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
        />
        <VAInputSingleYearS
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
          @updateInputSingleYear="InputSingleYear"
        />
        <VASectorSS
          v-if="isShowGraph && inputDataSingleYear"
          :inputData="inputDataSingleYear"
        />
        <VARegionSS
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
import VAContentMainS from "../components/VABackwardSource/VAContentMainS.vue";
import VAKeyWithoutDataS from "../components/VABackwardSource/VAKeyWithoutDataS.vue";
import VAKeyS from "../components/VABackwardSource/VAKeyS.vue";

import VASectorYearSR from "../components/VABackwardSource/VASectorYearSR.vue";
import VASectorPeriodsSR from "../components/VABackwardSource/VASectorPeriodsSR.vue";

import VAInputSingleYearS from "../components/VABackwardSource/VAInputSingleYearS.vue";
import VASectorSS from "../components/VABackwardSource/VASectorSS.vue";
import VARegionSS from "../components/VABackwardSource/VARegionSS.vue";

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
    source: inputDataFinal.value.source,
    year: selectedYear.value,
  };
});

const InputSingleYear = (yearInput) => {
  selectedYear.value = yearInput; // เปลี่ยนปีแล้ว computed จะคำนวณ inputDataSingleYear ให้ทันที
};
</script>

<style lang="scss" scoped>
.backward-source-top-menu {
  position: fixed !important;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 2147483647 !important;
}
</style>
