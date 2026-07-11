<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-lg font-bold fblack">
      Top 5 Forward-Linked Partner economies
    </div>
    <div class="border-b border-[#DDDDDD]"></div>
    <div class="flex flex-col lg:flex-row">
      <!-- กราฟหลัก -->
      <div class="w-full lg:w-3/5 flex justify-center p-4">
        <div id="chartGVCSinglePartnerFor" class="w-full max-w-[600px]"></div>
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
            In {{ yearShow }}, {{ countryName }}'s exports contributed USD
            {{ formatMainValue(chartValues[i - 1]) }} to
            {{ chartCategories[i - 1] }}'s export production, accounting for
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
    >
      <q-card class="max-w-[90vw] w-full">
        <q-card-section>
          <div
            id="chartGVCSingle4-breakdown-chart"
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
import { ref, onMounted, nextTick, watch, computed } from "vue";
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
const finalData = ref([]); // [{ecoID, ecoName, share, value(million)}]
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

// ===== utils =====
const roundNumber = (n) => Number((Number(n) * 100).toFixed(1)); // 0.xx -> xx.x
const toB = (m) => Number((Number(m) / 1000).toFixed(1)); // million -> billion (1 dec)
const findSectorName = (id) =>
  sectorList.value.find((e) => e.catID === id).shortname;

function showIconColor(id) {
  if (!id) return "";
  return `/images/flags/${id}.png`;
}

function formatMainValue(vMillion) {
  // ใช้หน่วยเดียวกับกราฟหลัก
  if (useMillionsRef.value) return `${Number(vMillion).toFixed(1)} million`;
  return `${toB(vMillion).toFixed(1)} billion`;
}

// ===== load lists =====
async function loadSectorList() {
  const res = await axios.get(`${serverData.value}/va/get_sector.php`);
  sectorList.value = res.data;
}

async function loadEconomyList() {
  const res = await axios.get(`${serverData.value}/va/get_economy.php`);
  economyList.value = res.data.map((d) => ({
    id: d.id,
    label: d.name,
    value: d.iso,
  }));
}

// ===== breakdown states =====

async function loadBreakDownData() {
  const res = await axios.post(
    `${serverData.value}/va/gvc_toppartner_sector.php`,
    JSON.stringify({
      exp_country: props.inputData.exporting.iso,
      year: props.inputData.year,
    })
  );
  breakDownData.value = (res.data || []).filter(
    (d) => d.var === "Forward linkages"
  );
}

function breakDownGenData(idx) {
  const sec = finalData.value[0][idx];
  const arr = breakDownData.value
    .filter((d) => d.country === sec.ecoID)
    .sort((a, b) => Number(b.value) - Number(a.value));

  // เก็บเป็น million แล้วค่อยตัดสินใจหน่วยตอนวาด
  breakDownDataFinal.value = {
    title: sec.ecoName,
    subTitle: `Domestic Value Added (DVA) from ${
      countryName.value
    } embedded in ${sec.ecoName} exports: USD $${formatMainValue(sec.value)} (${
      sec.share
    }% of ${countryName.value}'s gross exports), by sector `,
    share: arr.map((x) => Number(x.value)), // million
    sectorName: arr.map((x) => findSectorName(x.exp_sector)),
  };
  breakdownDialogVisible.value = true;
}

async function loadData() {
  const resTotal = await axios.post(
    `${serverData.value}/va/get_total_export.php`,
    JSON.stringify({
      exp_country: props.inputData.exporting.iso,
      imp_country: "WLD",
      year: props.inputData.year,
      exp_sector: 0,
    })
  );

  totalGrossExport.value = formatMainValue(resTotal.data.total_exports || 0);

  const res = await axios.post(
    `${serverData.value}/va/gvc_toppartner.php`,
    JSON.stringify({
      exp_country: props.inputData.exporting.iso,
      year: props.inputData.year,
    })
  );
  const arr = (res.data || [])
    .filter((d) => d.var === "Forward linkages")
    .sort((a, b) => Number(b.value) - Number(a.value));

  finalData.value = [
    arr.map((d) => ({
      ecoID: d.country,
      ecoName: (economyList.value.find((s) => s.value == d.country) || {})
        .label,
      share: roundNumber(d.share),
      value: Number(d.value), // <— million (ไม่แปลงเป็น B ที่นี่)
    })),
  ];

  iconList.value = finalData.value[0].map((x) => x.ecoID);
  chartCategories.value = finalData.value[0].map((d) => d.ecoName);
  chartShare.value = finalData.value[0].map((d) => d.share);
  chartValues.value = finalData.value[0].map((d) => d.value); // million

  plotMainChart();
}

function plotMainChart() {
  const valuesM = chartValues.value || []; // million
  const minM = valuesM.length ? Math.min(...valuesM) : 0;
  // ถ้าค่าน้อยสุด < 1000 million แสดงเป็น million; ไม่งั้นแสดงเป็น billion
  useMillionsRef.value = minM > 0 && minM < 1000;

  const seriesData = useMillionsRef.value
    ? valuesM.map((v) => Number(v.toFixed(1))) // million
    : valuesM.map((v) => toB(v)); // billion

  Highcharts.chart("chartGVCSinglePartnerFor", {
    chart: { type: "column", backgroundColor: "#fff" },
    title: {
      text: `Top 5 Partner Economies Embedding Highest Domestic Value Added (DVA) from  ${countryName.value} into Their Exports`,
      style: { fontWeight: "bold", fontSize: "24px", color: "#666" },
      align: "center",
      x: -30,
    },
    subtitle: {
      text: `Total gross exports of ${countryName.value} in ${yearShow.value} : USD ${totalGrossExport.value}`,
      style: { fontSize: "14px", color: "#666" },
      align: "center",
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
        const share = Number(chartShare.value[i]).toFixed(1);
        const unit = useMillionsRef.value ? "million" : "billion";
        const val = Number(this.y).toFixed(1);
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
  // ใช้ค่าดิบเป็น "million"
  const valsM = breakDownDataFinal.value.share || [];
  const minM = valsM.length ? Math.min(...valsM) : 0;

  // ถ้าค่าน้อยสุด < 1000 => แสดง million; ไม่งั้น billion
  const useMillion = minM > 0 && minM < 1000;

  const seriesData = useMillion
    ? valsM.map((v) => Number(v.toFixed(1))) // million
    : valsM.map((v) => toB(v)); // billion

  Highcharts.chart("chartGVCSingle4-breakdown-chart", {
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
        const val = Number(this.y).toLocaleString(undefined, {
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

// ===== responsive: เปิดรายละเอียดอัตโนมัติบนหน้าจอใหญ่ =====
const showDetail = ref($q.screen.gt.sm);
watch(
  () => $q.screen.gt.sm,
  (v) => (showDetail.value = v)
);

function onBreakdownDialogShown() {
  nextTick(plotBreakdownChart);
}

// ✅ รีโหลดทุกครั้งที่ iso หรือ year เปลี่ยน
watch(
  [() => props.inputData?.exporting?.iso, () => props.inputData?.year],
  async ([iso, year]) => {
    if (!iso || !year) return;
    // กันกรณียังไม่ได้โหลด meta
    if (!sectorList.value.length) await loadSectorList();
    if (!economyList.value.length) await loadEconomyList();
    await loadData();
    await loadBreakDownData();
  },
  { immediate: false }
);

// ===== init =====
onMounted(async () => {
  await loadSectorList();
  await loadEconomyList();
  await loadData();
  await loadBreakDownData();
});
</script>

<style lang="scss" scoped></style>
