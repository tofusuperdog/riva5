<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-lg font-bold fblack">
      {{ t("backward.charts.backwardIn", { region: regionName }) }}
    </div>
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
              {{ t("backward.charts.preparing") }}
            </div>
            <div class="text-sm text-gray-600 mt-0.5">
              {{ t("backward.charts.rendering") }}
            </div>
            <div class="text-xs text-gray-500 mt-3">
              {{ t("backward.charts.patience") }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row" v-show="!isLoading">
      <!-- กราฟหลัก -->
      <div
        class="w-full flex items-center justify-center pt-4"
        v-show="!isLoading"
      >
        <div
          id="chartBSOSingle02"
          class="w-full max-w-[1100px] min-h-[500px]"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import { serverSetup } from "../../pages/server";
import { useI18n } from "vue-i18n";
import { translateSector } from "../../i18n/sectors";

const { t, locale } = useI18n();

// ===== Props / Server / Screen =====
const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
const $q = useQuasar(); // (ยังไม่ได้ใช้ แต่เก็บไว้เผื่ออนาคต)

// ===== input from parent component =====
const exporting = computed(() => props.inputData?.exporting || null);
const importing = computed(() => props.inputData?.importing || null);
const source = computed(() => props.inputData?.source || null);
const year = computed(() => Number(props.inputData?.year) || null);

const isLoading = ref(true);

// ---------- Static color map ----------
const sectorColors = [
  { id: "Agriculture", name: "Agriculture", color: "#2ECC71", code: "A" },
  { id: "Mining", name: "Mining", color: "#9B59B6", code: "B" },
  { id: "Construction", name: "Construction", color: "#E67E22", code: "C" },
  { id: "Utilities", name: "Utilities", color: "#F1C40F", code: "D" },

  {
    id: "Manufacturing Low tech",
    name: "Manufacturing Low tech",
    color: "#E74C3C",
    code: "E",
  },
  {
    id: "Manufacturing High and medium tech",
    name: "Manufacturing High and medium tech",
    color: "#FF6F91",
    code: "F",
  },

  {
    id: "Services Trade and repair",
    name: "Services Trade and repair",
    color: "#3498DB",
    code: "G",
  },
  {
    id: "Services Tourism",
    name: "Services Tourism",
    color: "#5DADE2",
    code: "H",
  },
  {
    id: "Services Transport",
    name: "Services Transport",
    color: "#2E86C1",
    code: "I",
  },
  { id: "Services ICT", name: "Services ICT", color: "#1F618D", code: "J" },
  {
    id: "Services Property and business",
    name: "Services Property and business",
    color: "#154360",
    code: "K",
  },
  {
    id: "Services Financial",
    name: "Services Financial",
    color: "#85C1E9",
    code: "L",
  },
  {
    id: "Services Public and welfare",
    name: "Services Public and welfare",
    color: "#2874A6",
    code: "M",
  },
  {
    id: "Services Private household",
    name: "Services Private household",
    color: "#21618C",
    code: "N",
  },
];

const sectorList = ref([]);

// ---------- result ----------
const countriesISO = ref([]);
const countriesName = ref([]);
const economyList = ref([]);
const regionName = ref("");
const gTotal = ref([]);
const seriesMain = ref([]);

let chartInstance = null;

// ---------- Helpers ----------
const sectorIDtoData = (id) =>
  sectorList.value.find((item) => item.catID == id);
const isoToData = (iso) => economyList.value.find((d) => d.iso == iso);
const digit1 = (num) => Number(Number(num).toFixed(2));

function moneyFmt(n) {
  n = Number(n);
  if (n >= 1000) return `$${(n / 1000).toFixed(1)} ${t("backward.charts.billion")}`;
  return `$${n.toFixed(1)} ${t("backward.charts.million")}`;
}

function mainTooltipFormatter() {
  const categories = this.series?.chart?.xAxis?.[0]?.categories || [];
  const country = this.point.category ?? categories[this.point.x];
  return `
    <div style="min-width:220px">
      <div style="font-weight:700;font-size:16px">${country}</div>
      <div style="margin-top:4px">${this.series.name}</div>
      <div>${t("backward.charts.share")}:&nbsp; ${this.y.toFixed(1)}%</div>
      <div>${t("backward.charts.value")}:&nbsp; ${moneyFmt(this.point.value)}</div>
    </div>`;
}

// ---------- Load reference lists (โหลดครั้งเดียว) ----------
const loadEconomyList = async () => {
  const res = await axios.get(`${serverData.value}va/get_eco_not_group.php`);
  economyList.value = res.data || [];
};

const loadSectorList = async () => {
  const res = await axios.get(`${serverData.value}va/get_sector.php`);
  sectorList.value = res.data || [];
};

// ---------- Main data ----------
const loadData = async () => {
  // กันกรณี props ยังไม่พร้อม
  if (
    !exporting.value?.iso ||
    !importing.value?.iso ||
    !source.value?.iso ||
    !year.value
  ) {
    isLoading.value = false;
    return;
  }

  // ต้องมี reference data ก่อน ไม่งั้น isoToData/sectorIDtoData จะ undefined
  if (!economyList.value.length || !sectorList.value.length) {
    // ถ้ายังไม่โหลด ให้รอโหลด (ปลอดภัย)
    await Promise.all([loadEconomyList(), loadSectorList()]);
  }

  isLoading.value = true;

  gTotal.value = [];
  countriesISO.value = [];
  countriesName.value = [];
  seriesMain.value = [];

  // 1) Load main data
  const payload = {
    exp_country: exporting.value.iso,
    imp_country: importing.value.iso,
    source_country: source.value.iso,
    year: [year.value],
  };

  const res = await axios.post(
    `${serverData.value}va/back_source_regionshow.php`,
    JSON.stringify(payload)
  );

  const rawData = (res.data || []).filter((d) => Number(d.exp_sector) != 0);

  const expEco = isoToData(exporting.value.iso);
  regionName.value = expEco?.region || "";

  countriesISO.value = [...new Set(rawData.map((d) => d.exp_country))];

  // map country name safely
  countriesName.value = countriesISO.value.map((iso) => {
    const eco = isoToData(iso);
    return eco?.economic || iso;
  });

  // 2) รวม gross export
  const payload2 = {
    exp_country: countriesISO.value,
    imp_country: importing.value.iso,
    exp_sector: 0,
    year: year.value,
  };

  const res2 = await axios.post(
    `${serverData.value}va/str_component.php`,
    JSON.stringify(payload2)
  );

  const resTotalExports = (res2.data || []).filter(
    (x) => x.var == "Forward_linkages"
  );

  countriesISO.value.forEach((iso) => {
    const found = resTotalExports.find((d) => d.exp_country === iso);
    const totalx = found && found.total_exports ? found.total_exports : 0;
    gTotal.value.push(Number(totalx));
  });

  // 3) จัดข้อมูล
  const rawFinal = rawData.map((d) => {
    const sectorID = d.exp_sector;
    const sectorObj = sectorIDtoData(sectorID);
    return {
      exp_country: d.exp_country,
      sectorID,
      sectorName: translateSector({ catID: sectorID, category: sectorObj?.shortname || String(sectorID) }, locale.value),
      sectorGroup: sectorObj?.sectiongroup || "Unknown",
      value: Number(d.value),
    };
  });

  const sectorGroups = [
    ...new Set(sectorList.value.map((d) => d.sectiongroup)),
  ].slice(1);

  sectorGroups.forEach((group) => {
    const colorObj = sectorColors.find((d) => d.id == group);
    const dataTemp = [];

    countriesISO.value.forEach((iso, i) => {
      const sumVal = rawFinal
        .filter((d) => d.exp_country == iso && d.sectorGroup == group)
        .reduce((a, b) => a + b.value, 0);

      const V1 = Number(sumVal.toFixed(1));
      const total = Number(gTotal.value[i] || 0);
      const share = total > 0 ? digit1((V1 / total) * 100) : 0;

      dataTemp.push({
        y: share,
        value: V1,
        category: countriesName.value[i],
      });
    });

    seriesMain.value.push({
      name: group,
      color: colorObj?.color || "#999999",
      data: dataTemp,
    });
  });

  isLoading.value = false;

  drawChart();
};

// ---------- Graph (ไม่มี drilldown แล้ว) ----------
const drawChart = () => {
  const title = t("backward.charts.sourceRegionTitle", { source: source.value.name, region: regionName.value, importing: importing.value.name });
  const yTitle = t("backward.charts.percentGrossTo", { economy: importing.value.name });

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  chartInstance = Highcharts.chart("chartBSOSingle02", {
    chart: {
      type: "column",
      backgroundColor: "#fff",
    },
    title: {
      text: title,
      style: { fontSize: "20px", fontWeight: 600, color: "#333" },
    },
    xAxis: {
      categories: countriesName.value,
      tickLength: 0,
      labels: { style: { color: "#333", fontWeight: "normal" } },
    },
    yAxis: {
      min: 0,
      title: { text: yTitle },
      labels: {
        formatter() {
          return this.value + "%";
        },
      },
      gridLineColor: "#eee",
    },
    legend: {
      align: "center",
      verticalAlign: "bottom",
      layout: "horizontal",
      itemMarginTop: 4,
      itemMarginBottom: 4,
      itemStyle: { whiteSpace: "nowrap" },
      maxHeight: 150,
      navigation: {
        enabled: true,
        arrowSize: 12,
        style: { fontSize: "12px", fontWeight: "bold", color: "#333" },
        activeColor: "#000",
        inactiveColor: "#CCC",
      },
    },
    plotOptions: {
      column: { stacking: "normal", borderWidth: 0 },
      series: {
        cursor: "default",
        point: {
          events: {
            click: function () {
              return false;
            },
          },
        },
      },
    },
    tooltip: { useHTML: true, formatter: mainTooltipFormatter },
    series: seriesMain.value,
    credits: { enabled: false },
  });
};

// ---------- Optimized watchers ----------
// โหลด reference lists แค่ครั้งเดียวตอน mounted
onMounted(async () => {
  isLoading.value = true;
  await Promise.all([loadEconomyList(), loadSectorList()]);
  await loadData();
});

// เปลี่ยนปี/ประเทศ/แหล่งที่มา -> โหลดเฉพาะ data + redraw (ไม่โหลด list ซ้ำ)
watch(
  () => [
    year.value,
    exporting.value?.iso,
    importing.value?.iso,
    source.value?.iso,
  ],
  async () => {
    await loadData();
  }
);

watch(locale, async () => {
  await loadData();
});
</script>

<style lang="scss" scoped></style>
