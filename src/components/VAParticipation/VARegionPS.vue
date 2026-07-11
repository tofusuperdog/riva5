<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <div class="p-2 text-lg font-bold fblack">
      Structure of value added in {{ showRegion }}
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

    <div class="flex flex-col lg:flex-row" v-if="isAvail">
      <div class="w-full flex items-center justify-center pt-4">
        <div
          id="chartBSSingle02"
          class="w-full max-w-[1100px] min-h-[500px]"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  nextTick,
  onBeforeUnmount,
} from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import { serverSetup } from "../../pages/server";

// ===== Props / Server =====
const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
const $q = useQuasar();

// ===== Derive state from props (กัน stale refs) =====
const exporting = computed(() => props.inputData?.exporting);
const importing = computed(() => props.inputData?.importing);
const sector = computed(() => props.inputData?.sector);
const year = computed(() => Number(props.inputData?.year) || null);

// ===== UI State =====
const isAvail = ref(true);
const economyList = ref([]);
const showRegion = ref("");
let chart = null;

// ===== Mapping (ชื่อและสีให้คงที่) =====
const VAR_MAP = [
  {
    key: "Intermediate_directly_consumed",
    shortKey: "intermediate",
    name: "DVA intermediate goods",
    color: "#26C6DA",
  },
  {
    key: "Final_directly_consumed",
    shortKey: "final",
    name: "DVA final goods",
    color: "#1E88E5",
  },
  {
    key: "Forward_linkages2",
    shortKey: "forward2",
    name: "DVA intermediate goods exports back to original exporter",
    color: "#FF8A65",
  },
  {
    key: "Forward_linkages",
    shortKey: "forward",
    name: "DVA intermediate goods exported to a third economy",
    color: "#EC407A",
  },
  {
    key: "Backward_linkages",
    shortKey: "fva",
    name: "Foreign Value Added (FVA)",
    color: "#26A69A",
  },
  {
    key: "Double_counted_exports",
    shortKey: "double",
    name: "Double-counted value",
    color: "#8E24AA",
  },
];

