<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-lg font-bold fblack">
      Top 5 Backward-Linked Exporting Sectors
    </div>
    <div class="border-b border-[#DDDDDD]"></div>

    <div class="flex flex-col lg:flex-row">
      <!-- กราฟหลัก -->
      <div class="w-full lg:w-3/5 flex justify-center p-4">
        <!-- ใส่ :key เพื่อบังคับ re-mount เมื่อประเทศ/ปีเปลี่ยน -->
        <div
          :key="`${props.inputData?.exporting?.iso}-${yearShow}`"
          id="chartGVCSingle2"
          class="w-full max-w-[600px]"
        ></div>
      </div>

      <!-- ปุ่ม View more/less (มือถือ/แท็บเล็ต) -->
      <div
        class="lg:hidden text-[#0672CB] cursor-pointer text-center font-semibold w-full"
        @click="showDetail = !showDetail"
      >
        {{ showDetail ? "View less" : "View more" }}
        <q-icon
          :name="showDetail ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        />
      </div>

      <!-- รายละเอียด + ลิงก์ break-down -->
      <div class="w-full lg:w-2/5 p-4" v-show="showDetail">
        <div v-for="i in 5" :key="i" class="mb-2">
          <div
            class="font-semibold text-lg flex items-center"
            :style="{ color: colorPalette[i - 1] }"
          >
            <img
              v-if="showIconColor(iconList[i - 1], i)"
              :src="showIconColor(iconList[i - 1], i)"
              class="h-7"
              alt=""
            />
            <div class="pl-1">{{ chartCategories[i - 1] }}</div>
          </div>

          <div
            class="underline cursor-pointer mb-1 fsub"
            @click="breakDownGenData(i - 1)"
          >
            Click here to break down
          </div>

          <div class="fsub">
            In {{ yearShow }}, {{ countryName }}'s
            {{ chartCategories[i - 1] }} exports included USD
            {{ formatMainValue(chartValues[i - 1]) }} in FVA, accounting for
            {{ chartShare[i - 1] }}% of the sector's total export value.
          </div>
        </div>
      </div>
    </div>

    <!-- Break-down dialog -->
    <q-dialog
      v-model="breakdownDialogVisible"
      persistent
      @show="onBreakdownDialogShown"
      @hide="destroyBreakdown"
    >
      <q-card class="max-w-[90vw] w-full">
        <q-card-section>
          <div
            :key="`bd-${props.inputData?.exporting?.iso}-${yearShow}-${breakDownDataFinal.title}`"
            id="chartGVCSingle2-breakdown-chart"
            style="height: 400px; width: 100%"
          ></div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, computed, onBeforeUnmount } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import { serverSetup } from "../../pages/server";

// ===== props / server =====
const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
const $q = useQuasar();

// ===== meta =====
const countryName = computed(() => props.inputData?.exporting?.name ?? "");
const yearShow = computed(() => Number(props.inputData?.year) || null);
const totalGrossExport = ref(0);

// สี (โทนสดใส อ่านง่ายบนพื้นขาว)
const colorPalette = ["#9467BD", "#1F77B4", "#2CA02C", "#FFA726", "#EC407A"];
const colorPalette2 = ["#7EB043", "#FF7043", "#AB47BC", "#3FBFCF", "#8D6E63"];

// ===== main chart states =====
const chartCategories = ref([]); // labels
const chartShare = ref([]); // %
const chartValues = ref([]); // values in **million**
const finalData = ref([]); // [[{sectorID, sectorName, share, value(million)}]]
const iconList = ref([]); // sectorID list
const useMillionsRef = ref(false); // หน่วยที่แสดงในกราฟหลัก/ข้อความฝั่งขวา

// ===== breakdown states =====
const breakDownData = ref([]);
const breakDownDataFinal = ref({
  title: "",
  subTitle: "",
  shortEconomy: [],
  share: [], // values (million)
  fullEconomy: [],
});
const breakdownDialogVisible = ref(false);

// ===== cached lists =====
const sectorList = ref([]);
const economyList = ref([]);

// ===== responsive: เปิดรายละเอียดอัตโนมัติบนหน้าจอใหญ่ =====
const showDetail = ref($q.screen.gt.sm);
watch(
  () => $q.screen.gt.sm,
  (v) => (showDetail.value = v)
);

// ===== utils =====
const roundNumber = (n) => Number((Number(n) * 100).toFixed(1)); // 0.xx -> xx.x
const findFullEcoName = (iso) =>
  (economyList.value.find((e) => e.value === iso) || {}).label || iso;
const toB = (m) => Number((Number(m) / 1000).toFixed(1)); // million -> billion (1 dec)

function showIconColor(id, order) {
  if (!id || !order) return "";
  return `/images/sector/${order}/${id}.svg`;
}

