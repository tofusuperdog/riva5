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
      <VAKeyP />
      <div v-if="isShowGraph" class="">
        <VAValueAddedPR
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
        />
        <VAAcrossYearPR
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
        />
        <VAGrossPR
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
        />
        <VAInputSingleYearP
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
          @updateInputSingleYear="InputSingleYear"
        />
        <VAValueAddedPS
          v-if="isShowGraph && inputDataSingleYear"
          :inputData="inputDataSingleYear"
        />
        <VARegionPS
          v-if="isShowGraph && inputDataSingleYear"
          :inputData="inputDataSingleYear"
        />
        <VAGrossPS
          v-if="isShowGraph && inputDataSingleYear"
          :inputData="inputDataSingleYear"
        />
      </div>
      <FooterMain class="mt-5" v-show="isShowGraph" />
    </main>
    <FooterMain class="mt-5 md:mt-10 lg:mt-15" v-show="!isShowGraph" />
  </div>
</template>

<script setup>
import VAHeader from "../components/VAHeader.vue";
import VATitle from "../components/VATitle.vue";
import VAContentMainDI from "../components/VAParticipation/VAContentMainP.vue";
import VAKeyP from "../components/VAParticipation/VAKeyP.vue";
import VAValueAddedPR from "../components/VAParticipation/VAValueAddedPR.vue";
import VAAcrossYearPR from "../components/VAParticipation/VAAcrossYearPR.vue";
import VAGrossPR from "../components/VAParticipation/VAGrossPR.vue";
import VAInputSingleYearP from "../components/VAParticipation/VAInputSingleYearP.vue";
import VAValueAddedPS from "../components/VAParticipation/VAValueAddedPS.vue";
import VARegionPS from "../components/VAParticipation/VARegionPS.vue";
import VAGrossPS from "../components/VAParticipation/VAGrossPS.vue";

import FooterMain from "../components/Footer.vue";

import { ref, computed } from "vue";

const pageName = ref("ParticipationInGVCs");
const inputDataFinal = ref(null);
const selectedYear = ref(null); // ปีเดี่ยวที่ได้มาจาก GVCInputSingleYear
const isShareOpen = ref(false);
const isShowGraph = ref(false);

const InputData = (data) => {
  // console.log("data", data);
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
