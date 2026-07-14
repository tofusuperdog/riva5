<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <div class="p-2 text-lg font-bold fblack">{{ t("participation.valueAddedBreakdown") }}</div>
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
      <!-- กราฟ -->
      <div class="w-full flex items-center justify-center pt-4">
        <div
          id="chartBSSingle01"
          class="w-full max-w-[1100px] min-h-[500px]"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import { serverSetup } from "../../pages/server";
import { useI18n } from "vue-i18n";

// ถ้ายังไม่ได้เปิดใช้โมดูล treemap ให้ import/สมัครโมดูลไว้ที่ entry ของแอป
// import Highcharts from "highcharts";
// import HC_Treemap from "highcharts/modules/treemap";
// HC_Treemap(Highcharts);

const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
const { t } = useI18n({ useScope: "global" });
const $q = useQuasar();

/* -------------------- reactive props -------------------- */
const exporting = computed(() => props.inputData?.exporting ?? null);
const importing = computed(() => props.inputData?.importing ?? null);
const sector = computed(() => props.inputData?.sector ?? null);
const year = computed(() => Number(props.inputData?.year) || null);

const exportsToimport = ref(0);
const exportsToWorld = ref(0);
const isAvail = ref(true);

/* --------------------- color/name map ------------------- */
const VAR_MAP = [
  {
    key: "Intermediate_directly_consumed",
    labelKey: "dvaIntermediate",
    color: "#26C6DA",
  },
  { key: "Final_directly_consumed", labelKey: "dvaFinal", color: "#1E88E5" },
  {
    key: "Forward_linkages2",
    labelKey: "dvaBack",
    color: "#FF8A65",
  },
  {
    key: "Forward_linkages",
    labelKey: "dvaThird",
    color: "#EC407A",
  },
  {
    key: "Backward_linkages",
    labelKey: "fva",
    color: "#26A69A",
  },
  {
    key: "Double_counted_exports",
    labelKey: "doubleCounted",
    color: "#8E24AA",
  },
];

