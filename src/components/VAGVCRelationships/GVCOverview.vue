<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto relative z-100 border-1 bg-white border-[#DDDDDD] rounded-md mt-2 md:mt-4 pb-2 md:pb-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-left pl-4 text-lg text-bold fblack">GVC overview</div>
    <div class="h-1 border-b-1 border-b-[#DDDDDD]"></div>
    <div class="px-2 pt-3 text-lg font-semibold text-center">
      {{ countryName }}'s Gross Exports: Backward vs Forward Linkages ({{
        year
      }})
    </div>
    <div class="flex flex-col lg:flex-row pt-4 justify-center">
      <!-- backward -->
      <div>
        <div class="flex justify-center h-[120px] items-center">
          <img
            src="/images/greenContainer.svg"
            alt=""
            :style="{ height: BHeight + 'px', width: 'auto' }"
          />
        </div>
        <div class="flex justify-center pt-2 pb-1 items-center">
          <div><img src="/images/vaBackwardG.svg" alt="" /></div>
          <div class="backwardC pl-1 text-lg pt-1">Backward Linkages</div>
        </div>
        <div class="px-2 text-center max-w-[400px] mx-auto fsub">
          {{ backwardText }}
        </div>
      </div>
      <!-- Link mobile tablet-->
      <div class="lt-md py-2">
        <div class="flex justify-center">
          <img src="/images/dotGreenVer.svg" alt="" />
        </div>
        <div class="flex justify-center pb-2 pt-4" v-show="showFlag">
          <img :src="imgFile" alt="" class="w-[150px] border" />
        </div>
        <div class="flex justify-center text-lg pb-3 font-semibold">
          {{ countryName }}
        </div>
        <div class="flex justify-center">
          <img src="/images/dotBlueVer.svg" alt="" />
        </div>
      </div>
      <!-- Link pc-->
      <div class="gt-sm py-2">
        <div class="flex items-center">
          <div class="flex justify-center">
            <img src="/images/dotGreenHor.svg" alt="" />
          </div>
          <div class="px-6">
            <div class="flex justify-center pb-2 pt-4">
              <img :src="imgFile" alt="" class="w-[100px]" />
            </div>
          </div>
          <div class="flex justify-center">
            <img src="/images/dotBlueHor.svg" alt="" />
          </div>
        </div>
        <div class="flex justify-center text-lg pb-3 font-semibold">
          {{ countryName }}
        </div>
      </div>
      <!-- forward -->
      <div>
        <div class="flex justify-center h-[120px] items-center">
          <img
            src="/images/blueContainer.svg"
            alt=""
            :style="{ height: FHeight + 'px', width: 'auto' }"
          />
        </div>
        <div class="flex justify-center pt-2 pb-1 items-center">
          <div><img src="/images/vaForwardG.svg" alt="" /></div>
          <div class="forwardC pl-1 text-lg pt-1">Forward Linkages</div>
        </div>
        <div class="px-2 text-center max-w-[400px] mx-auto fsub">
          {{ forwardText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import axios from "axios";
import { serverSetup } from "../../pages/server";

const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();

// ทำให้ reactive กับการเปลี่ยน props เสมอ
const countryName = computed(() => props.inputData?.exporting?.name ?? "");
const year = computed(() => Number(props.inputData?.year) || null);

const backwardText = ref("");
const forwardText = ref("");
const imgFile = ref("");
const showFlag = ref(false);
const BHeight = ref(0);
const FHeight = ref(0);

// ล้าน → พันล้าน (ทศนิยม 1 ตำแหน่ง)
const B = (m) => Number((Number(m || 0) / 1000).toFixed(1));

async function loadAndRender() {
  // กัน null/undefined
  const iso = props.inputData?.exporting?.iso;
  if (!iso || !year.value) return;

  const url = `${serverData.value}/va/gvc_overview.php`;
  const payload = { exp_country: iso, year: year.value };
  const rows = (await axios.post(url, JSON.stringify(payload))).data ?? [];

  let BValue = 0;
  let FValue = 0;

  // Backward
  const back = rows.find((x) => x.var === "Backward linkages");
  if (back) {
    const share = (Number(back.share) * 100).toFixed(1);
    const valM = Number(back.value);
    BValue = valM;
    const valT =
      valM > 1000 ? `${B(valM)} billion` : `${valM.toFixed(1)} million`;
    backwardText.value = `Backward linkages refer to the use of foreign Value added (FVA) - value added produced abroad - in  ${countryName.value}'s exports. In ${year.value}, FVA accounted for ${share}% of ${countryName.value}'s gross exports, valued at USD ${valT}.`;
  } else {
    backwardText.value = "";
  }

  // Forward
  const fwd = rows.find((x) => x.var === "Forward linkages");
  if (fwd) {
    const share = (Number(fwd.share) * 100).toFixed(1);
    const valM = Number(fwd.value);
    FValue = valM;
    const valT =
      valM > 1000 ? `${B(valM)} billion` : `${valM.toFixed(1)} million`;
    forwardText.value = `Forward linkages represent ${countryName.value}'s Domestic Value Added (DVA) that is subsequently embedded in the gross exports of partner economies. In ${year.value}, forward linkages made up ${share}% of ${countryName.value}'s gross exports, equivalent to USD ${valT}.`;
  } else {
    forwardText.value = "";
  }
  if (
    props.inputData.exporting.id == 0 ||
    props.inputData.exporting.iso == "TWN" ||
    props.inputData.exporting.iso == "HKG"
  ) {
    imgFile.value = "/images/flags/noflag.png";
    showFlag.value = false;
  } else {
    imgFile.value = `/images/flags/${props.inputData.exporting.iso}.png`;
    showFlag.value = true;
  }

  //container size
  if (BValue > FValue) {
    BHeight.value = 120;
    FHeight.value = Math.floor((FValue / BValue) * 120);
  } else {
    FHeight.value = 120;
    BHeight.value = Math.floor((BValue / FValue) * 120);
  }
  if (BHeight.value < 50) BHeight.value = 40;
  if (FHeight.value < 50) FHeight.value = 50;
}

// 🔁 รีโหลดทุกครั้งที่ประเทศหรือปีเปลี่ยน + ครั้งแรกทันที
watch(
  [() => props.inputData?.exporting?.iso, () => props.inputData?.year],
  () => {
    loadAndRender();
  },
  { immediate: true }
);
</script>

<style scoped></style>
