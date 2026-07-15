<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto relative z-100 bg-[#FFFFFF] border-1 border-[#DDDDDD] rounded-md p-2 md:p-4 mt-2 md:mt-4"
  >
    <div class="text-md md:text-lg font-semibold fblack">
      {{ t('forward.importPolicyTitle') }}
    </div>
    <div class="fsub">
      <ul class="list-disc pl-6">
        <li>
          {{ t('forward.importPolicyOne', { economy: exportingEconomy }) }}
        </li>
        <li>
          {{ t('forward.compareExporters') }}
        </li>
      </ul>
    </div>
    <div class="text-lg md:text-lg font-semibold fblack text-center mt-4">
      {{ t('forward.importSummaryTitle', { economy: exportingEconomy, importing: importingEconomy }) }}
    </div>
    <div class="text-center">
      {{ t('forward.summaryDescription', { economy: exportingEconomy }) }}
    </div>

    <div class="flex flex-col md:flex-row mt-2 px-4 md:items-center">
      <div class="flex flex-col flex-1">
        <div
          class="border-1 border-[#1A425A] p-2 bg-[#F9E5FD] rounded-t-md md:h-auto md:min-h-[60px] md:flex md:flex-col md:justify-center"
        >
          <div class="text-[#BA15DB] font-semibold text-center">
            {{ t('forward.exportingEconomy') }}
          </div>
          <div class="flex items-center justify-center min-w-0">
            <div v-if="isShowFlagExport" class="shrink-0">
              <img :src="exportingIMG" alt="" class="h-4" />
            </div>
            <div class="px-2 font-semibold min-w-0 break-words text-center">
              {{ exportingEconomy }}
            </div>
          </div>
        </div>
        <div
          class="border-1 border-[#1A425A] p-2 bg-[#F9E5FD] rounded-b-md md:h-auto md:min-h-[60px] md:flex md:flex-col md:justify-center"
        >
          <div class="text-[#BA15DB] font-semibold text-center">
            {{ t('forward.exportingSector') }}
          </div>
          <div class="flex items-center justify-center min-w-0">
            <div class="shrink-0">
              <img :src="sectorIMG" alt="" class="h-5" />
            </div>
            <div class="px-2 font-semibold min-w-0 break-words text-center">
              {{ t('forward.allSectors') }}
            </div>
          </div>
        </div>
      </div>

      <div class="py-2 flex justify-center lt-sm">
        <img src="/images/downarrow.svg" alt="" class="h-8" />
      </div>
      <div class="gt-xs px-2">
        <img src="/images/rightarrow.svg" alt="" class="h-8" />
      </div>

      <div
        class="border-1 border-[#1A425A] p-2 bg-[#C9E2F4] rounded-md h-[60px] md:h-auto md:min-h-[60px] md:flex md:flex-col md:justify-center lg:h-[60px] flex-1"
      >
        <div class="text-[#005DAA] font-semibold text-center">
          {{ t('forward.importingEconomy') }}
        </div>
        <div class="flex items-center justify-center min-w-0">
          <div class="shrink-0">
            <img :src="importingIMG" alt="" class="h-5" />
          </div>
          <div class="px-2 font-semibold min-w-0 break-words text-center">
            {{ importingEconomy }}
          </div>
        </div>
      </div>

      <div class="py-2 flex justify-center lt-sm">
        <img src="/images/downarrow.svg" alt="" class="h-8" />
      </div>
      <div class="gt-xs px-2">
        <img src="/images/rightarrow.svg" alt="" class="h-8" />
      </div>

      <div
        class="border-1 border-[#1A425A] p-2 bg-[#bcfaea] rounded-md h-[60px] md:h-auto md:min-h-[60px] md:flex md:flex-col md:justify-center lg:h-[60px] flex-1"
      >
        <div class="text-[#018d4c] font-semibold text-center">
          {{ t('forward.thirdEconomy') }}
        </div>
        <div class="flex items-center justify-center min-w-0">
          <div class="shrink-0">
            <img src="/images/world.svg" alt="" class="h-5" />
          </div>
          <div class="px-2 font-semibold min-w-0 break-words text-center">
            {{ t('forward.world') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import axios from "axios";
import { serverSetup } from "../../pages/server";
import { useI18n } from 'vue-i18n';
import { translateEconomy } from "../../i18n/economies";

const { t, locale } = useI18n();

// ===== props / server =====
const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();

// ===== input from parent component =====
const exportData = props.inputData.exporting;
const importData = props.inputData.importing;
const sectorIMG = ref("");

//text variable
const exportingEconomy = computed(() => translateEconomy(exportData, locale.value));
const isShowFlagExport = ref(false);
const exportingIMG = ref("");

const importingEconomy = computed(() => translateEconomy(importData, locale.value));
const isShowFlagImport = ref(false);
const importingIMG = ref("");

const loadData = async () => {
  if (exportData.id != "0") {
    isShowFlagExport.value = true;
  } else {
    isShowFlagExport.value = false;
  }
  exportingIMG.value = `images/flags/${exportData.iso}.png`;

  if (importData.id != "0") {
    isShowFlagImport.value = true;
  } else {
    isShowFlagImport.value = false;
  }
  importingIMG.value = `images/flags/${importData.iso}.png`;

  sectorIMG.value = `images/sector/0/0.svg`;
};

loadData();
</script>

<style lang="scss" scoped></style>
