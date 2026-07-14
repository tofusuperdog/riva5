<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-lg font-bold fblack">{{ t('forward.topEconomiesYears') }}</div>
    <div class="border-b border-[#DDDDDD]"></div>
    <div
      v-if="isLoading"
      class="w-full min-h-[500px] flex items-center justify-center"
      aria-live="polite"
      aria-busy="true"
    >
      <div class="max-w-[520px] w-[92%] px-6 py-6 text-center">
        <div class="flex items-start justify-center gap-3 text-gray-700">
          <!-- SVG Spinner -->
          <svg
            class="animate-spin h-5 w-5 mt-0.5"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              fill="none"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"
            ></path>
          </svg>

          <div class="text-left">
            <div class="text-base font-semibold">
              {{ t('forward.preparing') }}
            </div>
            <div class="text-sm text-gray-600 mt-0.5">
              {{ t('forward.rendering') }}
            </div>
            <div class="text-xs text-gray-500 mt-3">
              {{ t('forward.patience') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row" v-show="!isLoading">
      <!-- กราฟหลัก -->
      <div class="w-full lg:w-[60%] flex justify-center pt-4">
        <div
          id="chartFSRange03"
          class="w-full max-w-[600px] min-h-[500px]"
        ></div>
      </div>
      <!-- ปุ่ม View more/less -->
      <div
        class="lg:hidden text-[#0672CB] cursor-pointer text-center font-semibold w-full mb-2"
        @click="showDetail = !showDetail"
      >
        {{ showDetail ? t('forward.viewLess') : t('forward.viewMore') }}
        <q-icon
          :name="showDetail ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        />
      </div>
      <!-- รายละเอียด -->
      <div
        class="p-4 pt-4 \w-full lg:w-[40%] flex items-center"
        v-show="showDetail && !isLoading"
      >
        <div v-for="r in desData" :key="r.econname" class="mb-4">
          <div class="flex items-center gap-2">
            <img :src="r.img" alt="" class="h-6 w-10" />
            <div :style="{ color: r.color }" class="text-lg font-semibold">
              {{ r.econname }}
            </div>
          </div>

          <div>{{ r.des }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import { serverSetup } from "../../pages/server";
import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n();

// ===== Props / Server / Screen =====
const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
const $q = useQuasar();

// ===== Basic state =====
const showDetail = ref($q.screen.gt.sm);
const isLoading = ref(true);

// ===== input from parent component =====
const exporting = ref(props.inputData.exporting);
const sector = ref(props.inputData.sector);
const yearStart = Number(props.inputData.yearStart);
const yearEnd = Number(props.inputData.yearEnd);

// ===== Data for calculation =====
const ecoList = ref([]);
const categories = ref([]);
const totalF = ref([]);
const seriesMain = ref([]);
const desData = ref([]);

const colorList = ["#36CAD2", "#FAAC36", "#D04F7A", "#2E9588", "#FF9AE0"];

// === Helper ===
const rangeYear = (s, e) => Array.from({ length: e - s + 1 }, (_, i) => s + i);

const loadEconomyList = async () => {
  const { data: economyList } = await axios.get(
    `${serverData.value}va/get_eco_not_group.php`,
  );
  ecoList.value = economyList;
};

const isoToName = (iso) => {
  let dataSelected = ecoList.value.find((item) => item.iso == iso);
  if (dataSelected) {
    return {
      name: dataSelected.economic,
      iso: dataSelected.iso,
      area: dataSelected.area,
    };
  } else {
    return 0;
  }
};

const moneyShort = (n) => {
  if (n == null || isNaN(n)) return "-";
  const abs = Math.abs(n);

  if (abs >= 1000) return `$${(n / 1000).toFixed(1)} ${t('forward.billion')}`;
  return `$${n.toFixed(1)} ${t('forward.million')}`;
};

// === Main function ===
const loadData = async () => {
  isLoading.value = true;
  categories.value = rangeYear(yearStart, yearEnd);
  let payload = {
    exp_country: exporting.value.iso,
    exp_sector: Number(sector.value.sectorID),
    year: rangeYear(yearStart, yearEnd),
  };

  let raw = await axios.post(
    `${serverData.value}va/forward_sector.php`,
    JSON.stringify(payload),
  );
  let rawData = raw.data;

  totalF.value = [];
  categories.value.forEach((year) => {
    let selectData = rawData.filter((d) => d.year == year)[0].totalvalue;
    totalF.value.push(Number(selectData));
  });

  let rawFinal = rawData
    .map((d) => {
      let cData;

      cData = isoToName(d.imp_country);

      if (cData != 0) {
        let cName = cData.name;
        let cISO = cData.iso;
        let cArea = cData.area;
        let year = d.year;
        let value = Number(d.value);

        let share = Number(
          ((d.value / totalF.value[year - yearStart]) * 100).toFixed(1),
        );
        return {
          name: cName,
          iso: cISO,
          area: cArea,
          year: year,
          value: value,
          share: share,
        };
      }
    })
    .filter(Boolean);

  let top5 = rawFinal
    .filter((d) => d.year == yearEnd)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((d) => d.iso);

  let rawDataTop5 = rawFinal.filter((d) => top5.includes(d.iso));
  top5.forEach((iso, i) => {
    let dataInside = [];
    categories.value.forEach((year) => {
      let selectData = rawDataTop5.filter(
        (d) => d.year == year && d.iso == iso,
      )[0];

      dataInside.push({
        y: Number(selectData.share),
        value: Number(selectData.value),
      });
    });
    seriesMain.value.push({
      name: isoToName(iso).name,
      data: dataInside,
      color: colorList[i],
    });
  });

  // console.log(top5);
  // console.log(rawDataTop5);
  isLoading.value = false;
  genDes(top5);
  plotGraph();
};

const plotGraph = () => {
  let title = t('forward.topDestinationTitle', { exporting: exporting.value.name, sector: sector.value.sectorShortName.toLowerCase() });
  let categoriesData = categories.value.map(String);
  let series = seriesMain.value;

  Highcharts.chart("chartFSRange03", {
    chart: { type: "spline", backgroundColor: "#fff" },
    title: {
      text: title,
      style: { fontSize: "24px", fontWeight: 600, color: "#333" },
    },
    xAxis: { categories: categoriesData, tickLength: 0 },
    yAxis: {
      min: 0,

      title: { text: t('forward.percentForward') },
      labels: {
        formatter() {
          return this.value + "%";
        },
      },
      gridLineColor: "#eee",
    },
    legend: { align: "center", verticalAlign: "bottom" },
    tooltip: {
      useHTML: true,
      borderRadius: 6,
      formatter() {
        const i = this.point.index ?? this.point.x ?? 0;
        const year = categoriesData[i]; // ปีจากแกน X
        const share = this.y ?? this.point.y ?? 0; // ค่า % จากแกน Y
        // คุณ push point แบบ { y: sharePer, value: sumData }
        const valueRaw = this.point.value ?? this.point.options?.value ?? null;

        return `
          <div style="min-width:220px">
            <div style="font-weight:700">${this.series.name}</div>
            <div>${t('forward.year')}: ${year}</div>
            <div>${t('forward.share')}:&nbsp; ${share.toFixed(1)}% ${t('forward.ofForward')}</div>
               <div>${t('forward.value')}:&nbsp; ${moneyShort(Number(valueRaw))}</div>
          </div>
        `;
      },
    },

    plotOptions: {
      series: { lineWidth: 3, states: { hover: { lineWidth: 3 } } },
    },
    credits: { enabled: false },
    series,
  });
};

const genDes = (top5) => {
  desData.value = [];
  for (let i = 0; i < 5; i++) {
    let lasty = seriesMain.value[i].data[seriesMain.value[i].data.length - 1].y;
    let firsty = seriesMain.value[i].data[0].y;
    let diff = lasty - firsty;
    let textdiff = t('backward.charts.unchanged');
    if (diff < 0) {
      textdiff = t('backward.charts.downBy', { value: Math.abs(diff).toFixed(1) });
    } else if (diff > 0) {
      textdiff = t('backward.charts.upBy', { value: Math.abs(diff).toFixed(1) });
    }
    desData.value.push({
      econname: seriesMain.value[i].name,
      color: colorList[i],
      img: `/images/flags/${top5[i]}.png`,
      des: t('forward.destinationYearDescription', { share: lasty, exporting: exporting.value.name, sector: sector.value.sectorShortName.toLowerCase(), destination: seriesMain.value[i].name, change: textdiff, start: yearStart }),
    });
  }
};
// sync showDetail กับขนาดจอ
watch(
  () => $q.screen.gt.sm,
  (isLarge) => (showDetail.value = isLarge),
);

onMounted(async () => {
  await loadEconomyList();
  await loadData();
});
watch(locale, () => loadData());
</script>

<style lang="scss" scoped></style>
