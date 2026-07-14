<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto relative z-100 border-1 bg-white border-[#DDDDDD] rounded-md mt-2 md:mt-4 pb-2 md:pb-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-left pl-4 text-lg text-bold fblack">
      {{ t('gvc.acrossYears') }}
    </div>
    <div class="h-1 border-b-1 border-b-[#DDDDDD]"></div>

    <div class="flex flex-col lg:flex-row">
      <!-- กราฟหลัก -->
      <div class="w-full lg:w-[60%] flex items-center justify-center pt-4">
        <div id="chartGVCRange01" class="w-full max-w-[600px]"></div>
      </div>

      <!-- ปุ่ม View more/less -->
      <div
        class="lg:hidden text-[#0672CB] cursor-pointer text-center font-semibold w-full"
        @click="showDetail = !showDetail"
      >
        {{ showDetail ? t('gvc.viewLess') : t('gvc.viewMore') }}
        <q-icon
          :name="showDetail ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        />
      </div>
      <!-- รายละเอียด -->
      <div
        class="p-4 pt-4 w-full lg:w-[40%] flex items-center"
        v-show="showDetail"
      >
        <div>
          <div class="flex items-center">
            <div><img src="/images/vaBackwardG.svg" /></div>
            <div class="backwardC text-2xl pl-2 font-medium">
              {{ t('gvc.backward') }}
            </div>
          </div>
          <div class="backwardC">
            {{ t('gvc.fvaExports', { economy: countryName }) }}
          </div>
          <div class="fsub">
            {{ desBackward }}
          </div>
          <div class="flex items-center pt-4">
            <div><img src="/images/vaForwardG.svg" /></div>
            <div class="forwardC text-2xl pl-2 font-medium">
              {{ t('gvc.forward') }}
            </div>
          </div>
          <div class="forwardC">
            {{ t('gvc.dvaExports', { economy: countryName }) }}
          </div>
          <div class="fsub">
            {{ desForward }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import { useI18n } from "vue-i18n";
import { translateEconomy } from "../../i18n/economies";

import { serverSetup } from "../../pages/server";

// Props
const props = defineProps({
  inputData: Object,
});

// Quasar screen-helper
const $q = useQuasar();
const { t, locale } = useI18n({ useScope: "global" });

// ข้อมูลเซิร์ฟเวอร์
const { serverData } = serverSetup();

// เก็บชื่อประเทศ / ปี
const countryName = computed(() =>
  translateEconomy(props.inputData.exporting, locale.value)
);
const yearStart = ref(props.inputData.yearStart);
const yearEnd = ref(props.inputData.yearEnd);

// ควบคุมว่า “View more/less” ต้องแสดงหรือไม่
// – เริ่มต้นเปิด (true) เมื่อเป็นหน้าจอใหญ่ (tablet ขึ้นไป)
// – ถ้าเปลี่ยนขนาดหน้าจอ ค่าก็จะสลับให้อัตโนมัติ
const showDetail = ref($q.screen.gt.sm);

// ข้อมูลที่ใช้ในการแสดงกราฟ
const graphYear = ref([]);
const graphBackward = ref([]);
const graphForward = ref([]);

//ข้อมูลที่ใช้ในการแสดงคำอธิบาย
const desBackward = ref("");
const desForward = ref("");

//helper
function formatValue(num) {
  const n = Number(num);
  if (n < 1000) {
    return `$${n.toFixed(1)} ${t('gvc.million')}`;
  } else {
    return `$${(n / 1000).toFixed(1)} ${t('gvc.billion')}`;
  }
}

//สร้าง Series สำหรับกราฟ
function buildSeries(data) {
  const categories = [...new Set(data.map((d) => d.year))].sort(
    (a, b) => a - b
  );

  const getSeries = (name) => {
    return categories.map((y) => {
      const row = data.find((d) => d.year === y && d.var === name);
      return row
        ? {
            y: Number(row.share) * 100, // ใช้ share (%) สำหรับแกน Y // ใช้ share (%) สำหรับแกน Y
            year: row.year,
            share: Number(row.share),
            value: Number(row.value),
          }
        : null;
    });
  };

  return {
    categories,
    backward: getSeries("Backward linkages"),
    forward: getSeries("Forward linkages"),
  };
}

//get Raw data from Database
const getRawResult = async () => {
  graphYear.value = [];

  let yearRange = [];
  for (let i = Number(yearStart.value); i <= Number(yearEnd.value); i++) {
    yearRange.push(i);
  }

  const dataSend = {
    exp_country: props.inputData.exporting.iso,
    year: yearRange,
  };

  let url = `${serverData.value}va/gvc_overview_across_years.php`;
  const res = await axios.post(url, JSON.stringify(dataSend));
  const { categories, backward, forward } = buildSeries(res.data);
  graphYear.value = categories;
  graphBackward.value = backward;
  graphForward.value = forward;
  plotGraph();
  desGraph();
};

// plot graph
const plotGraph = () => {
  let chartTitle = t('gvc.chartYearsTitle', { economy: countryName.value });
  let chart = null;
  chart = Highcharts.chart("chartGVCRange01", {
    chart: {
      type: "spline",
    },
    title: {
      text: chartTitle,
    },
    xAxis: {
      categories: graphYear.value, // ✅ ใช้ object + categories
      tickLength: 0,
      gridLineWidth: 0,
    },
    yAxis: {
      title: { text: t('gvc.percentGross', { economy: countryName.value }) },
      labels: { format: "{value}%" },
    },
    tooltip: {
      useHTML: true,
      formatter: function () {
        let displayValue, unit;
        if (this.point.value < 1000) {
          // แสดงเป็น million
          displayValue = this.point.value.toFixed(1);
          unit = t('gvc.million');
        } else {
          // แสดงเป็น billion
          displayValue = (this.point.value / 1000).toFixed(1);
          unit = t('gvc.billion');
        }

        return `
      <b>${this.series.name}</b><br/>
      ${t('gvc.year')}: ${this.point.year}<br/>
      ${t('gvc.share')}: ${(this.point.share * 100).toFixed(1)}% ${t('gvc.ofGross')}<br/>
      ${t('gvc.value')}: $${displayValue} ${unit}
    `;
      },
    },
    plotOptions: {
      series: {
        marker: { enabled: true },
      },
    },
    colors: ["#2ecc71", "#3498db"],
    series: [
      { name: t('gvc.backward'), data: graphBackward.value },
      { name: t('gvc.forward'), data: graphForward.value },
    ],
    credits: { enabled: false },
  });
};

const desGraph = () => {
  const firstYear = graphYear.value[0];
  const lastYear = graphYear.value[graphYear.value.length - 1];

  const lastBackward = graphBackward.value[graphBackward.value.length - 1];
  const prevBackward = graphBackward.value[0];
  const shareNowB = Number((lastBackward.share * 100).toFixed(1));
  const sharePrevB = Number((prevBackward.share * 100).toFixed(1));
  const directionB = t(shareNowB > sharePrevB ? 'gvc.increased' : 'gvc.decreased');

  desBackward.value = t('gvc.backwardYearDescription', { lastYear, current: shareNowB, economy: countryName.value, direction: directionB, previous: sharePrevB, firstYear });

  const lastForward = graphForward.value[graphForward.value.length - 1];
  const prevForward = graphForward.value[0];
  const shareNowF = Number((lastForward.share * 100).toFixed(1));
  const sharePrevF = Number((prevForward.share * 100).toFixed(1));
  const directionF = t(shareNowF > sharePrevF ? 'gvc.increased' : 'gvc.decreased');

  desForward.value = t('gvc.forwardYearDescription', { lastYear, economy: countryName.value, current: shareNowF, direction: directionF, previous: sharePrevF, firstYear });
};

// อัปเดตอัตโนมัติเมื่อขนาดจอเปลี่ยน
watch(
  () => $q.screen.gt.sm,
  (isLarge) => {
    showDetail.value = isLarge;
  }
);

onMounted(() => {
  getRawResult();
});
</script>

<style lang="scss" scoped></style>
