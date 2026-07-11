<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-lg font-bold fblack">
      Top 5 Backward-Linked Partner economies
    </div>
    <div class="border-b border-[#DDDDDD]"></div>

    <div class="flex flex-col lg:flex-row">
      <!-- กราฟหลัก -->
      <div class="w-full lg:w-3/5 flex justify-center p-4">
        <div id="chartGVCSinglePartnerBack" class="w-full max-w-[600px]"></div>
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
              v-if="showIconColor(iconList[i - 1])"
              :src="showIconColor(iconList[i - 1])"
              class="h-6 w-9"
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
            In {{ yearShow }}, {{ countryName }}'s exports incorporated USD
            {{ formatMainValue(chartValues[i - 1]) }} in foreign inputs from
            {{ chartCategories[i - 1] }}, accounting for
            {{ chartShare[i - 1] }}% of {{ countryName }}'s gross exports.
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
            id="chartGVCSingle3-breakdown-chart"
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

// ===== main chart states =====
const chartCategories = ref([]); // labels
const chartShare = ref([]); // %
const chartValues = ref([]); // values in **million**
const iconList = ref([]); // ecoID list
const finalData = ref([]); // [[{ecoID, ecoName, share, value(million)}]]
const useMillionsRef = ref(false); // หน่วยที่แสดงในกราฟหลัก/ข้อความฝั่งขวา

// สี
const colorPalette2 = ["#9467BD", "#1F77B4", "#2CA02C", "#FFA726", "#EC407A"];
const colorPalette = ["#7EB043", "#FF7043", "#AB47BC", "#3FBFCF", "#8D6E63"];

// ===== cached lists =====
const sectorList = ref([]);
const economyList = ref([]);

// ===== breakdown states =====
const breakDownData = ref([]);
const breakDownDataFinal = ref({
  title: "",
  subTitle: "",
  sectorName: [],
  share: [], // values (million)
});
const breakdownDialogVisible = ref(false);

// ===== responsive: เปิดรายละเอียดอัตโนมัติบนหน้าจอใหญ่ =====
const showDetail = ref($q.screen.gt.sm);
watch(
  () => $q.screen.gt.sm,
  (v) => (showDetail.value = v)
);

// ===== utils =====
const roundNumber = (n) => Number((Number(n) * 100).toFixed(1)); // 0.xx -> xx.x
const toB = (m) => Number((Number(m) / 1000).toFixed(1)); // million -> billion (1 dec)

const findSectorName = (id) =>
  sectorList.value.find((e) => e.catID === id)?.shortname || `Sector ${id}`;

function showIconColor(id) {
  if (!id) return "";
  return `/images/flags/${id}.png`;
}

function formatMainValue(vMillion) {
  const v = Number(vMillion || 0);
  if (useMillionsRef.value) return `${v.toFixed(1)} million`;
  return `${toB(v).toFixed(1)} billion`;
}

// ===== load lists (ครั้งเดียว) =====
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

// ===== keep chart instances =====
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

// ===== breakdown data loader =====
let requestId = 0;

async function loadBreakDownData() {
  const myReq = requestId; // ผูกกับชุดเดียวกัน

  const iso = props.inputData?.exporting?.iso;
  const yr = props.inputData?.year;
  if (!iso || !yr) return;

  const res = await axios.post(
    `${serverData.value}/va/gvc_toppartner_sector.php`,
    JSON.stringify({ exp_country: iso, year: yr })
  );

  if (myReq !== requestId) return;

  breakDownData.value = (res.data || []).filter(
    (d) => d.var === "Backward linkages"
  );
}