function formatMainValue(vMillion) {
  if (useMillionsRef.value)
    return `${Number(vMillion || 0).toFixed(1)} million`;
  return `${toB(vMillion || 0).toFixed(1)} billion`;
}

// ===== load lists =====
let sectorPromise = null;
let economyPromise = null;

async function loadSectorList() {
  const res = await axios.get(`${serverData.value}/va/get_sector.php`);
  sectorList.value = res.data || [];
}
async function loadEconomyList() {
  const res = await axios.get(`${serverData.value}/va/get_economy.php`);
  economyList.value = (res.data || []).map((d) => ({
    id: d.id,
    label: d.name,
    value: d.iso,
  }));
}

async function ensureLists() {
  if (sectorList.value.length === 0) {
    if (!sectorPromise) sectorPromise = loadSectorList();
    await sectorPromise;
  }
  if (economyList.value.length === 0) {
    if (!economyPromise) economyPromise = loadEconomyList();
    await economyPromise;
  }
}

// ===== keep chart instances to destroy before re-draw =====
let mainChart = null;
let breakdownChart = null;

function destroyMain() {
  if (mainChart) {
    try {
      mainChart.destroy();
    } catch (e) {}
    mainChart = null;
  }
}
function destroyBreakdown() {
  if (breakdownChart) {
    try {
      breakdownChart.destroy();
    } catch (e) {}
    breakdownChart = null;
  }
}
function destroyCharts() {
  destroyMain();
  destroyBreakdown();
}

// ===== load main top-5 (Backward linkages) =====
let requestId = 0;

async function loadData() {
  const myReq = ++requestId;

  const iso = props.inputData?.exporting?.iso;
  const yr = props.inputData?.year;
  if (!iso || !yr) return;

  const resTotal = await axios.post(
    `${serverData.value}/va/get_total_export.php`,
    JSON.stringify({
      exp_country: iso,
      imp_country: "WLD",
      year: yr,
      exp_sector: 0,
    })
  );

  totalGrossExport.value = formatMainValue(resTotal.data.total_exports || 0);

  const res = await axios.post(
    `${serverData.value}/va/gvc_topsector.php`,
    JSON.stringify({ exp_country: iso, year: yr })
  );

  if (myReq !== requestId) return;

  const arr = (res.data || [])
    .filter((d) => d.var === "Backward linkages")
    .sort((a, b) => Number(b.value) - Number(a.value))
    .slice(0, 5);

  // เก็บ value เป็น "million"
  finalData.value = [
    arr.map((d) => ({
      sectorID: d.exp_sector,
      sectorName:
        (sectorList.value.find((s) => s.catID == d.exp_sector) || {})
          .shortname || `Sector ${d.exp_sector}`,
      share: roundNumber(d.share),
      value: Number(d.value), // million
    })),
  ];

  iconList.value = finalData.value[0].map((x) => Number(x.sectorID));
  chartCategories.value = finalData.value[0].map((d) => d.sectorName);
  chartShare.value = finalData.value[0].map((d) => d.share);
  chartValues.value = finalData.value[0].map((d) => d.value); // million

  await nextTick();
  plotMainChart();
}

// ===== load breakdown data =====
async function loadBreakDownData() {
  const myReq = requestId; // ผูกกับชุดเดียวกัน (ไม่เพิ่ม counter ใหม่)

  const iso = props.inputData?.exporting?.iso;
  const yr = props.inputData?.year;
  if (!iso || !yr) return;

  const res = await axios.post(
    `${serverData.value}/va/gvc_topsector_partner.php`,
    JSON.stringify({ exp_country: iso, year: yr })
  );

  if (myReq !== requestId) return;

  breakDownData.value = (res.data || []).filter(
    (d) => d.var === "Backward linkages"
  );
}

