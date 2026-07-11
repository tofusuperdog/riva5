<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-lg font-bold fblack">
      Top exporting sector across years
    </div>
    <div class="border-b border-[#DDDDDD]"></div>
    <div
      v-if="!isAvail"
      class="w-full min-h-[400px] flex items-center justify-center"
      aria-live="polite"
      aria-busy="true"
    >
      <div class="max-w-[520px] w-[92%] px-6 py-6 text-center">
        <div class="flex items-start justify-center gap-3 text-gray-700">
          <div class="text-left">
            <div class="text-center q-mb-sm">
              <q-icon name="fa-solid fa-circle-info" size="lg" />
            </div>
            <div class="text-base font-semibold">
              No trade occurred under the selected settings
            </div>
            <div class="text-sm text-gray-600 mt-0.5 text-center">
              Try a different year range or economy selection.
            </div>
          </div>
        </div>
      </div>
    </div>
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
              Preparing the visualization
            </div>
            <div class="text-sm text-gray-600 mt-0.5">
              Rendering the chart and finalizing the display.
            </div>
            <div class="text-xs text-gray-500 mt-3">
              Thank you for your patience.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row" v-show="!isLoading && isAvail">
      <!-- กราฟหลัก -->
      <div
        class="w-full lg:w-[60%] flex items-center justify-center pt-4"
        v-show="!isLoading"
      >
        <div
          id="chartBSRangeS01"
          class="w-full max-w-[600px] min-h-[500px]"
        ></div>
      </div>
      <!-- ปุ่ม View more/less -->
      <div
        class="lg:hidden text-[#0672CB] cursor-pointer text-center font-semibold w-full mb-2"
        @click="showDetail = !showDetail"
      >
        {{ showDetail ? "View less" : "View more" }}
        <q-icon
          :name="showDetail ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        />
      </div>
      <!-- รายละเอียด -->
      <div
        class="p-4 pt-4 w-full lg:w-[40%] flex items-center"
        v-show="showDetail && !isLoading"
      >
        <div>
          <div v-for="d in desData" :key="d.sectorName">
            <div class="flex pt-2">
              <div><img :src="d.img" alt="" class="h-7" /></div>
              <div
                class="text-lg font-semibold pl-2"
                :style="{ color: d.color }"
              >
                {{ d.sectorName }}
              </div>
            </div>
            <div class="fsub">{{ d.des }}</div>
          </div>
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

// ===== Props / Server / Screen =====
const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
const $q = useQuasar();

// ===== Basic state =====
const showDetail = ref($q.screen.gt.sm);

// ===== input from parent component =====
const exporting = ref(props.inputData.exporting);
const importing = ref(props.inputData.importing);
const source = ref(props.inputData.source);
const yearStart = ref(Number(props.inputData.yearStart));
const yearEnd = ref(Number(props.inputData.yearEnd));

const isLoading = ref(true);
const isAvail = ref(true);

// ===== Data Variables =====
const colorCode = ["#9467BD", "#1F77B4", "#2CA02C", "#FF813D", "#FF9AE0"];
const totalBack = ref([]);
const sectorList = ref([]);
const yearRange = ref([]);
const rawData = ref([]);
const top5SectorID = ref([]);
const top5SectorName = ref([]);
const series = ref([]);
const desData = ref([]);

// *******Helper*********

const buildYearRange = (s, e) =>
  Array.from({ length: e - s + 1 }, (_, i) => s + i);

const sectorIDToName = (id) => {
  let res = sectorList.value.filter((d) => Number(d.catID) == Number(id));
  return res[0].shortname;
};

const shareNum = (num) => Number((Number(num) * 100).toFixed(1));

// const genDataGraph = (id) => {
//   let res = rawData.value.filter((d) => Number(d.exp_sector) == Number(id));
//   let dataOutput = res.map((d, i) => {
//     return {
//       year: d.year,
//       value: Number(d.value),
//       y: shareNum(Number(d.value) / totalBack.value[i]),
//     };
//   });
//   return dataOutput;
// };

const genDataGraph = (id) => {
  const start = Number(yearStart.value);
  const end = Number(yearEnd.value);

  // 1) Filter เฉพาะ sector ที่ต้องการ
  const res = rawData.value.filter((d) => Number(d.exp_sector) === Number(id));

  // 2) ทำ Map ตาม year ไว้ก่อน เพื่อเช็คปีที่มี/ไม่มีได้ง่าย
  const byYear = new Map();

  res.forEach((d) => {
    const year = Number(d.year);
    const val = Number(d.value) || 0;

    // หา index ของปีนี้ใน totalBack (อิงจากช่วง start..end)
    const idx = year - start;
    const denom = Number(totalBack.value?.[idx]) || 0;

    const y = denom > 0 ? shareNum(val / denom) : 0;

    byYear.set(year, {
      year,
      value: val,
      y,
    });
  });

  // 3) เติมปีที่ขาดในช่วง start..end
  const dataOutput = [];
  for (let year = start; year <= end; year += 1) {
    if (byYear.has(year)) {
      dataOutput.push(byYear.get(year));
    } else {
      dataOutput.push({ year, value: 0, y: 0 });
    }
  }

  return dataOutput;
};