/* ----------------------- utilities ---------------------- */
const pct = (x) => (Number(x) || 0) * 100; // 0–1 -> %
const r1 = (n) => Number((n ?? 0).toFixed(1));
const money1 = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} ${t("participation.million")}`;

const convertMB = (n) => {
  const num = Number(n || 0);
  if (num > 1000) return `${(num / 1000).toFixed(1)} ${t("participation.billion")}`;
  return `${num.toFixed(1)} ${t("participation.million")}`;
};

let chart = null;

function destroyChart() {
  if (chart) {
    try {
      chart.destroy();
    } catch (e) {}
    chart = null;
  }
}

/* -------------------- data loading ---------------------- */
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
    exportsToimport.value = 0;
    exportsToWorld.value = 0;
    destroyChart();
    return;
  }

  try {
    const payload = {
      exp_country: exporting.value.iso,
      imp_country: importing.value.iso,
      exp_sector: sector.value.sectorID,
      year: [year.value],
    };

    const { data: rows } = await axios.post(
      `${serverData.value}/va/str_component.php`,
      JSON.stringify(payload)
    );

    if (myReq !== requestId) return;

    const arr = Array.isArray(rows) ? rows : [];
    const checkTotal = arr.filter((x) => Number(x.total_exports) != 0);

    if (checkTotal.length === 0) {
      isAvail.value = false;
      exportsToimport.value = 0;
      exportsToWorld.value = 0;
      destroyChart();
      return;
    }

    isAvail.value = true;

    exportsToimport.value = Number(arr?.[0]?.total_exports || 0);

    const payload2 = {
      exp_country: exporting.value.iso,
      imp_country: "WLD",
      exp_sector: sector.value.sectorID,
      year: [year.value],
    };

    const { data: rows2 } = await axios.post(
      `${serverData.value}/va/str_component.php`,
      JSON.stringify(payload2)
    );

    if (myReq !== requestId) return;

    const arr2 = Array.isArray(rows2) ? rows2 : [];
    exportsToWorld.value = Number(arr2?.[0]?.total_exports || 0);

    const treemapData = normalizeToTreemap(arr);

    await nextTick(); // container อยู่หลัง v-if="isAvail"
    drawTreemap(treemapData);
  } catch (err) {
    console.error(err);
    isAvail.value = false;
    exportsToimport.value = 0;
    exportsToWorld.value = 0;
    destroyChart();
  }
}

/* -------- convert API rows -> Highcharts treemap data --- */
function normalizeToTreemap(rows) {
  const byVar = Object.fromEntries((rows || []).map((r) => [r.var, r]));

  return VAR_MAP.map(({ key, labelKey, color }) => {
    const r = byVar[key] || {};
    const total =
      Number(r.total_exports) || Number(rows?.[0]?.total_exports) || 1;

    const sharePct =
      r.share != null ? pct(r.share) : ((Number(r.value) || 0) / total) * 100;

    const valueMn = Number(r.value) || 0;

    return {
      name: t(`participation.${labelKey}`),
      color,
      value: Number(sharePct.toFixed(3)), // ใช้ % เป็น weight
      dataLabels: { enabled: true },
      custom: {
        year: year.value,
        share: r1(sharePct),
        valueMn,
      },
    };
  });
}

/* ---------------------- draw / update ------------------- */
function drawTreemap(data) {
  const tooltipFormatter = function () {
    const p = this.point;
    return `
      <div style="min-width:220px">
        <div style="font-weight:700">${p.name}</div>
        <div>${t("participation.year")}: ${p.custom.year}</div>
        <div>${t("participation.share")}:&nbsp; ${p.custom.share.toFixed(1)}% ${t("participation.ofGross")}</div>
        <div>${t("participation.value")}:&nbsp; ${money1(p.custom.valueMn)}</div>
      </div>
    `;
  };

  const dataLabelFormatter = function () {
    const p = this.point;
    return `<span style="text-shadow:0 0 2px #000">${
      p.name
    } (${p.custom.share.toFixed(1)}%)</span>`;
  };

  const title = t("participation.productionTitle", { exporting: exporting.value.name, sector: String(sector.value?.sectorShortName ?? "").toLowerCase(), importing: importing.value.name });

  const options = {
    chart: { backgroundColor: "#fff" },
    title: {
      text: title,
      style: { fontSize: "20px", fontWeight: 600, color: "#333" },
    },
    subtitle: {
      text: t("participation.exportsSubtitle", { exporting: exporting.value.name, importing: importing.value.name, partnerValue: convertMB(exportsToimport.value), world: t("participation.world"), worldValue: convertMB(exportsToWorld.value) }),
    },
    tooltip: { useHTML: true, formatter: tooltipFormatter },
    legend: { enabled: true },
    credits: { enabled: false },
    series: [
      {
        type: "treemap",
        layoutAlgorithm: "squarified",
        allowTraversingTree: false,
        animation: true,
        legendType: "point",
        showInLegend: true,
        dataLabels: {
          enabled: true,
          useHTML: true,
          style: { color: "#000", fontWeight: 600, textOutline: "1px" },
          formatter: dataLabelFormatter,
        },
        levels: [
          {
            level: 1,
            dataLabels: {
              enabled: true,
              useHTML: true,
              style: { color: "#fff", fontWeight: 600, textOutline: "0px" },
              formatter: dataLabelFormatter,
            },
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
        data,
      },
    ],
  };

  if (chart) {
    chart.update(options, true, true);
  } else {
    chart = Highcharts.chart("chartBSSingle01", options);
  }
}

/* ------------------------ watchers ---------------------- */
// ✅ ใช้ watcher ตัวเดียว + immediate (และลบ onMounted ออก) เพื่อไม่ให้ยิงซ้ำ
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
