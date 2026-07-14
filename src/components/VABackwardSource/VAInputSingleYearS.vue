<template>
  <div class="my-6">
    <div
      class="h-45 md:h-35 w-full bg-[linear-gradient(to_top_left,_#1B81C1,_#1A425A)] text-white flex items-center justify-center"
    >
      <div class="flex flex-col md:flex-row items-center justify-center">
        <div class="py-2">
          <div class="text-xl md:text-2xl text-semibold">
            {{ t("backward.charts.byYear") }}
          </div>
          <div class="text-sm">
            {{ t("backward.exploreYear") }}
          </div>
        </div>
        <div class="px-6">
          <div class="w-[200px] md:w-[150px]">
            <div style="height: 90px">
              <div style="font-size: 14px" class="text-white">{{ t("backward.year") }}</div>
              <div class="q-pt-xs">
                <q-select
                  v-model="yearEnd"
                  :options="yearList"
                  filled
                  @update:model-value="onUpdateYear"
                  dark
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { serverSetup } from "../../pages/server";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// 📌 Connection Database Server Info
const { serverData } = serverSetup();
const yearList = ref([2017, 2018]);
// Props
const props = defineProps({
  inputData: Object,
});

// ปี
const yearEnd = ref(props.inputData.yearEnd);
const exporting = ref(props.inputData.exporting.iso);
const importing = ref(props.inputData.importing.iso);
const source = ref(props.inputData.source.iso);
// 📢 Emit
const emit = defineEmits(["updateInputSingleYear"]);

const onUpdateYear = (year) => {
  emit("updateInputSingleYear", year);
};

const loadData = async () => {
  const payLoad = {
    exp_country: exporting.value,
  };

  const url = serverData.value + "va/check_year_available.php";
  let res = await axios.post(url, JSON.stringify(payLoad));

  //Check for importing
  const payLoad2 = {
    exp_country: importing.value,
  };
  let res2 = await axios.post(url, JSON.stringify(payLoad2));

  // check for source
  const payLoad3 = {
    exp_country: source.value,
  };
  let res3 = await axios.post(url, JSON.stringify(payLoad3));

  let yearRangeExp = res.data;
  let yearRangeImp = res2.data;
  let yearRangeSrc = res3.data;
  const start = Math.max(yearRangeExp[0], yearRangeImp[0], yearRangeSrc[0]);
  const end = Math.min(yearRangeExp[1], yearRangeImp[1], yearRangeSrc[1]);
  let yearRange = [start, end];

  yearList.value = [];
  for (let y = yearRange[0]; y <= yearRange[1]; y++) {
    yearList.value.push(y);
  }
  onUpdateYear(yearEnd.value);
};

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped></style>
