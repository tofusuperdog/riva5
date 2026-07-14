```vue
<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-lg font-bold fblack">
      {{ t("backward.charts.backwardIn", { region: regionName }) }}
    </div>
    <div class="border-b border-[#DDDDDD]"></div>

    <div class="flex flex-col lg:flex-row">
      <div class="w-full pt-4 relative flex items-center justify-center">
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

        <!-- กราฟ (ไม่มี drilldown แล้ว) -->
        <div
          v-show="!isLoading"
          id="chartBSSingle02"
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
import { translateEconomy } from "../../i18n/economies";

const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
const { locale, t } = useI18n({ useScope: "global" });
const $q = useQuasar();

/* ✅ ผูกกับ props แบบ reactive จริง ๆ */
const exporting = ref(props.inputData.exporting);
const importing = ref(props.inputData.importing);
const sector = ref(props.inputData.sector);
const year = computed(() => Number(props.inputData?.year) || null);

/* state */
const economyList = ref([]);
const regionList = ref([
  "Asia-Pacific",
  "Europe",
  "North America",
  "Latin America",
  "Rest of the World",
]);
const regionName = ref("");
const rawResult = ref([]);
const countriesISO = ref([]);
const countries = ref([]);
const seriesMain = ref([]);
const gTotal = ref([]);

const isLoading = ref(false);

/* เก็บ instance ของกราฟ เพื่อ destroy ก่อนวาดใหม่ */
let chartInstance = null;

/* helpers */
const isoToName = (iso) =>
  economyList.value.find((d) => d.iso === iso)?.name || iso;
const isoToRegion = (iso) =>
  economyList.value.find((d) => d.iso === iso)?.region || exporting.value.name;
const valueNum = (num) => Number(Number(num).toFixed(1));

const loadEconomyList = async () => {
  const res2 = await axios.get(`${serverData.value}va/get_eco_not_group.php`);
  economyList.value = res2.data.map((d) => ({
    iso: d.iso,
    name: translateEconomy({ iso: d.iso, name: d.economic }, locale.value),
    region: d.region,
    area: d.area,
  }));

  // อัปเดต regionName ตาม exporting ปัจจุบัน
  if (exporting.value?.iso) regionName.value = isoToRegion(exporting.value.iso);
};

/* สร้างซีรีส์หลัก (ตัด drilldown ออกแล้ว) */
const genSeriesMain = (dataValue) => {
  return countriesISO.value.map((iso, i) => ({
    y: Number(((dataValue[i] / gTotal.value[i]) * 100).toFixed(1)),
    value: dataValue[i],
    category: isoToName(iso),
  }));
};

const loadData = async () => {
  console.clear();
  if (
    !exporting.value?.iso ||
    !importing.value?.iso ||
    !sector.value?.sectorID ||
    !year.value
  )
    return;

  isLoading.value = true;

  /* ✅ รีเซ็ต state ก่อนคำนวณรอบใหม่ */
  rawResult.value = [];
  countriesISO.value = [];
  countries.value = [];
  seriesMain.value = [];
  gTotal.value = [];

  // regionName อาจเปลี่ยนถ้า exporting เปลี่ยน
  regionName.value = exporting.value?.iso
    ? isoToRegion(exporting.value.iso)
    : "";

  const payload = {
    exp_country: exporting.value.iso,
    imp_country: importing.value.iso,
    exp_sector: Number(sector.value.sectorID),
    year: year.value,
  };

  const { data: result } = await axios.post(
    `${serverData.value}va/back_source_regionshow2.php`,
    JSON.stringify(payload)
  );

  rawResult.value = (result || []).filter((d) => Number(d.value) > 0);

  // ✅ เติม area โดยดูจาก economyList (iso -> area), ถ้าไม่เจอ iso ให้ตัดทิ้ง ยกเว้น RoW
  const isoToArea = new Map(economyList.value.map((e) => [e.iso, e.area]));
  rawResult.value = rawResult.value
    .filter(
      (r) => r.source_country === "RoW" || isoToArea.has(r.source_country)
    )
    .map((r) => ({
      ...r,
      area:
        r.source_country === "RoW"
          ? "Rest of the World"
          : isoToArea.get(r.source_country),
      value: Number(r.value),
      year: Number(r.year),
    }));

  countriesISO.value = [...new Set((result || []).map((d) => d.exp_country))];
  countries.value = countriesISO.value.map((iso) => isoToName(iso));

  // หา total exports (gTotal)
  const payload2 = {
    exp_country: countriesISO.value,
    imp_country: importing.value.iso,
    exp_sector: Number(sector.value.sectorID),
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
    const totalx =
      resTotalExports.find((d) => d.exp_country === iso)?.total_exports ?? 0;
    gTotal.value.push(Number(totalx));
  });

  const dataByArea = {
    "Asia-Pacific": rawResult.value.filter((d) => d.area === "Asia-Pacific"),
    Europe: rawResult.value.filter((d) => d.area === "Europe"),
    "North America": rawResult.value.filter((d) => d.area === "North America"),
    "Latin America": rawResult.value.filter((d) => d.area === "Latin America"),
    "Rest of the World": rawResult.value.filter(
      (d) => d.area === "Rest of the World"
    ),
  };

  const sumBy = (arr, iso, key) =>
    arr
      .filter((d) => d.exp_country === iso)
      .reduce((acc, cur) => acc + Number(cur[key]), 0);

  const dataValue = {
    "Asia-Pacific": countriesISO.value.map((iso) =>
      valueNum(sumBy(dataByArea["Asia-Pacific"], iso, "value"))
    ),
    Europe: countriesISO.value.map((iso) =>
      valueNum(sumBy(dataByArea["Europe"], iso, "value"))
    ),
    "North America": countriesISO.value.map((iso) =>
      valueNum(sumBy(dataByArea["North America"], iso, "value"))
    ),
    "Latin America": countriesISO.value.map((iso) =>
      valueNum(sumBy(dataByArea["Latin America"], iso, "value"))
    ),
    "Rest of the World": countriesISO.value.map((iso) =>
      valueNum(sumBy(dataByArea["Rest of the World"], iso, "value"))
    ),
  };

  // ✅ seriesMain เหมือนเดิม แต่ไม่มี drilldown
  seriesMain.value = [
    {
      name: t("backward.charts.regionAsia"),
      color: "#1F77B4",
      data: genSeriesMain(dataValue["Asia-Pacific"]),
    },
    {
      name: t("backward.charts.regionEurope"),
      color: "#FF813D",
      data: genSeriesMain(dataValue["Europe"]),
    },
    {
      name: t("backward.charts.regionNorthAmerica"),
      color: "#2CA02C",
      data: genSeriesMain(dataValue["North America"]),
    },
    {
      name: t("backward.charts.regionLatinAmerica"),
      color: "#9467BD",
      data: genSeriesMain(dataValue["Latin America"]),
    },
    {
      name: t("backward.charts.regionRestWorld"),
      color: "#E377C2",
      data: genSeriesMain(dataValue["Rest of the World"]),
    },
  ];

  isLoading.value = false;
  drawChart();
};

/* ------------------- Tooltips ------------------- */
function moneyFmt(n) {
  return `$${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} ${t("backward.charts.million")}`;
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

const drawChart = () => {
  const title = t("backward.charts.regionTitle", { region: regionName.value, sector: sector.value.sectorShortName, importing: importing.value.name });

  const yTitle = t("backward.charts.percentGrossTo", { economy: importing.value.name });

  /* ✅ ทำลายกราฟเก่าก่อนวาดใหม่ */
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  chartInstance = Highcharts.chart("chartBSSingle02", {
    chart: {
      type: "column",
      backgroundColor: "#fff",
      // ❌ ไม่มี drilldown/drillup events แล้ว
    },
    title: {
      text: title,
      style: { fontSize: "20px", fontWeight: 600, color: "#333" },
    },
    subtitle: { text: null },

    xAxis: {
      categories: countries.value,
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
    legend: { align: "center", verticalAlign: "bottom" },
    plotOptions: {
      column: { stacking: "normal", borderWidth: 0 },
      series: { cursor: "default" },
    },
    tooltip: { useHTML: true, formatter: mainTooltipFormatter },
    series: seriesMain.value,

    // ❌ ไม่มี drilldown config แล้ว
    credits: { enabled: false },
  });
};

/* ✅ โหลดครั้งแรก + อัปเดตเมื่อค่าที่เกี่ยวข้องเปลี่ยน (รวม year) */
onMounted(async () => {
  await loadEconomyList();
  await loadData();
});

watch(
  [
    () => exporting.value?.iso,
    () => importing.value?.iso,
    () => sector.value?.sectorID,
    () => year.value,
  ],
  async () => {
    regionName.value = exporting.value?.iso
      ? isoToRegion(exporting.value.iso)
      : "";
    await loadData();
  }
);
</script>

<style lang="scss" scoped>
:deep(#chartBSSingle02 .highcharts-axis-labels text) {
  fill: #333 !important;
  font-weight: 400 !important;
  text-decoration: none !important;
}
</style>
```
