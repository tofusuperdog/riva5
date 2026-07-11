<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto relative z-100 bg-[#FFFFFF] border-1 border-[#DDDDDD] rounded-md p-2 md:p-4 mt-2 md:mt-4"
  >
    <div class="text-md md:text-lg font-semibold fblack">
      Key policy questions (select by source economy)
    </div>
    <div class="fsub">
      <ul class="list-disc pl-6">
        <li>
          How is foreign value-added distributed across {{ exportingEconomy }}'s
          exporting sectors?
        </li>
        <li>How does this compare across economies in the same region?</li>
      </ul>
    </div>
    <div class="text-lg md:text-lg font-semibold fblack text-center mt-4">
      Where does {{ exportingEconomy }}'s imported content come from?
    </div>
    <div class="text-center">
      Some part of {{ exportingEconomy }}'s gross exports consist of imported
      inputs that originate in other source economies.
    </div>

    <div class="flex flex-col md:flex-row mt-2 px-4 md:items-center">
      <div
        class="border-1 border-[#1A425A] p-2 bg-[#C9E2F4] rounded-md h-[60px] flex-1"
      >
        <div class="text-[#005DAA] font-semibold text-center">
          Source economy
        </div>
        <div class="flex items-center justify-center">
          <div v-if="isShowFlagSource">
            <img :src="sourceIMG" alt="" class="h-4" />
          </div>
          <div class="px-2 font-semibold">{{ sourceEconomy }}</div>
        </div>
      </div>

      <div class="py-2 flex justify-center lt-sm">
        <img src="/images/downarrow.svg" alt="" class="h-8" />
      </div>
      <div class="gt-xs px-2">
        <img src="/images/rightarrow.svg" alt="" class="h-8" />
      </div>

      <div class="flex flex-col flex-1">
        <div class="border-1 border-[#1A425A] p-2 bg-[#F9E5FD] rounded-t-md">
          <div class="text-[#BA15DB] font-semibold text-center">
            Exporting economy
          </div>
          <div class="flex items-center justify-center">
            <div v-if="isShowFlagExport">
              <img :src="exportingIMG" alt="" class="h-4" />
            </div>
            <div class="px-2 font-semibold">{{ exportingEconomy }}</div>
          </div>
        </div>
        <div class="border-1 border-[#1A425A] p-2 bg-[#F9E5FD] rounded-b-md">
          <div class="text-[#BA15DB] font-semibold text-center">
            Exporting sector
          </div>
          <div class="flex items-center justify-center">
            <div><img :src="sectorIMG" alt="" class="h-5" /></div>
            <div class="px-2 font-semibold">{{ sectorName }}</div>
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
        class="border-1 border-[#1A425A] p-2 bg-[#C9E2F4] rounded-md h-[60px] flex-1"
      >
        <div class="text-[#005DAA] font-semibold text-center">
          Importing economy
        </div>
        <div class="flex items-center justify-center">
          <div v-if="isShowFlagImport">
            <img :src="importingIMG" alt="" class="h-4" />
          </div>
          <div class="px-2 font-semibold">{{ importingEconomy }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { serverSetup } from "../../pages/server";

// ===== props / server =====
const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();

// ===== input from parent component =====
const exportData = props.inputData.exporting;
const importData = props.inputData.importing;
const sourceData = props.inputData.source;

//text variable
const exportingEconomy = ref("");
const isShowFlagExport = ref(false);
const exportingIMG = ref("");

const importingEconomy = ref("");
const isShowFlagImport = ref(false);
const importingIMG = ref("");

const sourceEconomy = ref("");
const isShowFlagSource = ref(false);
const sourceIMG = ref("");

const sectorName = ref("");
const sectorIMG = ref("");

const loadData = async () => {
  if (exportData.id != "0") {
    isShowFlagExport.value = true;
  } else {
    isShowFlagExport.value = false;
  }
  exportingEconomy.value = exportData.name;
  exportingIMG.value = `images/flags/${exportData.iso}.png`;

  if (importData.id != "0") {
    isShowFlagImport.value = true;
  } else {
    isShowFlagImport.value = false;
  }
  importingEconomy.value = importData.name;
  importingIMG.value = `images/flags/${importData.iso}.png`;

  if (sourceData.id != "0") {
    isShowFlagSource.value = true;
  } else {
    isShowFlagSource.value = false;
  }
  sourceEconomy.value = sourceData.name;
  sourceIMG.value = `images/flags/${sourceData.iso}.png`;

  sectorName.value = "All sectors";
  sectorIMG.value = `images/sector/0/0.svg`;
};

onMounted(loadData);
</script>

<style lang="scss" scoped></style>
