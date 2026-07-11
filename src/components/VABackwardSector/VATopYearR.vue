<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-lg font-bold fblack">
      Top source economy across years
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
              Try a different year range, sector, or economy pair.
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="isLoading"
      class="w-full min-h-[400px] flex items-center justify-center"
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
        <div id="chartBSRange03" class="w-full max-w-[600px]"></div>
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
        class="p-4 pt-4 w-full lg:w-[40%] flex items-center fsub"
        v-show="showDetail"
      >
        <div>
          <div v-for="d in desData" :key="d.key">
            <div class="flex">
              <div><img :src="d.img" alt="" class="h-6 w-10" /></div>
              <div
                class="pl-2 text-lg font-semibold"
                :style="{ color: d.color }"
              >
                {{ d.econname }}
              </div>
            </div>
            <div class="pt-1 pb-3">{{ d.des }}</div>
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
// ถ้าไม่ได้โหลด Highcharts แบบ global ให้ import ด้วย
// import Highcharts from "highcharts";

const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
const $q = useQuasar();

const showDetail = ref($q.screen.gt.sm);

const exporting = ref(props.inputData.exporting);
const importing = ref(props.inputData.importing);
const sector = ref(props.inputData.sector);
const yearStart = ref(Number(props.inputData.yearStart));
const yearEnd = ref(Number(props.inputData.yearEnd));

const colorGraph = ["#36CAD2", "#FAAC36", "#D04F7A", "#2E9588", "#A02B93"];
const isLoading = ref(true);
const isAvail = ref(true);

const buildYearRange = (s, e) =>
  Array.from({ length: e - s + 1 }, (_, i) => s + i);

//===== input for Graph =====>
const categories = ref(buildYearRange(yearStart.value, yearEnd.value));
const series = ref([]);
const desData = ref([]);
const lastISO = ref([]);

const shareNum = (num) => Number((Number(num) * 100).toFixed(1)); // 0–1 -> %
const valueNum = (num) => Number(Number(num).toFixed(1));
const money = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} million`;

function genSeries(iso, rawData, index) {
  const start = Number(yearStart.value);
  const end = Number(yearEnd.value);

  // 1) filter + sort
  const filterISO = rawData
    .filter((d) => d.source_country === iso)
    .sort((a, b) => Number(a.year) - Number(b.year));

  if (!filterISO.length) return null;

  // 2) ใช้ record แรกเป็นตัวอ้างอิง field ที่เหมือนกันทุกปี
  const base = filterISO[0];
  const economic = base.economic || iso;
  const area = base.area || "";
  const source_country = base.source_country || iso;

  // 3) ทำ map ตามปี เพื่อเช็คปีที่มีอยู่แล้ว
  const byYear = new Map(filterISO.map((d) => [Number(d.year), d]));

  // 4) เติมปีที่ขาด
  const completed = [];
  for (let y = start; y <= end; y += 1) {
    const existing = byYear.get(y);
    if (existing) {
      completed.push(existing);
    } else {
      completed.push({
        year: String(y),
        source_country,
        economic,
        area,
        value: "0",
        share: "0",
      });
    }
  }

  // 5) sort (กันพลาด)
  completed.sort((a, b) => Number(a.year) - Number(b.year));

  // 6) ทำ points สำหรับ Highcharts
  const points = completed.map((d) => ({
    y: shareNum(d.share),
    value: valueNum(d.value),
  }));

  return {
    name: economic,
    color: colorGraph[index % colorGraph.length],
    data: points,
    type: "spline",
    marker: { enabled: true, radius: 4 },
  };
}

async function loadData() {
  isLoading.value = true;
  const payload = {
    exp_country: exporting.value.iso,
    imp_country: importing.value.iso,
    exp_sector: Number(sector.value.sectorID),
    year: buildYearRange(yearStart.value, yearEnd.value),
  };

  let { data: raw } = await axios.post(
    `${serverData.value}va/back_source.php`,
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

  const rawNoRow = (raw || []).filter((d) => d.source_country !== "RoW");

  // 5 อันดับแรกตาม value ของปีสุดท้าย
  const topLastYear = rawNoRow
    .filter((d) => Number(d.year) === yearEnd.value)
    .sort((a, b) => Number(b.value) - Number(a.value))
    .slice(0, 5)
    .map((d) => d.source_country);

  lastISO.value = topLastYear;

  // สร้างซีรีส์ (ข้ามตัวว่าง)
  series.value = topLastYear
    .map((iso, i) => genSeries(iso, rawNoRow, i))
    .filter(Boolean);
  isLoading.value = false;

  plotGraph();
  genDes();
}

function plotGraph() {
  const title = `Which economies are the top sources of Foreign Value Added (FVA) embedded in ${exporting.value.name}'s ${sector.value.sectorShortName} exports to ${importing.value.name}?`;
  const cats = categories.value.map(String); // ให้แน่ใจว่าเป็นสตริง

  Highcharts.chart("chartBSRange03", {
    chart: { type: "spline", backgroundColor: "#fff" },
    title: {
      text: title,
      style: { fontSize: "24px", fontWeight: 600, color: "#333" },
    },
    xAxis: {
      categories: cats,
      tickLength: 0,
      labels: { style: { color: "#666" } },
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
    legend: { align: "center", verticalAlign: "bottom" },
    tooltip: {
      useHTML: true,
      formatter() {
        const p = this.point;
        // ดึง label ของปีจาก category ให้ถูกต้อง
        const yr = p.category ?? this.key ?? cats[p.index ?? p.x];
        return `
          <div style="min-width:220px">
            <div style="font-weight:700">${this.series.name}</div>
            <div>Year: ${yr}</div>
            <div>Share: ${Number(p.y).toFixed(1)}% of backward linkages</div>
            <div>Value: ${money(p.value)}</div>
          </div>`;
      },
    },
    plotOptions: {
      series: { lineWidth: 3, marker: { enabled: true, radius: 4 } },
    },
    credits: { enabled: false },
    series: series.value,
  });
}

const genDes = () => {
  for (let i = 0; i < 5; i++) {
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
      econname: series.value[i].name,
      color: colorGraph[i],
      img: `/images/flags/${lastISO.value[i]}.png`,
      des: `${lasty}% of ${exporting.value.name}'s ${sector.value.sectorShortName} FVA was sourced from ${series.value[i].name} in ${yearEnd.value}, ${textdiff} since  ${yearStart.value}.`,
    });
  }
};
// sync showDetail กับขนาดจอ
watch(
  () => $q.screen.gt.sm,
  (isLarge) => (showDetail.value = isLarge)
);

onMounted(loadData);
</script>

<style lang="scss" scoped></style>
