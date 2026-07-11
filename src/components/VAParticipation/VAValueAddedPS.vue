<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <div class="p-2 text-lg font-bold fblack">Value-added breakdown</div>
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

// ถ้ายังไม่ได้เปิดใช้โมดูล treemap ให้ import/สมัครโมดูลไว้ที่ entry ของแอป
// import Highcharts from "highcharts";
// import HC_Treemap from "highcharts/modules/treemap";
// HC_Treemap(Highcharts);

const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
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
    name: "DVA intermediate goods",
    color: "#26C6DA",
  },
  { key: "Final_directly_consumed", name: "DVA final goods", color: "#1E88E5" },
  {
    key: "Forward_linkages2",
    name: "DVA intermediate goods exports back to original exporter",
    color: "#FF8A65",
  },
  {
    key: "Forward_linkages",
    name: "DVA intermediate goods exported to a third economy",
    color: "#EC407A",
  },
  {
    key: "Backward_linkages",
    name: "Foreign Value Added (FVA)",
    color: "#26A69A",
  },
  {
    key: "Double_counted_exports",
    name: "Double-counted value",
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
  })} million`;

const convertMB = (n) => {
  const num = Number(n || 0);
  if (num > 1000) return `${(num / 1000).toFixed(1)} billion`;
  return `${num.toFixed(1)} million`;
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

  return VAR_MAP.map(({ key, name, color }) => {
    const r = byVar[key] || {};
    const total =
      Number(r.total_exports) || Number(rows?.[0]?.total_exports) || 1;

    const sharePct =
      r.share != null ? pct(r.share) : ((Number(r.value) || 0) / total) * 100;

    const valueMn = Number(r.value) || 0;

    return {
      name,
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
        <div>Year: ${p.custom.year}</div>
        <div>Share:&nbsp; ${p.custom.share.toFixed(1)}% of gross exports</div>
        <div>Value:&nbsp; ${money1(p.custom.valueMn)}</div>
      </div>
    `;
  };

  const dataLabelFormatter = function () {
    const p = this.point;
    return `<span style="text-shadow:0 0 2px #000">${
      p.name
    } (${p.custom.share.toFixed(1)}%)</span>`;
  };

  const title = `How have ${exporting.value.name}'s exports of ${String(
    sector.value?.sectorShortName ?? ""
  ).toLowerCase()} to ${importing.value.name} been produced and utilized?`;

  const options = {
    chart: { backgroundColor: "#fff" },
    title: {
      text: title,
      style: { fontSize: "20px", fontWeight: 600, color: "#333" },
    },
    subtitle: {
      text: `${exporting.value.name}'s gross exports to ${
        importing.value.name
      }: $${convertMB(exportsToimport.value)} | ${
        exporting.value.name
      }'s gross exports to World: $${convertMB(exportsToWorld.value)}.`,
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