// ช่วยฟอร์แมทเงิน
function moneyFmt(n) {
  return `$${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} million`;
}

const loadSector = async () => {
  let res = await axios.get(`${serverData.value}va/get_sector.php`);

  sectorList.value = res.data;
};

const loadData = async () => {
  isLoading.value = true;
  yearRange.value = buildYearRange(yearStart.value, yearEnd.value);
  let payload = {
    exp_country: exporting.value.iso,
    imp_country: importing.value.iso,
    source_country: source.value.iso,
    year: yearRange.value,
  };

  let { data: raw } = await axios.post(
    `${serverData.value}va/back_sector.php`,
    JSON.stringify(payload)
  );

  raw = raw.filter((x) => Number(x.value) > 0);
  if (raw.length === 0) {
    isAvail.value = false;
    isLoading.value = false;
    return;
  } else {
    isAvail.value = true;
  }

  totalBack.value = raw
    .filter((d) => Number(d.exp_sector) == 0)
    .sort((a, b) => Number(a.year) - Number(b.year))
    .map((d) => Number(d.value));
  rawData.value = raw.filter((d) => Number(d.exp_sector) != 0);

  let last5Data = rawData.value
    .filter((d) => Number(d.year) === yearEnd.value)
    .sort((a, b) => Number(b.value) - Number(a.value))
    .slice(0, 5);

  top5SectorID.value = last5Data.map((d) => d.exp_sector);
  top5SectorName.value = last5Data.map((d) => sectorIDToName(d.exp_sector));
  series.value = [];
  top5SectorID.value.forEach((d, i) => {
    let dataInput = {
      name: sectorIDToName(d),
      color: colorCode[i],
      data: genDataGraph(d),
    };
    series.value.push(dataInput);
  });

  isLoading.value = false;
  drawChart();
  genDes();
};

const drawChart = () => {
  let title = `In which exporting sectors is ${source.value.name}'s value added content most embedded in ${exporting.value.name}'s exports to ${importing.value.name}?`;

  Highcharts.chart("chartBSRangeS01", {
    chart: { type: "spline", backgroundColor: "#fff" },
    title: {
      text: title,
      style: { fontSize: "24px", fontWeight: 600, color: "#333" },
    },
    xAxis: {
      categories: yearRange.value,
      tickLength: 0,
      labels: { style: { color: "#555" } },
    },
    yAxis: {
      min: 0,
      title: { text: "Percent of Backward Linkages" },
      gridLineColor: "#eee",
      labels: {
        formatter() {
          return this.value + "%";
        },
      },
    },
    plotOptions: {
      series: {
        lineWidth: 3,
        marker: { enabled: true, radius: 4 },
        states: { hover: { lineWidthPlus: 0 } },
      },
    },
    tooltip: {
      useHTML: true,
      formatter() {
        const p = this.point;
        return `<b>${p.series.name}</b><br/>
        Year: ${p.year}<br/>
        Share: ${p.y}% of backward linkages<br/>
        Value: ${moneyFmt(p.value)}`;
      },
    },
    legend: { align: "center", verticalAlign: "bottom" },
    credits: { enabled: false },
    series: series.value,
  });
};

const genDes = () => {
  desData.value = [];
  for (let i = 0; i < 5; i++) {
    let sectorName = top5SectorName.value[i];
    let sectorImg = `/images/sector/${i + 1}/${top5SectorID.value[i]}.svg`;
    let lasty = series.value[i].data[series.value[i].data.length - 1].y;
    let firsty = series.value[i].data[0].y;
    let diff = lasty - firsty;
    let textdiff = "unchanged";
    if (diff < 0) {
      textdiff = "down by " + Math.abs(diff).toFixed(1) + " percentage points";
    } else if (diff > 0) {
      textdiff = "up by " + Math.abs(diff).toFixed(1) + " percentage points";
    }
    desData.value.push({
      sectorName: sectorName,
      color: colorCode[i],
      img: sectorImg,
      des: `${lasty}% of ${
        source.value.name
      }'s value added content embedded in ${
        exporting.value.name
      }'s exports to ${
        importing.value.name
      } is exported via the ${sectorName.toLowerCase()} sector, ${textdiff} since  ${
        yearStart.value
      }.`,
    });
  }
};

// sync showDetail กับขนาดจอ
watch(
  () => $q.screen.gt.sm,
  (isLarge) => (showDetail.value = isLarge)
);

onMounted(async () => {
  await loadSector();
  await loadData();
});
</script>

<style lang="scss" scoped></style>