// ===== Utils =====
const pct = (x) => (Number(x) || 0) * 100;
const money1 = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} million`;

const isoToName = (iso) =>
  economyList.value.find((d) => d.iso === iso)?.name || iso;

function destroyChart() {
  if (chart) {
    try {
      chart.destroy();
    } catch (e) {
      // ignore
    }
    chart = null;
  }
}

// ===== Economy list loader (with gate) =====
let ecoLoadingPromise = null;

async function loadEconomyList() {
  const res = await axios.get(`${serverData.value}/va/get_eco_not_group.php`);
  economyList.value = (res.data || []).map((d) => ({
    iso: d.iso,
    name: d.economic,
    region: d.region,
  }));
}

async function ensureEconomyList() {
  if (economyList.value.length) return;
  if (!ecoLoadingPromise) ecoLoadingPromise = loadEconomyList();
  await ecoLoadingPromise;
}

// ===== Data load (with race guard) =====
let requestId = 0;

async function loadData() {
  const myReq = ++requestId;

  // กันกรณี props ยังไม่มา
  if (!exporting.value || !importing.value || !sector.value || !year.value) {
    isAvail.value = false;
    destroyChart();
    showRegion.value = "";
    return;
  }

  await ensureEconomyList();
  if (myReq !== requestId) return;

  let finalResult = [];

  try {
    if (exporting.value.id == 0) {
      const payload2 = {
        ecoGroup: exporting.value.name,
        imp_country: importing.value.iso,
        exp_sector: sector.value.sectorID,
        year: [year.value],
      };

      const { data: rowsx } = await axios.post(
        `${serverData.value}/va/str_component_region_from_region.php`,
        JSON.stringify(payload2)
      );
      if (myReq !== requestId) return;

      const checkTotal = (rowsx || []).filter(
        (x) => Number(x.total_exports) != 0
      );
      if (checkTotal.length === 0) {
        isAvail.value = false;
        destroyChart();
        return;
      }

      isAvail.value = true;

      // ตัดตัวเองออก
      finalResult = (rowsx || []).filter(
        (d) => d.exp_country != importing.value.iso
      );
    } else {
      const payload = {
        exp_country: exporting.value.iso,
        imp_country: importing.value.iso,
        exp_sector: sector.value.sectorID,
        year: [year.value],
      };

      const { data: rows } = await axios.post(
        `${serverData.value}/va/str_component_region.php`,
        JSON.stringify(payload)
      );
      if (myReq !== requestId) return;

      const checkTotal = (rows || []).filter(
        (x) => Number(x.total_exports) != 0
      );
      if (checkTotal.length === 0) {
        isAvail.value = false;
        destroyChart();
        return;
      }

      isAvail.value = true;

      // ตัดตัวเองออก
      finalResult = (rows || []).filter(
        (d) => d.exp_country != importing.value.iso
      );
    }

    if (myReq !== requestId) return;

    // 1) แปลงเป็น rawData
    const rawData = (finalResult || []).map((d) => ({
      country: isoToName(d.exp_country),
      var: d.var,
      valueMn: Number(d.value || 0),
      sharePct: pct(d.share), // 0-1 -> %
    }));

    // 2) group ตามประเทศ -> var
    const countries = Array.from(new Set(rawData.map((d) => d.country)));
    const byCountry = {};
    countries.forEach((c) => (byCountry[c] = {}));
    rawData.forEach((r) => {
      byCountry[r.country][r.var] = {
        sharePct: r.sharePct,
        valueMn: r.valueMn,
      };
    });

    // 3) สร้าง series ตาม VAR_MAP (คงลำดับ)
    const series = VAR_MAP.map((cfg) => {
      const data = countries.map((c) => {
        const rec = byCountry[c][cfg.key] || { sharePct: 0, valueMn: 0 };
        return {
          y: Number((rec.sharePct || 0).toFixed(1)),
          custom: { country: c, valueMn: rec.valueMn || 0 },
        };
      });
      return { name: cfg.name, color: cfg.color, data };
    });

    await drawChart(countries, series);
  } catch (err) {
    // ถ้ามี error ให้ไม่พังกราฟ/หน้า
    console.error(err);
    isAvail.value = false;
    destroyChart();
  }
}

// ===== Chart =====
async function drawChart(categories, series) {
  // container อยู่หลัง v-if ดังนั้นต้องรอ DOM
  await nextTick();

  // ถ้า data บอกว่าไม่ available แล้ว container ไม่อยู่ ก็ไม่ต้องทำต่อ
  if (!isAvail.value) return;

  // กันกรณี Highcharts ยังไม่ถูกโหลด
  if (typeof Highcharts === "undefined") {
    console.error(
      "Highcharts is not available (global Highcharts is undefined)."
    );
    return;
  }

  // หา region (กัน undefined ด้วย fallback)
  let myRegion = "";
  if (exporting.value.id == 0) {
    myRegion = exporting.value.name;
  } else {
    myRegion =
      economyList.value.find((d) => d.iso === exporting.value.iso)?.region ||
      exporting.value.name ||
      exporting.value.iso ||
      "";
  }

  showRegion.value = myRegion;

  const title = `How have ${myRegion} economies' exports of ${String(
    sector.value.sectorShortName || ""
  ).toLowerCase()} to ${importing.value.name} produced and utilized?`;

  // ถ้ามี chart อยู่แล้ว update ได้เลย
  if (chart) {
    chart.update(
      {
        title: { text: title },
        xAxis: { categories },
        yAxis: {
          title: {
            text: `Percent of gross exports to ${importing.value.name}`,
          },
        },
        series,
      },
      true,
      true
    );
    return;
  }

  // สร้างใหม่
  chart = Highcharts.chart("chartBSSingle02", {
    chart: { type: "column", backgroundColor: "#fff" },
    title: {
      text: title,
      style: { fontSize: "20px", fontWeight: 600, color: "#333" },
    },
    xAxis: { categories, tickLength: 0, lineColor: "#e5e5e5" },
    yAxis: {
      min: 0,
      max: 100,
      title: { text: `Percent of gross exports to ${importing.value.name}` },
      labels: {
        formatter() {
          return this.value + "%";
        },
      },
      gridLineColor: "#eee",
    },
    legend: { align: "center", verticalAlign: "bottom" },
    tooltip: {
      useHTML: true,
      formatter() {
        const p = this.point;
        return `
          <div style="min-width:200px">
            <div style="font-weight:700">${p.custom.country}</div>
            <div>${this.series.name}</div>
            <div>Share: ${p.y.toFixed(1)}% of gross exports to ${
          importing.value.name
        }</div>
            <div>Value: ${money1(p.custom.valueMn)}</div>
          </div>`;
      },
    },
    plotOptions: {
      column: {
        stacking: "normal",
        borderWidth: 0,
        groupPadding: 0.12,
        pointPadding: 0.02,
      },
    },
    credits: { enabled: false },
    series,
  });
}

// ===== Watchers =====
// watcher ตัวเดียว: เปลี่ยน input เมื่อไหร่ โหลดใหม่เมื่อนั้น
watch(
  () => [
    props.inputData?.exporting,
    props.inputData?.importing,
    props.inputData?.sector,
    props.inputData?.year,
  ],
  async () => {
    await loadData();
  },
  { deep: true, immediate: true }
);

// ===== Mount =====
onMounted(async () => {
  // ไม่ต้องเรียก loadData ซ้ำ เพราะ watcher immediate ทำให้แล้ว
  // แต่ preload economyList ไว้ตั้งแต่ mount ได้เพื่อให้ไวขึ้น
  try {
    await ensureEconomyList();
  } catch (e) {
    console.error(e);
  }
});

onBeforeUnmount(() => {
  destroyChart();
});
</script>

<style scoped>
.fblack {
  color: #222;
}
</style>
