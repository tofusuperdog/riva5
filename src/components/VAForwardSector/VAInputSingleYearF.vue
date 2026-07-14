<template>
  <div class="my-6">
    <div
      class="h-45 md:h-35 w-full bg-[linear-gradient(to_top_left,_#1B81C1,_#1A425A)] text-white flex items-center justify-center"
    >
      <div class="flex flex-col md:flex-row items-center justify-center">
        <div class="py-2">
          <div class="text-xl md:text-2xl text-semibold">
            {{ t('forward.byYear') }}
          </div>
          <div class="text-sm">
            {{ t('forward.exploreYear') }}
          </div>
        </div>
        <div class="px-6">
          <div class="w-[200px] md:w-[150px]">
            <div style="height: 90px">
              <div style="font-size: 14px" class="text-white">{{ t('forward.year') }}</div>
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
import { useI18n } from 'vue-i18n';
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
const exporting = ref(props.inputData.exporting);
// 📢 Emit
const emit = defineEmits(["updateInputSingleYear"]);

const onUpdateYear = (year) => {
  emit("updateInputSingleYear", year);
};

const loadData = async () => {
  const payLoad = {
    exp_country: exporting.value.iso,
  };

  const url = serverData.value + "va/check_year_available.php";
  let res = await axios.post(url, JSON.stringify(payLoad));
  let yearRange = res.data;
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
