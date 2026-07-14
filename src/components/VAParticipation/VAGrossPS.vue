<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <div class="p-2 text-lg font-bold fblack">
      {{ t("participation.grossAndValueTradeBalance") }}
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
              {{ t("participation.noTrade") }}
            </div>
            <div class="text-sm text-gray-600 mt-0.5 text-center">
              {{ t("backward.charts.tryDifferent") }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row" v-if="isAvail">
      <div class="w-full lg:w-[90%] flex items-center justify-center pt-4">
        <div
          id="chartBSSingle03"
          class="w-full max-w-[1100px] min-h-[500px]"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from "vue";
import axios from "axios";
import { serverSetup } from "../../pages/server";
import { useI18n } from "vue-i18n";

const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
const { t } = useI18n({ useScope: "global" });

/* ---------- reactive inputs ---------- */
const exporting = computed(() => props.inputData?.exporting ?? null);
const importing = computed(() => props.inputData?.importing ?? null);
const sector = computed(() => props.inputData?.sector ?? null);
const year = computed(() => Number(props.inputData?.year) || null);

/* ---------- chart handle ---------- */
let chart = null;
const isAvail = ref(true);

/* ---------- helpers ---------- */
const toPct = (x) => (Number(x) || 0) * 100;
const r1 = (n) => Number((n ?? 0).toFixed(1));

function destroyChart() {
  if (chart) {
    try {
      chart.destroy();
    } catch (e) {}
    chart = null;
  }
}

function tooltipHTML() {
  const y = (this.y ?? 0).toFixed(1);
  const yr = this.point?.custom?.year ?? "";
  return `
    <div style="min-width:240px">
      <div style="font-weight:700">${this.series.name}</div>
      <div>${t("participation.year")}:&nbsp; ${yr}</div>
      <div>${t("participation.share")}:&nbsp; ${y}% ${t("participation.ofBilateral")}</div>
    </div>
  `;
}

/* ---------- draw chart ---------- */
async function drawChart(rows = []) {
  await nextTick(); // container อยู่หลัง v-if="isAvail"
  if (!isAvail.value) return;

  const get = (key) => rows.find((r) => r.variable === key) || {};

  const vatb = get("value_added_trade_balance");
  const gtb = get("gross_trade_balance");
  const yearText = vatb.year || gtb.year || year.value || "";

  const categories = [""];

  const series = [
    {
      name: t("participation.valueAddedTradeBalance"),
      color: "#1E88E5",
      data: [{ y: r1(toPct(vatb.value)), custom: { year: yearText } }],
    },
    {
      name: t("participation.grossTradeBalance"),
      color: "#2E7D6E",
      data: [{ y: r1(toPct(gtb.value)), custom: { year: yearText } }],
    },
  ];

  const title = t("participation.balanceTitle", { exporting: exporting.value.name, sector: String(sector.value?.sectorShortName ?? "").toLowerCase(), importing: importing.value.name });

  const options = {
    chart: { type: "column", backgroundColor: "#fff" },
    title: {
      text: title,
      style: { fontSize: "20px", fontWeight: 600, color: "#333" },
    },
    xAxis: {
      categories,
      tickLength: 0,
      lineColor: "#e5e5e5",
      labels: { enabled: false },
    },
    yAxis: {
      title: { text: t("participation.percentBilateral") },
      gridLineColor: "#eee",
    },
    legend: {
      align: "center",
      verticalAlign: "bottom",
      itemStyle: { color: "#444" },
    },
    tooltip: {
      useHTML: true,
      borderRadius: 6,
      backgroundColor: "#fff",
      shadow: true,
      padding: 8,
      formatter: tooltipHTML,
    },
    plotOptions: {
      column: {
        borderWidth: 0,
        pointPadding: 0.15,
        groupPadding: 0.25,
      },
    },
    credits: { enabled: false },
    series,
  };

  if (chart) {
    // update
    chart.setTitle(options.title);
    while (chart.series.length) chart.series[0].remove(false);
    series.forEach((s) => chart.addSeries(s, false));
    chart.xAxis[0].setCategories(categories, false);
    chart.redraw();
  } else {
    chart = Highcharts.chart("chartBSSingle03", options);
  }
}

/* ---------- load data ---------- */
let requestId = 0;

async function loadData() {
  const myReq = ++requestId;

  if (
    !exporting.value?.iso ||
    !importing.value?.iso ||
    !sector.value?.sectorID ||
    !year.value
  ) {
    isAvail.value = false;
    destroyChart();
    return;
  }

  const payload = {
    exp_country: importing.value.iso,
    imp_country: exporting.value.iso,
    exp_sector: sector.value.sectorID,
    year: [year.value],
  };

  try {
    const { data: rows } = await axios.post(
      `${serverData.value}/va/str_gross_value_added.php`,
      JSON.stringify(payload)
    );

    if (myReq !== requestId) return;

    const arr = Array.isArray(rows) ? rows : [];
    if (arr.filter((x) => Number(x.value) != 0).length === 0) {
      isAvail.value = false;
      destroyChart();
      return;
    }

    isAvail.value = true;
    await drawChart(arr);
  } catch (err) {
    console.error(err);
    isAvail.value = false;
    destroyChart();
  }
}

/* ------------------------ watchers ---------------------- */
// ✅ watcher ตัวเดียว + immediate (ลบ onMounted เพื่อไม่ให้เรียกซ้ำ)
watch(
  () => [
    exporting.value?.iso,
    importing.value?.iso,
    sector.value?.sectorID,
    year.value,
  ],
  async () => {
    await loadData();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  destroyChart();
});
</script>

<style scoped>
.fblack {
  color: #222;
}
</style>