function breakDownGenData(idx) {
  const sec = finalData.value?.[0]?.[idx];
  if (!sec) return;

  const arr = (breakDownData.value || [])
    .filter((d) => d.country === sec.ecoID)
    .sort((a, b) => Number(b.value) - Number(a.value));

  breakDownDataFinal.value = {
    title: sec.ecoName,
    subTitle: `Foreign Value Added from ${sec.ecoName} in ${
      countryName.value
    }'s exports (${sec.share}% of gross exports, USD ${formatMainValue(
      sec.value
    )}), by sector`,
    share: arr.map((x) => Number(x.value)), // million
    sectorName: arr.map((x) => findSectorName(x.exp_sector)),
  };

  breakdownDialogVisible.value = true;
}

function onBreakdownDialogShown() {
  nextTick(plotBreakdownChart);
}

// ===== main data loader =====
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
    `${serverData.value}/va/gvc_toppartner.php`,
    JSON.stringify({ exp_country: iso, year: yr })
  );

  if (myReq !== requestId) return;

  const arr = (res.data || [])
    .filter((d) => d.var === "Backward linkages")
    .sort((a, b) => Number(b.value) - Number(a.value))
    .slice(0, 5);

  finalData.value = [
    arr.map((d) => ({
      ecoID: d.country,
      ecoName:
        (economyList.value.find((s) => s.value == d.country) || {}).label ||
        d.country,
      share: roundNumber(d.share),
      value: Number(d.value), // million
    })),
  ];

  iconList.value = finalData.value[0].map((x) => x.ecoID);
  chartCategories.value = finalData.value[0].map((d) => d.ecoName);
  chartShare.value = finalData.value[0].map((d) => d.share);
  chartValues.value = finalData.value[0].map((d) => d.value);

  await nextTick();
  plotMainChart();
}

// ===== main chart =====
function plotMainChart() {
  const valuesM = chartValues.value || [];
  const minM = valuesM.length ? Math.min(...valuesM) : 0;
  useMillionsRef.value = minM > 0 && minM < 1000;

  const seriesData = useMillionsRef.value
    ? valuesM.map((v) => Number(Number(v || 0).toFixed(1)))
    : valuesM.map((v) => toB(v || 0));

  if (mainChart) mainChart.destroy();

  mainChart = Highcharts.chart("chartGVCSinglePartnerBack", {
    chart: { type: "column", backgroundColor: "#fff" },
    title: {
      // ✅ คง Title เดิม
      text: `Top 5 Partner Economies Based on FVA in ${countryName.value}'s Gross Exports.`,
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
        const sector = this.key;
        const share = Number(chartShare.value[i] || 0).toFixed(1);
        const unit = useMillionsRef.value ? "million" : "billion";
        const val = Number(this.y || 0).toFixed(1);
        return `
          <div style="font-weight:700; margin-bottom:4px;">${sector}</div>
          <div>Share:&nbsp; ${share}% of ${countryName.value} gross exports</div>
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

  breakdownChart = Highcharts.chart("chartGVCSingle3-breakdown-chart", {
    chart: { type: "column", backgroundColor: "#fff" },
    title: { text: breakDownDataFinal.value.title },
    subtitle: { text: breakDownDataFinal.value.subTitle },
    xAxis: {
      categories: breakDownDataFinal.value.sectorName,
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
        return `<b>${breakDownDataFinal.value.sectorName[i]}</b><br/>Value: $${val} ${unit}`;
      },
    },
    series: [
      {
        data: seriesData,
        colorByPoint: true,
        colors: colorPalette2,
      },
    ],
    legend: { enabled: false },
    credits: { enabled: false },
  });
}

/* ----------------------------- orchestrator watcher ----------------------------- */
/**
 * ✅ watcher ตัวเดียว + immediate
 * (ตัด onMounted ออก -> ไม่ยิงซ้ำ)
 */
watch(
  () => [props.inputData?.exporting?.iso, props.inputData?.year],
  async ([iso, yr]) => {
    if (!iso || !yr) {
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

    // เร็วขึ้น: ยิงคู่ขนาน
    await Promise.all([loadData(), loadBreakDownData()]);

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

<style lang="scss" scoped></style>