// ===== main chart =====
function plotMainChart() {
  const valuesM = chartValues.value || []; // million
  const minM = valuesM.length ? Math.min(...valuesM) : 0;

  // ถ้าค่าน้อยสุด < 1000 million แสดงเป็น million; ไม่งั้นแสดงเป็น billion
  useMillionsRef.value = minM > 0 && minM < 1000;

  const seriesData = useMillionsRef.value
    ? valuesM.map((v) => Number(Number(v || 0).toFixed(1))) // million
    : valuesM.map((v) => toB(v || 0)); // billion

  if (mainChart) mainChart.destroy();

  mainChart = Highcharts.chart("chartGVCSingle2", {
    chart: { type: "column", backgroundColor: "#fff" },
    title: {
      text: `Top 5 Sectors with Highest Foreign Value Added (FVA) in ${countryName.value}'s Exports`,
      style: { fontWeight: "bold", fontSize: "24px", color: "#666" },
    },
    subtitle: {
      text: `Total gross exports of ${countryName.value} in ${yearShow.value} : USD ${totalGrossExport.value}`,
      style: { fontSize: "14px", color: "#666" },
    },
    xAxis: {
      categories: chartCategories.value,
      labels: { style: { color: "#666" } },
    },
    yAxis: {
      min: 0,
      title: {
        text: useMillionsRef.value ? "USD Million" : "USD Billion",
        style: { color: "#666" },
      },
      labels: { style: { color: "#666" } },
    },
    tooltip: {
      useHTML: true,
      padding: 10,
      borderRadius: 6,
      formatter() {
        const i = this.point.index;
        const sectorName = this.key;
        const share = Number(chartShare.value[i] || 0).toFixed(1);
        const unit = useMillionsRef.value ? "million" : "billion";
        const val = Number(this.y || 0).toFixed(1);
        return `
          <div style="font-weight:700; margin-bottom:4px;">${sectorName}</div>
          <div>Share:&nbsp; ${share}% of backward linkages</div>
          <div style="margin-left:36px;">in sectoral gross exports</div>
          <div style="margin-top:6px;">Value:&nbsp; $${val} ${unit}</div>
        `;
      },
    },
    series: [{ data: seriesData, colorByPoint: true, colors: colorPalette }],
    legend: { enabled: false },
    credits: { enabled: false },
  });
}

// ===== breakdown chart =====
function plotBreakdownChart() {
  const valsM = breakDownDataFinal.value.share || [];
  const minM = valsM.length ? Math.min(...valsM) : 0;
  const useMillion = minM > 0 && minM < 1000;

  const seriesData = useMillion
    ? valsM.map((v) => Number(Number(v || 0).toFixed(1)))
    : valsM.map((v) => toB(v || 0));

  if (breakdownChart) breakdownChart.destroy();

  breakdownChart = Highcharts.chart("chartGVCSingle2-breakdown-chart", {
    chart: { type: "column", backgroundColor: "#fff" },
    title: { text: breakDownDataFinal.value.title },
    subtitle: { text: breakDownDataFinal.value.subTitle },
    xAxis: {
      categories: breakDownDataFinal.value.shortEconomy,
      title: { text: null },
    },
    yAxis: {
      title: {
        text: `Foreign value-added (USD ${useMillion ? "Million" : "Billion"})`,
      },
      min: 0,
    },
    tooltip: {
      useHTML: true,
      formatter() {
        const i = this.point.index;
        const val = Number(this.y || 0).toLocaleString(undefined, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        });
        const unit = useMillion ? "million" : "billion";
        return `<b>${breakDownDataFinal.value.fullEconomy[i]}</b><br/>Value: $${val} ${unit}`;
      },
    },
    series: [{ data: seriesData, colorByPoint: true, colors: colorPalette2 }],
    legend: { enabled: false },
    credits: { enabled: false },
  });
}

// ===== breakdown generator =====
function breakDownGenData(idx) {
  const sec = finalData.value?.[0]?.[idx];
  if (!sec) return;

  const arr = (breakDownData.value || [])
    .filter((d) => d.exp_sector === sec.sectorID)
    .sort((a, b) => Number(b.value) - Number(a.value));

  breakDownDataFinal.value = {
    title: sec.sectorName,
    subTitle: `Foreign Value Added (FVA) in ${countryName.value}'s ${
      sec.sectorName
    } exports: USD ${formatMainValue(sec.value)} (${
      sec.share
    }% of this sector's gross exports), by source economy.`,
    shortEconomy: arr.map((x) => findFullEcoName(x.source_country)),
    share: arr.map((x) => Number(x.value)), // million
    fullEconomy: arr.map((x) => findFullEcoName(x.source_country)),
  };

  breakdownDialogVisible.value = true;
}

function onBreakdownDialogShown() {
  nextTick(plotBreakdownChart);
}

/* ----------------------------- watchers ---------------------------------- */
/**
 * ✅ ใช้ watcher ตัวเดียวเป็นตัวคุมทั้งหมด
 * - immediate โหลดครั้งแรก
 * - ไม่ต้องมี onMounted แล้ว -> ไม่ยิงซ้ำ
 */
watch(
  () => [props.inputData?.exporting?.iso, props.inputData?.year],
  async ([iso, yr]) => {
    if (!iso || !yr) {
      // เคลียร์ state เมื่อ input ไม่พร้อม
      finalData.value = [];
      chartCategories.value = [];
      chartShare.value = [];
      chartValues.value = [];
      iconList.value = [];
      breakDownData.value = [];
      if (breakdownDialogVisible.value) breakdownDialogVisible.value = false;
      destroyCharts();
      return;
    }

    await ensureLists();
    await loadData();
    await loadBreakDownData();

    // ถ้า dialog เปิดอยู่ วาดกราฟย่อยใหม่ด้วย
    if (breakdownDialogVisible.value) {
      await nextTick();
      plotBreakdownChart();
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  destroyCharts();
});
</script>

<style scoped></style>
