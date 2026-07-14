<template>
  <div class="flex flex-col min-h-screen bg-[#f7f7f7]">
    <main class="flex-1">
      <HeaderMain class="gvc-top-menu" />
      <VATitle
        :menu="pageName"
        :isShare="isShareOpen"
        :ShareText="inputDataFinal"
      />
      <GVCContentMain
        :key="locale"
        class="mt-15"
        @updateInputData="InputData"
        @isShowGraph="checkShowGraph"
      />
      <GVCKey class="" />
      <div v-if="isShowGraph" :key="locale" class="">
        <GBVCAcrossYears
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
        />
        <GVCAcrossPeriods
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
        />
        <GVCTop5Sectors
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
        />
        <GVCTop5Partner
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
        />
        <GVCInputSingleYear
          v-if="isShowGraph && inputDataFinal"
          :inputData="inputDataFinal"
          @updateInputSingleYear="InputSingleYear"
        />
        <GVCoverview
          v-if="isShowGraph && inputDataSingleYear"
          :inputData="inputDataSingleYear"
        />
        <GVCTop5SectorBack
          v-if="isShowGraph && inputDataSingleYear"
          :inputData="inputDataSingleYear"
        />
        <GVCTop5SectorFor
          v-if="isShowGraph && inputDataSingleYear"
          :inputData="inputDataSingleYear"
        />
        <GVCTop5PartnerBack
          v-if="isShowGraph && inputDataSingleYear"
          :inputData="inputDataSingleYear"
        />
        <GVCTop5PartnerFor
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
import GVCContentMain from "../components/VAGVCRelationships/GVCContentRangeMain.vue";
import GVCKey from "../components/VAGVCRelationships/GVCKey.vue";

import GBVCAcrossYears from "../components/VAGVCRelationships/GVCAcrossYears.vue";
import GVCAcrossPeriods from "../components/VAGVCRelationships/GVCAcrossPeriods.vue";
import GVCTop5Sectors from "../components/VAGVCRelationships/GVCTop5Sectors.vue";
import GVCTop5Partner from "../components/VAGVCRelationships/GVCTop5Partner.vue";

import GVCInputSingleYear from "../components/VAGVCRelationships/GVCInputSingleYear.vue";
import GVCoverview from "../components/VAGVCRelationships/GVCOverview.vue";
import GVCTop5SectorBack from "../components/VAGVCRelationships/GVCTop5SectorBack.vue";
import GVCTop5SectorFor from "../components/VAGVCRelationships/GVCTop5SectorFor.vue";

import GVCTop5PartnerBack from "../components/VAGVCRelationships/GVCTop5PartnerBack.vue";
import GVCTop5PartnerFor from "../components/VAGVCRelationships/GVCTop5PartnerFor.vue";

import FooterMain from "../components/Footer.vue";
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n({ useScope: "global" });

const pageName = ref("gvcoverview");
const inputDataFinal = ref(null);
const selectedYear = ref(null); // ปีเดี่ยวที่ได้มาจาก GVCInputSingleYear
const isShareOpen = ref(false);
const isShowGraph = ref(false);

// ✅ คำนวณ inputDataSingleYear ให้ผูกกับทั้งประเทศ (inputDataFinal) และปีเดี่ยว (selectedYear)
const inputDataSingleYear = computed(() => {
  if (!inputDataFinal.value || !selectedYear.value) return null;
  return {
    exporting: inputDataFinal.value.exporting, // ใช้ค่าล่าสุดเสมอ
    year: selectedYear.value,
  };
});

const InputData = (data) => {
  inputDataFinal.value = data;
  if (inputDataFinal.value) isShareOpen.value = true;
  // ไม่ต้องไปยุ่งกับ inputDataSingleYear ที่นี่ เพราะ computed จะคำนวณให้เอง
};

const InputSingleYear = (yearInput) => {
  selectedYear.value = yearInput; // เปลี่ยนปีแล้ว computed จะคำนวณ inputDataSingleYear ให้ทันที
};

const checkShowGraph = (value) => {
  isShowGraph.value = value;
};
</script>

<style lang="scss" scoped>
.gvc-top-menu {
  position: sticky !important;
  top: 0;
  z-index: 99999 !important;
}
</style>
